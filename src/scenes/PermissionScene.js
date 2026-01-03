import Phaser from 'phaser'
import { FaceDetector } from '../faceDetector.js'

export class PermissionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PermissionScene' })
    }

    create() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height

        // Title
        this.add.text(width / 2, 120, '🦖 DINO JUMP', {
            fontFamily: '"Press Start 2P"',
            fontSize: '28px',
            fill: '#FFD700',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5)

        // Subtitle
        this.add.text(width / 2, 170, 'Mouth Control Edition', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            fill: '#ffffff'
        }).setOrigin(0.5)

        // Instructions
        const instructions = [
            '👄 OPEN mouth → JUMP',
            '👄 CLOSE mouth → FALL',
            '',
            'Avoid the obstacles!'
        ]

        instructions.forEach((text, i) => {
            this.add.text(width / 2, 250 + i * 35, text, {
                fontFamily: '"Press Start 2P"',
                fontSize: '10px',
                fill: '#ffffff'
            }).setOrigin(0.5)
        })

        // Status text
        this.statusText = this.add.text(width / 2, 450, 'Tap to enable camera', {
            fontFamily: '"Press Start 2P"',
            fontSize: '11px',
            fill: '#FFD700'
        }).setOrigin(0.5)

        // Start button
        const startBtn = this.add.rectangle(width / 2, 530, 200, 60, 0x4CAF50)
            .setInteractive({ useHandCursor: true })

        const startText = this.add.text(width / 2, 530, 'START', {
            fontFamily: '"Press Start 2P"',
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0.5)

        // Button hover effects
        startBtn.on('pointerover', () => startBtn.setFillStyle(0x66BB6A))
        startBtn.on('pointerout', () => startBtn.setFillStyle(0x4CAF50))

        startBtn.on('pointerdown', async () => {
            startBtn.disableInteractive()
            this.statusText.setText('Initializing camera...')

            try {
                // Initialize face detector
                const faceDetector = new FaceDetector()
                await faceDetector.init()

                this.statusText.setText('Camera ready! Starting...')

                // Store in registry for game scene to access
                this.registry.set('faceDetector', faceDetector)
                this.registry.set('useFaceControl', true)

                this.time.delayedCall(500, () => {
                    this.scene.start('GameScene')
                })

            } catch (error) {
                console.error('Camera init failed:', error)
                this.statusText.setText('Camera denied.\nTap to play with touch.')
                this.registry.set('useFaceControl', false)

                startBtn.setInteractive()
                startText.setText('TAP MODE')

                startBtn.once('pointerdown', () => {
                    this.scene.start('GameScene')
                })
            }
        })
    }
}
