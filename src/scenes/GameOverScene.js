import Phaser from 'phaser'

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' })
    }

    init(data) {
        this.finalScore = data.score || 0
    }

    create() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height

        // Hide camera feed
        document.getElementById('camera-container').classList.add('hidden')

        // Dark overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)

        // Game Over text
        this.add.text(width / 2, height / 2 - 100, 'GAME OVER', {
            fontFamily: '"Press Start 2P"',
            fontSize: '32px',
            fill: '#FF6B6B',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5)

        // Dino hurt sprite
        this.add.image(width / 2, height / 2 - 20, 'dino-hit').setScale(2)

        // Score
        this.add.text(width / 2, height / 2 + 60, `SCORE: ${this.finalScore}`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            fill: '#FFD700'
        }).setOrigin(0.5)

        // High score (simple localStorage)
        const highScore = parseInt(localStorage.getItem('dinoHighScore') || '0')
        const newHighScore = Math.max(highScore, this.finalScore)
        localStorage.setItem('dinoHighScore', newHighScore.toString())

        if (this.finalScore >= highScore && this.finalScore > 0) {
            this.add.text(width / 2, height / 2 + 100, '🎉 NEW HIGH SCORE! 🎉', {
                fontFamily: '"Press Start 2P"',
                fontSize: '10px',
                fill: '#4CAF50'
            }).setOrigin(0.5)
        }

        this.add.text(width / 2, height / 2 + 130, `BEST: ${newHighScore}`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            fill: '#aaaaaa'
        }).setOrigin(0.5)

        // Restart button
        const restartBtn = this.add.rectangle(width / 2, height / 2 + 200, 200, 60, 0x4CAF50)
            .setInteractive({ useHandCursor: true })

        this.add.text(width / 2, height / 2 + 200, 'RESTART', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            fill: '#ffffff'
        }).setOrigin(0.5)

        restartBtn.on('pointerover', () => restartBtn.setFillStyle(0x66BB6A))
        restartBtn.on('pointerout', () => restartBtn.setFillStyle(0x4CAF50))

        restartBtn.on('pointerdown', () => {
            this.scene.start('GameScene')
        })

        // Go to menu button
        const menuBtn = this.add.rectangle(width / 2, height / 2 + 280, 160, 40, 0x666666)
            .setInteractive({ useHandCursor: true })

        this.add.text(width / 2, height / 2 + 280, 'MENU', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            fill: '#ffffff'
        }).setOrigin(0.5)

        menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x888888))
        menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x666666))

        menuBtn.on('pointerdown', () => {
            this.scene.start('PermissionScene')
        })
    }
}
