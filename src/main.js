import Phaser from 'phaser'
import { CONFIG } from './config.js'
import { BootScene } from './scenes/BootScene.js'
import { PermissionScene } from './scenes/PermissionScene.js'
import { GameScene } from './scenes/GameScene.js'
import { GameOverScene } from './scenes/GameOverScene.js'

const config = {
    type: Phaser.AUTO,
    width: CONFIG.GAME_WIDTH,
    height: CONFIG.GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: CONFIG.GRAVITY },
            debug: false
        }
    },
    scene: [BootScene, PermissionScene, GameScene, GameOverScene]
}

new Phaser.Game(config)
