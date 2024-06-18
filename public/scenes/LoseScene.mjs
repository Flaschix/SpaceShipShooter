import { CST } from "../CST.mjs";

export class LoseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoseScene' });
    }

    preload() {
        this.load.image('loseScreen', 'assets/lose_screen.png');
        this.load.image('startAgainButton', 'assets/start_again.png');
    }

    create() {
        // Добавляем изображение фона и центрируем его
        let background = this.add.image(0, 0, 'loseScreen').setOrigin(0.5, 0.5);
        background.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);

        // Масштабируем изображение фона, чтобы оно занимало весь экран
        let scaleX = this.cameras.main.width / background.width;
        let scaleY = this.cameras.main.height / background.height;
        let scale = Math.max(scaleX, scaleY);
        background.setScale(scale);

        // Добавляем кнопку "Начать заново"
        let startAgainButton = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'startAgainButton');
        startAgainButton.setInteractive();

        // Обработчик нажатия на кнопку
        startAgainButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Масштабируем кнопку
        startAgainButton.setScale(0.2 * this.cameras.main.width / startAgainButton.width, 0.1 * this.cameras.main.height / startAgainButton.height);
    }
}