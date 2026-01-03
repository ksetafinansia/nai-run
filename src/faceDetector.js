import { FaceMesh } from '@mediapipe/face_mesh'
import { Camera } from '@mediapipe/camera_utils'
import { CONFIG } from './config.js'

export class FaceDetector {
    constructor() {
        this.faceMesh = null
        this.camera = null
        this.mouthState = 'CLOSED'
        this.eyeState = 'OPEN'
        this.faceDetected = false
        this.mouthRatioHistory = []
        this.eyeRatioHistory = []
        this.isReady = false
    }

    async init() {
        const video = document.getElementById('camera-feed')

        // Initialize FaceMesh
        this.faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
            }
        })

        this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        })

        this.faceMesh.onResults((results) => this.onResults(results))

        // Initialize camera
        this.camera = new Camera(video, {
            onFrame: async () => {
                await this.faceMesh.send({ image: video })
            },
            width: 320,
            height: 240
        })

        await this.camera.start()
        this.isReady = true

        return true
    }

    onResults(results) {
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            this.faceDetected = false
            return
        }

        this.faceDetected = true
        const landmarks = results.multiFaceLandmarks[0]

        // Calculate mouth ratio
        // Upper lip: 13, Lower lip: 14
        // Left corner: 61, Right corner: 291
        const upperLip = landmarks[13]
        const lowerLip = landmarks[14]
        const leftCorner = landmarks[61]
        const rightCorner = landmarks[291]

        const verticalDistance = Math.abs(lowerLip.y - upperLip.y)
        const horizontalDistance = Math.abs(rightCorner.x - leftCorner.x)

        const mouthRatio = verticalDistance / horizontalDistance

        // Smoothing: average of last N frames
        this.mouthRatioHistory.push(mouthRatio)
        if (this.mouthRatioHistory.length > CONFIG.SMOOTH_FRAMES) {
            this.mouthRatioHistory.shift()
        }

        const avgRatio = this.mouthRatioHistory.reduce((a, b) => a + b, 0) / this.mouthRatioHistory.length

        // Determine mouth state
        this.mouthState = avgRatio > CONFIG.MOUTH_OPEN_THRESHOLD ? 'OPEN' : 'CLOSED'

        // Calculate eye aspect ratio (EAR) for blink detection
        // Left eye landmarks: 159 (top), 145 (bottom), 33 (left corner), 133 (right corner)
        // Right eye landmarks: 386 (top), 374 (bottom), 362 (left corner), 263 (right corner)
        const leftEyeTop = landmarks[159]
        const leftEyeBottom = landmarks[145]
        const leftEyeLeft = landmarks[33]
        const leftEyeRight = landmarks[133]
        
        const rightEyeTop = landmarks[386]
        const rightEyeBottom = landmarks[374]
        const rightEyeLeft = landmarks[362]
        const rightEyeRight = landmarks[263]
        
        // Calculate eye aspect ratio for both eyes
        const leftEyeVertical = Math.abs(leftEyeBottom.y - leftEyeTop.y)
        const leftEyeHorizontal = Math.abs(leftEyeRight.x - leftEyeLeft.x)
        const leftEAR = leftEyeVertical / leftEyeHorizontal
        
        const rightEyeVertical = Math.abs(rightEyeBottom.y - rightEyeTop.y)
        const rightEyeHorizontal = Math.abs(rightEyeRight.x - rightEyeLeft.x)
        const rightEAR = rightEyeVertical / rightEyeHorizontal
        
        // Average of both eyes
        const avgEAR = (leftEAR + rightEAR) / 2
        
        // Smoothing for eye ratio
        this.eyeRatioHistory.push(avgEAR)
        if (this.eyeRatioHistory.length > CONFIG.SMOOTH_FRAMES) {
            this.eyeRatioHistory.shift()
        }
        
        const avgEyeRatio = this.eyeRatioHistory.reduce((a, b) => a + b, 0) / this.eyeRatioHistory.length
        
        // Determine eye state - closed eyes mean ducking (blink)
        this.eyeState = avgEyeRatio < CONFIG.EYE_CLOSED_THRESHOLD ? 'CLOSED' : 'OPEN'
    }
    }

    getState() {
        return {
            mouthState: this.mouthState,
            eyeState: this.eyeState,
            faceDetected: this.faceDetected,
            isReady: this.isReady
        }
    }

    stop() {
        if (this.camera) {
            this.camera.stop()
        }
    }
}
