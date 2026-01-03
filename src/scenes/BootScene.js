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
    }

    create() {
        // Generate textures programmatically to avoid SVG loading issues in production
        this.createDinoTextures()
        this.createObstacleTextures()
        this.createGroundTexture()
        
        this.scene.start('PermissionScene')
    }

    createDinoTextures() {
        // Dino Run Frame 1 (left foot forward)
        const run1 = this.add.graphics()
        this.drawDino(run1, false, false)
        run1.generateTexture('dino-run-1', 80, 60)
        run1.destroy()

        // Dino Run Frame 2 (right foot forward)
        const run2 = this.add.graphics()
        this.drawDino(run2, true, false)
        run2.generateTexture('dino-run-2', 80, 60)
        run2.destroy()

        // Dino Jump
        const jump = this.add.graphics()
        this.drawDinoJump(jump)
        jump.generateTexture('dino-jump', 80, 60)
        jump.destroy()

        // Dino Duck
        const duck = this.add.graphics()
        this.drawDinoDuck(duck)
        duck.generateTexture('dino-duck', 80, 40)
        duck.destroy()

        // Dino Hit
        const hit = this.add.graphics()
        this.drawDinoHit(hit)
        hit.generateTexture('dino-hit', 60, 60)
        hit.destroy()
    }

    drawDino(graphics, rightFoot, isHit) {
        // Body (yellow chick)
        graphics.fillStyle(0xFFD700)
        graphics.fillEllipse(35, 35, 36, 40) // body
        
        // Wing stripe
        graphics.lineStyle(8, 0xFFFACD)
        graphics.beginPath()
        graphics.arc(40, 35, 12, -0.5, 1, false)
        graphics.strokePath()
        
        // Head
        graphics.fillStyle(0xFFD700)
        graphics.fillCircle(45, 22, 14) // head
        
        // Beak
        graphics.fillEllipse(55, 26, 8, 6)
        
        // Eye
        graphics.fillStyle(0x000000)
        graphics.fillCircle(50, 20, 2.5)
        
        // Crest
        graphics.fillStyle(0xFFA500)
        graphics.fillTriangle(42, 10, 45, 4, 48, 10)
        
        // Tail
        graphics.fillStyle(0xFFD700)
        graphics.fillEllipse(10, 35, 10, 8)
        graphics.fillStyle(0xFFA500)
        graphics.fillTriangle(8, 32, 12, 28, 14, 34)
        
        // Feet
        graphics.fillStyle(0xFFD700)
        if (rightFoot) {
            graphics.fillRoundedRect(28, 52, 8, 8, 3)
            graphics.fillRoundedRect(42, 50, 8, 6, 3)
        } else {
            graphics.fillRoundedRect(28, 50, 8, 6, 3)
            graphics.fillRoundedRect(42, 52, 8, 8, 3)
        }
    }

    drawDinoJump(graphics) {
        // Body
        graphics.fillStyle(0xFFD700)
        graphics.fillEllipse(35, 30, 36, 40)
        
        // Wing stripe
        graphics.lineStyle(8, 0xFFFACD)
        graphics.beginPath()
        graphics.arc(40, 30, 12, -0.5, 1, false)
        graphics.strokePath()
        
        // Head
        graphics.fillStyle(0xFFD700)
        graphics.fillCircle(45, 17, 14)
        
        // Beak
        graphics.fillEllipse(55, 21, 8, 6)
        
        // Eye
        graphics.fillStyle(0x000000)
        graphics.fillCircle(50, 15, 2.5)
        
        // Crest
        graphics.fillStyle(0xFFA500)
        graphics.fillTriangle(42, 5, 45, -1, 48, 5)
        
        // Tail
        graphics.fillStyle(0xFFD700)
        graphics.fillEllipse(10, 30, 10, 8)
        graphics.fillStyle(0xFFA500)
        graphics.fillTriangle(8, 27, 12, 23, 14, 29)
        
        // Feet (tucked)
        graphics.fillStyle(0xFFD700)
        graphics.fillRoundedRect(30, 48, 8, 6, 3)
        graphics.fillRoundedRect(42, 48, 8, 6, 3)
    }

    drawDinoDuck(graphics) {
        // Body (flattened)
        graphics.fillStyle(0xFFD700)
        graphics.fillEllipse(38, 22, 44, 24)
        
        // Wing stripe
        graphics.lineStyle(6, 0xFFFACD)
        graphics.beginPath()
        graphics.arc(42, 22, 8, -0.5, 1, false)
        graphics.strokePath()
        
        // Head (lowered)
        graphics.fillStyle(0xFFD700)
        graphics.fillCircle(55, 14, 12)
        
        // Beak
        graphics.fillEllipse(67, 16, 8, 5)
        
        // Eye
        graphics.fillStyle(0x000000)
        graphics.fillCircle(58, 11, 2.5)
        
        // Crest
        graphics.fillStyle(0xFFA500)
        graphics.fillTriangle(50, 4, 53, -1, 56, 4)
        
        // Tail
        graphics.fillStyle(0xFFD700)
        graphics.fillEllipse(12, 22, 10, 6)
        graphics.fillStyle(0xFFA500)
        graphics.fillTriangle(6, 19, 9, 16, 11, 20)
        
        // Feet (spread)
        graphics.fillStyle(0xFFD700)
        graphics.fillRoundedRect(26, 32, 10, 5, 2)
        graphics.fillRoundedRect(48, 32, 10, 5, 2)
    }

    drawDinoHit(graphics) {
        // Body
        graphics.fillStyle(0xFFD700)
        graphics.fillEllipse(30, 35, 32, 36)
        
        // Head
        graphics.fillCircle(38, 20, 12)
        
        // Beak
        graphics.fillEllipse(48, 24, 7, 5)
        
        // X eyes (hit)
        graphics.lineStyle(2, 0x000000)
        graphics.lineBetween(40, 16, 44, 20)
        graphics.lineBetween(44, 16, 40, 20)
        
        // Crest
        graphics.fillStyle(0xFFA500)
        graphics.fillTriangle(35, 10, 38, 5, 41, 10)
        
        // Tail
        graphics.fillStyle(0xFFD700)
        graphics.fillEllipse(10, 35, 8, 6)
        
        // Feet
        graphics.fillRoundedRect(22, 50, 8, 6, 3)
        graphics.fillRoundedRect(34, 50, 8, 6, 3)
    }

    createObstacleTextures() {
        // Broccoli
        const broccoli = this.add.graphics()
        // Stem
        broccoli.fillStyle(0x8B4513)
        broccoli.fillRect(15, 20, 10, 15)
        // Green top
        broccoli.fillStyle(0x228B22)
        broccoli.fillCircle(12, 12, 10)
        broccoli.fillCircle(20, 8, 10)
        broccoli.fillCircle(28, 12, 10)
        broccoli.fillCircle(16, 16, 8)
        broccoli.fillCircle(24, 16, 8)
        broccoli.generateTexture('obstacle-broccoli', 40, 35)
        broccoli.destroy()

        // Milk carton
        const milk = this.add.graphics()
        // Body
        milk.fillStyle(0xFFFFFF)
        milk.fillRect(5, 15, 30, 35)
        // Top
        milk.fillStyle(0x4169E1)
        milk.fillTriangle(5, 15, 20, 0, 35, 15)
        // Label
        milk.fillStyle(0x4169E1)
        milk.fillRect(10, 25, 20, 15)
        milk.generateTexture('obstacle-milk', 40, 50)
        milk.destroy()
    }

    createGroundTexture() {
        const ground = this.add.graphics()
        // Grass layer
        ground.fillStyle(0x228B22)
        ground.fillRect(0, 0, 100, 8)
        // Dirt layer
        ground.fillStyle(0x8B4513)
        ground.fillRect(0, 8, 100, 12)
        ground.generateTexture('ground', 100, 20)
        ground.destroy()
    }
}
