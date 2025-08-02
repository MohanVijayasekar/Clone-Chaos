class GameTimer {
    constructor(initialTime = 120) { // 2 minutes default
        this.initialTime = initialTime * 1000; // Convert to milliseconds
        this.remainingTime = this.initialTime;
        this.isRunning = false;
        this.isPaused = false;
        this.startTime = 0;
        this.pausedTime = 0;
        
        // Implosion warning system
        this.warningThresholds = [30, 15, 10, 5]; // Warning at these seconds
        this.triggeredWarnings = new Set();
        
        // Visual effects for time pressure
        this.dangerLevel = 0; // 0 = safe, 1 = critical
        this.flashTimer = 0;
        this.isFlashing = false;
        
        // Callbacks for events
        this.onWarning = null;
        this.onTimeUp = null;
        this.onDangerLevelChange = null;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.startTime = Date.now();
            console.log('Game timer started');
        }
    }

    pause() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            this.pausedTime = Date.now();
            console.log('Game timer paused');
        }
    }

    resume() {
        if (this.isRunning && this.isPaused) {
            this.isPaused = false;
            // Adjust start time to account for paused duration
            const pauseDuration = Date.now() - this.pausedTime;
            this.startTime += pauseDuration;
            console.log('Game timer resumed');
        }
    }

    stop() {
        this.isRunning = false;
        this.isPaused = false;
        console.log('Game timer stopped');
    }

    reset(newTime = null) {
        this.stop();
        if (newTime !== null) {
            this.initialTime = newTime * 1000;
        }
        this.remainingTime = this.initialTime;
        this.triggeredWarnings.clear();
        this.dangerLevel = 0;
        this.isFlashing = false;
        console.log('Game timer reset');
    }

    update(deltaTime) {
        if (!this.isRunning || this.isPaused) return;

        // Calculate remaining time
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.startTime;
        this.remainingTime = Math.max(0, this.initialTime - elapsedTime);

        // Update danger level based on remaining time
        this.updateDangerLevel();

        // Check for warnings
        this.checkWarnings();

        // Update visual effects
        this.updateVisualEffects(deltaTime);

        // Check if time is up
        if (this.remainingTime <= 0 && this.onTimeUp) {
            this.onTimeUp();
        }
    }

    updateDangerLevel() {
        const remainingSeconds = this.remainingTime / 1000;
        const totalSeconds = this.initialTime / 1000;
        const timeRatio = remainingSeconds / totalSeconds;

        let newDangerLevel = 0;
        if (timeRatio <= 0.1) { // Last 10% of time
            newDangerLevel = 1;
        } else if (timeRatio <= 0.25) { // Last 25% of time
            newDangerLevel = 0.7;
        } else if (timeRatio <= 0.5) { // Last 50% of time
            newDangerLevel = 0.3;
        }

        if (newDangerLevel !== this.dangerLevel) {
            this.dangerLevel = newDangerLevel;
            if (this.onDangerLevelChange) {
                this.onDangerLevelChange(this.dangerLevel);
            }
        }

        // Start flashing when critical
        this.isFlashing = this.dangerLevel >= 0.7;
    }

    checkWarnings() {
        const remainingSeconds = Math.ceil(this.remainingTime / 1000);
        
        for (const threshold of this.warningThresholds) {
            if (remainingSeconds <= threshold && !this.triggeredWarnings.has(threshold)) {
                this.triggeredWarnings.add(threshold);
                if (this.onWarning) {
                    this.onWarning(threshold);
                }
                console.log(`Warning: ${threshold} seconds remaining!`);
            }
        }
    }

    updateVisualEffects(deltaTime) {
        if (this.isFlashing) {
            this.flashTimer += deltaTime;
            // Flash frequency increases as time gets more critical
            const flashFrequency = 0.5 - (this.dangerLevel * 0.3); // 0.5s to 0.2s
            if (this.flashTimer >= flashFrequency) {
                this.flashTimer = 0;
            }
        }
    }

    // Get remaining time in seconds
    getRemainingSeconds() {
        return Math.ceil(this.remainingTime / 1000);
    }

    // Get remaining time formatted as MM:SS
    getFormattedTime() {
        const totalSeconds = Math.ceil(this.remainingTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Get time ratio (0 = no time left, 1 = full time)
    getTimeRatio() {
        return this.remainingTime / this.initialTime;
    }

    // Check if timer is in critical state
    isCritical() {
        return this.dangerLevel >= 0.7;
    }

    // Check if timer should flash
    shouldFlash() {
        if (!this.isFlashing) return false;
        const flashFrequency = 0.5 - (this.dangerLevel * 0.3);
        return (this.flashTimer / flashFrequency) < 0.5;
    }

    // Add time (for power-ups or puzzle rewards)
    addTime(seconds) {
        this.remainingTime = Math.min(this.initialTime, this.remainingTime + (seconds * 1000));
        console.log(`Added ${seconds} seconds to timer`);
    }

    // Remove time (for penalties)
    removeTime(seconds) {
        this.remainingTime = Math.max(0, this.remainingTime - (seconds * 1000));
        console.log(`Removed ${seconds} seconds from timer`);
    }

    // Get environmental danger effects based on time pressure
    getEnvironmentalEffects() {
        const effects = {
            screenShake: 0,
            redTint: 0,
            particleIntensity: 0,
            soundDistortion: 0
        };

        if (this.dangerLevel > 0) {
            effects.screenShake = this.dangerLevel * 2; // 0-2 pixels
            effects.redTint = this.dangerLevel * 0.3; // 0-0.3 alpha
            effects.particleIntensity = this.dangerLevel * 10; // 0-10 particles
            effects.soundDistortion = this.dangerLevel * 0.5; // 0-0.5 distortion
        }

        return effects;
    }

    // Set event callbacks
    setWarningCallback(callback) {
        this.onWarning = callback;
    }

    setTimeUpCallback(callback) {
        this.onTimeUp = callback;
    }

    setDangerLevelChangeCallback(callback) {
        this.onDangerLevelChange = callback;
    }

    // Get debug information
    getDebugInfo() {
        return {
            remainingTime: this.remainingTime,
            remainingSeconds: this.getRemainingSeconds(),
            formattedTime: this.getFormattedTime(),
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            dangerLevel: this.dangerLevel,
            isFlashing: this.isFlashing,
            timeRatio: this.getTimeRatio(),
            triggeredWarnings: Array.from(this.triggeredWarnings)
        };
    }
}
