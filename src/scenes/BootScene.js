import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width
        const height = this.cameras.main.height

        const progressBar = this.add.graphics()
        const progressBox = this.add.graphics()
        progressBox.fillStyle(0x222222, 0.8)
        progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 25, 320, 50, 10)

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            fill: '#ffffff'
        }).setOrigin(0.5)

        // Loading progress
        this.load.on('progress', (value) => {
            progressBar.clear()
            progressBar.fillStyle(0xFFD700, 1)
            progressBar.fillRoundedRect(width / 2 - 150, height / 2 - 15, 300 * value, 30, 8)
        })

        this.load.on('complete', () => {
            progressBar.destroy()
            progressBox.destroy()
            loadingText.destroy()
        })

        // Load SVG assets
        this.load.svg('dino-run-1', 'assets/char-foot-left.svg', { width: 80, height: 60 })
        this.load.svg('dino-run-2', 'assets/char-foot-right.svg', { width: 80, height: 60 })
        this.load.svg('dino-jump', 'assets/char-jump.svg', { width: 80, height: 60 })
        this.load.svg('dino-duck', 'assets/char-duck.svg', { width: 80, height: 40 })
        this.load.svg('dino-hit', 'assets/char-hit-obstacle.svg', { width: 60, height: 60 })
        this.load.svg('obstacle-broccoli', 'assets/obstacle-brocolly.svg', { width: 40, height: 30 })
        this.load.svg('obstacle-milk', 'assets/obstacle-milk.svg', { width: 40, height: 50 })
        this.load.svg('ground', 'assets/ground.svg', { width: 100, height: 20 })
    }

    create() {
        this.scene.start('PermissionScene')
    }
}
