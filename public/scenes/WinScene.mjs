import { CST } from "../CST.mjs";

export class WinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScene' });
    }

    preload() {
        this.load.image('winScreen', 'assets/win_screen.png');
    }

    create() {
        // Добавляем изображение фона и центрируем его
        let background = this.add.image(0, 0, 'winScreen').setOrigin(0.5, 0.5);
        background.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);

        // Масштабируем изображение фона, чтобы оно занимало весь экран
        let scaleX = this.cameras.main.width / background.width;
        let scaleY = this.cameras.main.height / background.height;
        let scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
    }
}