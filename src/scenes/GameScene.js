import Phaser from 'phaser'
import { CONFIG } from '../config.js'

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' })
    }

    init() {
        this.score = 0
        this.isGameOver = false
        this.isPaused = false
        this.countdown = CONFIG.COUNTDOWN_SECONDS
        this.gameStarted = false
        this.prevMouthState = 'CLOSED'
        this.jumpLocked = false
        this.isDucking = false
    }

    create() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height

        // Get face detector from registry
        this.useFaceControl = this.registry.get('useFaceControl')
        if (this.useFaceControl) {
            this.faceDetector = this.registry.get('faceDetector')
            // Show camera feed
            document.getElementById('camera-container').classList.remove('hidden')
        }

        // Sky gradient background
        const sky = this.add.graphics()
        sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xE0F7FA, 0xE0F7FA, 1)
        sky.fillRect(0, 0, width, height - CONFIG.GROUND_HEIGHT)

        // Ground
        this.groundGroup = this.physics.add.staticGroup()
        const groundY = height - CONFIG.GROUND_HEIGHT / 2
        for (let x = 0; x < width + 200; x += 100) {
            const tile = this.add.image(x, groundY, 'ground').setScale(1, 5)
            this.groundGroup.add(tile)
        }

        // Scrolling ground layer
        this.groundTiles = this.add.tileSprite(
            width / 2,
            height - 30,
            width,
            60,
            'ground'
        ).setScale(1, 3)

        // Create invisible ground collider
        const groundCollider = this.add.rectangle(
            width / 2,
            height - CONFIG.GROUND_HEIGHT / 2,
            width,
            CONFIG.GROUND_HEIGHT,
            0x8D6E63
        )
        this.physics.add.existing(groundCollider, true)
        this.groundCollider = groundCollider

        // Dino character
        this.dino = this.physics.add.sprite(
            CONFIG.DINO_START_X,
            height - CONFIG.GROUND_HEIGHT - 50,
            'dino-run-1'
        )
        this.dino.setScale(CONFIG.DINO_SCALE)
        this.dino.setCollideWorldBounds(true)
        this.dino.setGravityY(0) // Will enable after countdown
        this.dino.body.setSize(40, 50)
        this.dino.body.setOffset(15, 5)

        // Create run animation
        this.anims.create({
            key: 'dino-run',
            frames: [
                { key: 'dino-run-1' },
                { key: 'dino-run-2' }
            ],
            frameRate: 10,
            repeat: -1
        })

        // Collider between dino and ground
        this.physics.add.collider(this.dino, groundCollider)

        // Obstacles group
        this.obstacles = this.physics.add.group()
        this.physics.add.collider(this.obstacles, groundCollider)
        this.physics.add.overlap(this.dino, this.obstacles, this.hitObstacle, null, this)

        // UI: Score
        this.scoreText = this.add.text(width - 20, 20, 'SCORE: 0', {
            fontFamily: '"Press Start 2P"',
            fontSize: '14px',
            fill: '#333333'
        }).setOrigin(1, 0)

        // UI: Mouth state indicator
        this.mouthIndicator = this.add.text(width / 2, 20, '👄 ---', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            fill: '#333333'
        }).setOrigin(0.5, 0)

        // UI: Countdown
        this.countdownText = this.add.text(width / 2, height / 2 - 50, '3', {
            fontFamily: '"Press Start 2P"',
            fontSize: '72px',
            fill: '#FFD700',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5)

        // UI: Pause overlay
        this.pauseOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
        this.pauseOverlay.setVisible(false)

        this.pauseText = this.add.text(width / 2, height / 2, '👀 FACE LOST\nLook at camera!', {
            fontFamily: '"Press Start 2P"',
            fontSize: '14px',
            fill: '#FFD700',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5)
        this.pauseText.setVisible(false)

        // Tap to jump fallback
        if (!this.useFaceControl) {
            this.input.on('pointerdown', () => {
                if (this.gameStarted && !this.isGameOver && this.dino.body.touching.down) {
                    this.jump()
                }
            })
            this.mouthIndicator.setText('👆 TAP TO JUMP')
        }

        // Start countdown
        this.startCountdown()
    }

    startCountdown() {
        this.countdownText.setText(this.countdown.toString())

        this.time.addEvent({
            delay: 1000,
            repeat: CONFIG.COUNTDOWN_SECONDS - 1,
            callback: () => {
                this.countdown--
                if (this.countdown > 0) {
                    this.countdownText.setText(this.countdown.toString())
                } else {
                    this.countdownText.setText('GO!')
                    this.time.delayedCall(500, () => {
                        this.countdownText.setVisible(false)
                        this.startGame()
                    })
                }
            }
        })
    }

    startGame() {
        this.gameStarted = true
        this.dino.setGravityY(CONFIG.GRAVITY)
        this.dino.play('dino-run')

        // Start spawning obstacles
        this.scheduleObstacle()

        // Score timer
        this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                if (!this.isGameOver && !this.isPaused) {
                    this.score += 1
                    this.scoreText.setText(`SCORE: ${this.score}`)
                }
            }
        })
    }

    scheduleObstacle() {
        if (this.isGameOver) return

        const delay = Phaser.Math.Between(CONFIG.OBSTACLE_MIN_GAP, CONFIG.OBSTACLE_MAX_GAP)

        this.time.delayedCall(delay, () => {
            if (!this.isGameOver && !this.isPaused) {
                this.spawnObstacle()
            }
            this.scheduleObstacle()
        })
    }

    spawnObstacle() {
        const width = this.cameras.main.width
        const height = this.cameras.main.height

        const type = Phaser.Math.RND.pick(CONFIG.OBSTACLE_TYPES)
        const key = type === 'broccoli' ? 'obstacle-broccoli' : 'obstacle-milk'
        const obstacleHeight = type === 'broccoli' ? 30 : 50

        const obstacle = this.obstacles.create(
            width + 50,
            height - CONFIG.GROUND_HEIGHT - obstacleHeight / 2 - 10,
            key
        )
        obstacle.setScale(1.5)
        obstacle.body.setAllowGravity(false)
        obstacle.body.setVelocityX(-CONFIG.RUN_SPEED)
        obstacle.body.setSize(30, obstacleHeight)

        // Destroy when off screen
        obstacle.checkWorldBounds = true
        obstacle.outOfBoundsKill = true
    }

    jump() {
        if (this.jumpLocked) return

        this.dino.setVelocityY(-CONFIG.JUMP_FORCE)
        this.dino.setTexture('dino-jump')
        this.dino.stop()

        // Lock jump for debounce
        this.jumpLocked = true
        this.time.delayedCall(CONFIG.JUMP_DEBOUNCE_MS, () => {
            this.jumpLocked = false
        })
    }

    startDuck() {
        this.isDucking = true
        this.dino.setTexture('dino-duck')
        this.dino.stop()
        // Shrink hitbox when ducking
        this.dino.body.setSize(40, 25)
        this.dino.body.setOffset(15, 30)
    }

    stopDuck() {
        this.isDucking = false
        // Restore normal hitbox
        this.dino.body.setSize(40, 50)
        this.dino.body.setOffset(15, 5)
        // Resume running animation if on ground
        if (this.dino.body.touching.down || this.dino.body.blocked.down) {
            this.dino.play('dino-run')
        }
    }

    hitObstacle(dino, obstacle) {
        if (this.isGameOver) return

        this.isGameOver = true
        this.physics.pause()

        dino.setTexture('dino-hit')
        dino.stop()

        // Screen shake
        this.cameras.main.shake(200, 0.01)

        // Transition to game over
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', { score: this.score })
        })
    }

    update() {
        if (!this.gameStarted || this.isGameOver) return

        // Scroll ground
        this.groundTiles.tilePositionX += CONFIG.RUN_SPEED * 0.016

        // Check if dino is on ground
        const isOnGround = this.dino.body.touching.down || this.dino.body.blocked.down

        // Update dino animation
        if (isOnGround && this.dino.texture.key !== 'dino-hit') {
            if (this.dino.texture.key === 'dino-jump') {
                this.dino.play('dino-run')
            }
        }

        // Face detection logic
        if (this.useFaceControl && this.faceDetector) {
            const faceState = this.faceDetector.getState()

            // Handle face lost
            if (!faceState.faceDetected) {
                if (!this.isPaused) {
                    this.pauseGame()
                }
                return
            } else if (this.isPaused) {
                this.resumeGame()
            }

            // Update mouth indicator with duck state
            const stateEmoji = faceState.mouthState === 'OPEN' ? '😮' : '😶'
            const duckEmoji = faceState.eyeState === 'CLOSED' ? '😑' : '👀'
            const jumpEmoji = faceState.mouthState === 'OPEN' ? '🦖⬆️' : '🦖'
            this.mouthIndicator.setText(`${stateEmoji} ${duckEmoji} ${jumpEmoji}`)

            // Handle ducking (blink to duck)
            if (faceState.eyeState === 'CLOSED' && isOnGround) {
                if (!this.isDucking) {
                    this.startDuck()
                }
            } else {
                if (this.isDucking) {
                    this.stopDuck()
                }
            }

            // Trigger jump on CLOSED → OPEN transition (only if not ducking)
            if (
                faceState.mouthState === 'OPEN' &&
                this.prevMouthState === 'CLOSED' &&
                isOnGround &&
                !this.isDucking
            ) {
                this.jump()
            }

            this.prevMouthState = faceState.mouthState
        }

        // Clean up obstacles that went off screen
        this.obstacles.getChildren().forEach(obstacle => {
            if (obstacle.x < -50) {
                obstacle.destroy()
            }
        })
    }

    pauseGame() {
        this.isPaused = true
        this.physics.pause()
        this.pauseOverlay.setVisible(true)
        this.pauseText.setVisible(true)
    }

    resumeGame() {
        this.isPaused = false
        this.physics.resume()
        this.pauseOverlay.setVisible(false)
        this.pauseText.setVisible(false)
    }
}
