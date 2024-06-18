import { CST } from "../CST.mjs";

export class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        this.load.image('playButton', 'assets/play.png');
        this.load.image('startScreen', 'assets/start_screen.png'); // Загрузка изображения фона
    }

    create() {
        // Добавляем изображение фона и центрируем его
        let background = this.add.image(0, 0, 'startScreen').setOrigin(0.5, 0.5);
        background.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);

        // Масштабируем изображение фона, чтобы оно занимало весь экран
        let scaleX = this.cameras.main.width / background.width;
        let scaleY = this.cameras.main.height / background.height;
        let scale = Math.max(scaleX, scaleY);
        background.setScale(scale);

        // Добавляем кнопку "Начать игру"
        let playButton = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'playButton');
        playButton.setInteractive();

        // Обработчик нажатия на кнопку
        playButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Масштабируем кнопку
        playButton.setScale(0.2 * this.cameras.main.width / playButton.width, 0.1 * this.cameras.main.height / playButton.height);
    }
}