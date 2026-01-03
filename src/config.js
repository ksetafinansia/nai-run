// Game Configuration Constants
export const CONFIG = {
    // Physics
    GRAVITY: 900,
    JUMP_FORCE: 650,
    RUN_SPEED: 260,

    // Game dimensions
    GAME_WIDTH: 480,
    GAME_HEIGHT: 640,

    // Ground
    GROUND_HEIGHT: 100,

    // Dino
    DINO_SCALE: 1.5,
    DINO_START_X: 80,

    // Obstacles
    OBSTACLE_MIN_GAP: 1500,
    OBSTACLE_MAX_GAP: 2500,
    OBSTACLE_TYPES: ['broccoli', 'milk'],

    // Mouth detection
    MOUTH_OPEN_THRESHOLD: 0.35,
    JUMP_DEBOUNCE_MS: 150,
    SMOOTH_FRAMES: 3,

    // Eye blink detection for ducking
    EYE_CLOSED_THRESHOLD: 0.15,

    // UI
    COUNTDOWN_SECONDS: 3
}
