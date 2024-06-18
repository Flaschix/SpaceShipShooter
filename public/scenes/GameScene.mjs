import { CST } from "../CST.mjs";

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('map', 'assets/map/map.png');
        this.load.image('player', 'assets/character/character.png');
        this.load.image('bullet', 'assets/character/bullet.png');
        this.load.image('asteroid', 'assets/asteroid/asteroid.png'); // Загрузка изображения астероида
    }

    create() {
        // Добавляем карту и центрируем её
        let map = this.add.image(0, 0, 'map').setOrigin(0.5, 0.5);
        map.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);

        // Масштабируем карту, чтобы она занимала весь экран
        let scaleX = this.cameras.main.width / map.width;
        let scaleY = this.cameras.main.height / map.height;
        let scale = Math.max(scaleX, scaleY);
        map.setScale(scale);

        // Добавляем игрока у нижнего края и масштабируем его до 10% от игрового поля
        let player = this.physics.add.sprite(this.cameras.main.width / 2, this.cameras.main.height, 'player');
        player.setOrigin(0.5, 1); // Устанавливаем точку привязки к центру по горизонтали и нижнему краю по вертикали
        player.setScale(0.1 * this.cameras.main.width / player.width, 0.1 * this.cameras.main.height / player.height);
        player.setCollideWorldBounds(true);

        // Настраиваем управление
        let cursors = this.input.keyboard.createCursorKeys();
        let fireButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        // Создаем группу снарядов
        let bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: -1 // Устанавливаем maxSize в -1 для бесконечного количества пуль
        });

        // Создаем группу астероидов
        let asteroids = this.physics.add.group({
            defaultKey: 'asteroid',
            maxSize: -1 // Устанавливаем maxSize в -1 для бесконечного количества астероидов
        });

        // Начальные параметры для спавна и скорости астероидов
        let initialAsteroidSpeed = 200;
        let initialSpawnDelay = 1000;
        let minSpawnDelay = 200; // Минимальный интервал спавна
        let maxAsteroidSpeed = 600; // Максимальная скорость астероидов

        // Настраиваем таймер для создания астероидов
        let asteroidTimer = this.time.addEvent({
            delay: initialSpawnDelay, // Интервал в миллисекундах
            callback: createAsteroid,
            callbackScope: this,
            loop: true
        });

        // Добавляем коллайдер между пулями и астероидами
        this.physics.add.collider(bullets, asteroids, destroyBulletAndAsteroid, null, this);

        // Добавляем коллайдер между игроком и астероидами
        this.physics.add.collider(player, asteroids, hitAsteroid, null, this);

        // Создаем текстовый объект для отображения жизней
        let lives = 3; // Количество жизней
        let livesText = this.add.text(this.cameras.main.width * 0.85, this.cameras.main.height * 0.05, 'Lives: ' + lives, {
            fontSize: '32px',
            fill: '#fff'
        });
        livesText.setOrigin(0.5, 0.5);
        livesText.setScale(0.15 * this.cameras.main.width / livesText.width, 0.1 * this.cameras.main.height / livesText.height);

        // Создаем текстовый объект для отображения счётчика расстояния
        let distance = 0; // Счётчик расстояния
        let distanceText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height * 0.05, 'Distance: ' + distance + 'm', {
            fontSize: '32px',
            fill: '#000' // Изменяем цвет текста на чёрный
        });
        distanceText.setOrigin(0.5, 0.5);
        distanceText.setScale(0.1 * this.cameras.main.width / distanceText.width, 0.1 * this.cameras.main.height / distanceText.height);

        function fireBullet() {
            let bullet = bullets.create(player.x, player.y - player.displayHeight, 'bullet');

            if (bullet) {
                bullet.setActive(true);
                bullet.setVisible(true);
                bullet.setScale(0.2 * player.displayWidth / bullet.width, 0.1 * player.displayHeight / bullet.height);
                bullet.body.velocity.y = -500;

                // Удаляем снаряд, когда он выходит за пределы экрана
                bullet.checkWorldBounds = true;
                bullet.outOfBoundsKill = true;
            }
        }

        function createAsteroid() {
            let x = Phaser.Math.Between(0, this.cameras.main.width);
            let asteroid = asteroids.create(x, 0, 'asteroid');

            if (asteroid) {
                asteroid.setActive(true);
                asteroid.setVisible(true);

                // Случайный размер астероида
                let minScale = 0.05; // Минимальный масштаб
                let maxScale = 0.2; // Максимальный масштаб
                let scale = Phaser.Math.FloatBetween(minScale, maxScale);
                asteroid.setScale(scale * this.cameras.main.width / asteroid.width, scale * this.cameras.main.height / asteroid.height);

                // Увеличиваем скорость астероидов в зависимости от пройденного расстояния
                let speedIncrease = (distance / 1000) * (maxAsteroidSpeed - initialAsteroidSpeed);
                asteroid.body.velocity.y = Math.max(initialAsteroidSpeed + speedIncrease, maxAsteroidSpeed);

                // Удаляем астероид, когда он выходит за пределы экрана
                asteroid.checkWorldBounds = true;
                asteroid.outOfBoundsKill = true;
            }
        }

        function destroyBulletAndAsteroid(bullet, asteroid) {
            bullet.destroy();
            asteroid.destroy();
        }

        function hitAsteroid(player, asteroid) {
            asteroid.destroy();
            lives--;

            // Обновляем текстовый объект для отображения жизней
            livesText.setText('Lives: ' + lives);

            if (lives <= 0) {
                // Если жизни закончились, завершаем игру
                this.physics.pause();
                player.setTint(0xff0000);
                player.anims.play('turn');
                this.scene.start('LoseScene'); // Переключаемся на сцену поражения
            }
        }

        this.update = function () {
            // Управление игроком с помощью клавиатуры
            if (cursors.left.isDown) {
                player.setVelocityX(-300);
            } else if (cursors.right.isDown) {
                player.setVelocityX(300);
            } else {
                player.setVelocityX(0);
            }

            // Стрельба
            if (Phaser.Input.Keyboard.JustDown(fireButton)) {
                fireBullet();
            }

            // Обновляем счётчик расстояния
            distance += 1; // Увеличиваем счётчик на 1 (можно настроить по-другому)
            distanceText.setText('Distance: ' + distance + 'm');

            // Уменьшаем интервал спавна астероидов в зависимости от пройденного расстояния
            let newDelay = initialSpawnDelay - (distance / 10);
            asteroidTimer.delay = Math.max(newDelay, minSpawnDelay);

            // Проверяем, достиг ли игрок 2000 метров
            if (distance >= 2000) {
                this.scene.start('WinScene'); // Переключаемся на сцену победы
            }
        };
    }
}