import { CST } from "../CST.mjs";

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('map', 'assets/map/map.png');
        this.load.image('player', 'assets/character/Spaceship.png');
        this.load.image('bullet', 'assets/character/laser.png');
        this.load.image('asteroid', 'assets/asteroid/asteroid.png'); // Загрузка изображения астероида
        this.load.image('asteroid1', 'assets/asteroid/1.png');
        this.load.image('asteroid2', 'assets/asteroid/2.png');
        this.load.image('asteroid3', 'assets/asteroid/3.png');
        this.load.image('asteroid4', 'assets/asteroid/4.png');
        this.load.image('asteroid5', 'assets/asteroid/5.png');
        this.load.image('explosion', 'assets/explosion.png'); // Загрузка изображения взрыва
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

        // Добавляем игрока у левого края и масштабируем его до 10% от игрового поля
        let player = this.physics.add.sprite(200, this.cameras.main.height / 2, 'player');
        player.setOrigin(0.5, 0.5); // Устанавливаем точку привязки к левому краю и центру по вертикали
        player.setScale(0.13 * this.cameras.main.width / player.width, 0.22 * this.cameras.main.height / player.height);
        player.setCollideWorldBounds(true);
        player.body.immovable = true

        // Настраиваем управление
        let cursors = this.input.keyboard.createCursorKeys();
        let fireButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        let collisionWidth = player.width * 0.55; // 80% от ширины спрайта
        let collisionHeight = player.height * 0.3; // 80% от высоты спрайта

        player.body.setSize(collisionWidth, collisionHeight);
        player.body.setOffset(690, 720);



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

        let explosions = this.physics.add.group({
            defaultKey: 'explosion',
            maxSize: -1 // Устанавливаем maxSize в -1 для бесконечного количества взрывов
        });

        // Начальные параметры для спавна и скорости астероидов
        let initialAsteroidSpeed = -200;
        let initialSpawnDelay = 1000;
        let minSpawnDelay = 200; // Минимальный интервал спавна
        let maxAsteroidSpeed = -600; // Максимальная скорость астероидов

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

        // Создаем текстовый объект для отображения оставшегося времени
        let timeLeft = 120; // Время в секундах
        let timeText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height * 0.05, 'Time: ' + timeLeft + 's', {
            fontSize: '32px',
            fill: '#fff' // Изменяем цвет текста на чёрный
        });
        timeText.setOrigin(0.5, 0.5);
        timeText.setScale(0.15 * this.cameras.main.width / timeText.width, 0.1 * this.cameras.main.height / timeText.height);



        // Таймер для обновления времени
        let gameTimer = this.time.addEvent({
            delay: 1000, // Интервал в миллисекундах (1 секунда)
            callback: updateTime,
            callbackScope: this,
            loop: true
        });


        function fireBullet() {
            let bullet = bullets.create(player.x + player.displayWidth / 2, player.y, 'bullet');

            if (bullet) {
                bullet.setActive(true);
                bullet.setVisible(true);
                bullet.setScale(0.2 * player.displayWidth / bullet.width, 0.05 * player.displayHeight / bullet.height);
                bullet.body.velocity.x = 500;

                // Удаляем снаряд, когда он выходит за пределы экрана
                bullet.checkWorldBounds = true;
                bullet.outOfBoundsKill = true;
            }
        }

        function createAsteroid() {
            let asteroidType = Phaser.Math.Between(1, 5)
            // let asteroidType = 5

            let y = Phaser.Math.Between(0, this.cameras.main.height);
            let asteroid = asteroids.create(this.cameras.main.width, y, `asteroid${asteroidType}`);

            if (asteroid) {
                asteroid.setActive(true);
                asteroid.setVisible(true);

                // Случайный размер астероида
                let minScale = 0.05; // Минимальный масштаб
                let maxScale = 0.2; // Максимальный масштаб
                let scale = Phaser.Math.FloatBetween(minScale, maxScale);
                asteroid.setScale(scale * this.cameras.main.width / asteroid.width, scale * this.cameras.main.height / asteroid.height);

                // Увеличиваем скорость астероидов в зависимости от оставшегося времени
                let speedIncrease = ((120 - timeLeft) / 120) * (maxAsteroidSpeed - initialAsteroidSpeed);
                asteroid.body.velocity.x = Math.max(initialAsteroidSpeed + speedIncrease, maxAsteroidSpeed);

                let colWidth
                let colHeight

                switch (asteroidType) {
                    case 1:
                        colWidth = asteroid.width * 0.4; // 80% от ширины спрайта
                        colHeight = asteroid.height * 0.55; // 80% от высоты спрайта

                        asteroid.body.setSize(colWidth, colHeight);
                        asteroid.body.setOffset(asteroid.width * 0.33, asteroid.height * 0.2);
                        break;
                    case 2:
                        colWidth = asteroid.width * 0.55; // 80% от ширины спрайта
                        colHeight = asteroid.height * 0.60; // 80% от высоты спрайта

                        asteroid.body.setSize(colWidth, colHeight);
                        asteroid.body.setOffset(asteroid.width * 0.2, asteroid.height * 0.14);
                        break;
                    case 3:
                        colWidth = asteroid.width * 0.75; // 80% от ширины спрайта
                        colHeight = asteroid.height * 0.60; // 80% от высоты спрайта

                        asteroid.body.setSize(colWidth, colHeight);
                        asteroid.body.setOffset(asteroid.width * 0.15, asteroid.height * 0.2);
                        break;
                    case 4:
                        colWidth = asteroid.width * 0.55; // 80% от ширины спрайта
                        colHeight = asteroid.height * 0.45; // 80% от высоты спрайта

                        asteroid.body.setSize(colWidth, colHeight);
                        asteroid.body.setOffset(asteroid.width * 0.2, asteroid.height * 0.18);
                        break;
                    case 5:
                        colWidth = asteroid.width * 0.70; // 80% от ширины спрайта
                        colHeight = asteroid.height * 0.85; // 80% от высоты спрайта

                        asteroid.body.setSize(colWidth, colHeight);
                        asteroid.body.setOffset(asteroid.width * 0.18, asteroid.height * 0.08);
                        break;
                }

                // Удаляем астероид, когда он выходит за пределы экрана
                asteroid.checkWorldBounds = true;
                asteroid.outOfBoundsKill = true;
            }
        }

        function createExplosion(x, y, width, height) {
            let explosion = explosions.create(x, y, 'explosion');

            if (explosion) {
                explosion.setActive(true);
                explosion.setVisible(true);
                explosion.setScale(width / explosion.width * 1.2, height / explosion.height * 0.8);

                // Удаляем взрыв через некоторое время
                this.time.delayedCall(500, () => {
                    explosion.destroy();
                });
            }
        }


        function destroyBulletAndAsteroid(bullet, asteroid) {
            createExplosion.call(this, bullet.x, bullet.y, asteroid.displayWidth, asteroid.displayHeight); // Вызов функции взрыва с размерами астероида
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

        function updateTime() {
            timeLeft--;
            timeText.setText('Time: ' + timeLeft + 's');

            if (timeLeft <= 0) {
                // Если время закончилось, завершаем игру
                this.scene.start('WinScene'); // Переключаемся на сцену победы
            }
        }

        this.update = function () {
            // Управление игроком с помощью клавиатуры
            if (cursors.up.isDown) {
                player.setVelocityY(-300);
            } else if (cursors.down.isDown) {
                player.setVelocityY(300);
            } else {
                player.setVelocityY(0);
            }

            // Стрельба
            if (Phaser.Input.Keyboard.JustDown(fireButton)) {
                fireBullet();
            }

            // // Обновляем счётчик расстояния
            // distance += 1; // Увеличиваем счётчик на 1 (можно настроить по-другому)
            // distanceText.setText('Distance: ' + distance + 'm');

            // Уменьшаем интервал спавна астероидов в зависимости от пройденного расстояния
            let newDelay = initialSpawnDelay - ((120 - timeLeft) / 120) * (initialSpawnDelay - minSpawnDelay);
            asteroidTimer.delay = Math.max(newDelay, minSpawnDelay);
        };
    }
}