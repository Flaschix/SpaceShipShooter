/** @type {import("../typings/phaser")} */
import { StartScene } from "./scenes/StartScene.mjs";
import { GameScene } from "./scenes/GameScene.mjs";
import { LoseScene } from "./scenes/LoseScene.mjs";
import { WinScene } from "./scenes/WinScene.mjs";

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            // debug: true
        }
    },
    scene: [StartScene, GameScene, LoseScene, WinScene]
};

const game = new Phaser.Game(config);