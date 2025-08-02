class Clone {
    constructor(id, recordedActions, spawnPosition, spawnTime) {
        this.id = id;
        this.recordedActions = recordedActions.map(action => ({...action})); // Deep copy
        this.position = spawnPosition.copy();
        this.velocity = new Vector2(0, 0);
        this.size = 18; // Slightly smaller than player
        this.baseColor = '#ffaa00';
        this.currentColor = this.baseColor;
        
        // Playback state
        this.actionIndex = 0;
        this.playbackStartTime = spawnTime;
        this.isActive = true;
        this.hasFinishedPlayback = false;
        
        // Degradation system
        this.spawnTime = spawnTime;
        this.degradationStartTime = 30000; // Start degrading after 30 seconds
        this.maxDegradationTime = 60000; // Fully degraded after 60 seconds
        this.degradationLevel = 0; // 0 = perfect, 1 = completely degraded
        
        // Movement interpolation
        this.targetPosition = this.position.copy();
        this.lastActionTime = 0;
        this.interpolationSpeed = 5; // How fast to interpolate between positions
        
        // Visual effects
        this.glowIntensity = 1.0;
        this.flickerTimer = 0;
        this.isFlickering = false;
    }

    update(deltaTime, currentTime) {
        if (!this.isActive) return;

        // Update degradation
        this.updateDegradation(currentTime);
        
        // Process recorded actions
        this.processActions(currentTime, deltaTime);
        
        // Update visual effects
        this.updateVisualEffects(deltaTime);
        
        // Interpolate position for smooth movement
        this.interpolatePosition(deltaTime);
    }

    updateDegradation(currentTime) {
        const ageInMs = currentTime - this.spawnTime;
        
        if (ageInMs > this.degradationStartTime) {
            const degradationProgress = (ageInMs - this.degradationStartTime) / 
                                      (this.maxDegradationTime - this.degradationStartTime);
            this.degradationLevel = Math.min(1, Math.max(0, degradationProgress));
            
            // Update color based on degradation
            const r = Math.floor(255 * (1 - this.degradationLevel * 0.5)); // Keep some red
            const g = Math.floor(170 * (1 - this.degradationLevel)); // Lose green
            const b = Math.floor(0 + this.degradationLevel * 100); // Gain some blue
            this.currentColor = `rgb(${r}, ${g}, ${b})`;
            
            // Start flickering when heavily degraded
            this.isFlickering = this.degradationLevel > 0.7;
        }
    }

    processActions(currentTime, deltaTime) {
        const playbackTime = currentTime - this.playbackStartTime;
        
        // Find and execute actions that should happen now
        while (this.actionIndex < this.recordedActions.length) {
            const action = this.recordedActions[this.actionIndex];
            
            // Apply degradation effects to timing
            let actionTime = action.timestamp;
            if (this.degradationLevel > 0) {
                // Add random delays and timing errors
                const maxDelay = this.degradationLevel * 500; // Up to 500ms delay
                const randomDelay = (Math.random() - 0.5) * maxDelay;
                actionTime += randomDelay;
            }
            
            if (playbackTime >= actionTime) {
                this.executeAction(action, deltaTime);
                this.actionIndex++;
            } else {
                break;
            }
        }
        
        // Check if playback is finished
        if (this.actionIndex >= this.recordedActions.length && !this.hasFinishedPlayback) {
            this.hasFinishedPlayback = true;
            console.log(`Clone ${this.id} finished playback`);
        }
    }

    executeAction(action, deltaTime) {
        switch (action.type) {
            case 'move':
                this.executeMovement(action, deltaTime);
                break;
            case 'interact':
                this.executeInteraction(action);
                break;
            case 'stateChange':
                // Handle state changes if needed
                break;
        }
    }

    executeMovement(action, deltaTime) {
        let targetPos = action.data.position.copy();
        
        // Apply degradation effects to movement
        if (this.degradationLevel > 0) {
            // Add random movement errors
            const maxError = this.degradationLevel * 10; // Up to 10 pixels of error
            const errorX = (Math.random() - 0.5) * maxError;
            const errorY = (Math.random() - 0.5) * maxError;
            targetPos.add(new Vector2(errorX, errorY));
            
            // Sometimes completely ignore movement commands
            if (Math.random() < this.degradationLevel * 0.3) {
                return; // Skip this movement
            }
        }
        
        this.targetPosition = targetPos;
        this.velocity = action.data.velocity.copy();
        this.lastActionTime = Date.now();
    }

    executeInteraction(action) {
        // Apply degradation effects to interactions
        if (this.degradationLevel > 0.5 && Math.random() < this.degradationLevel * 0.4) {
            return; // Sometimes fail to interact when degraded
        }
        
        console.log(`Clone ${this.id} interaction:`, action.data.interactionType);
        // This will be expanded to interact with puzzle elements
    }

    interpolatePosition(deltaTime) {
        // Smoothly move towards target position
        const distance = this.position.distanceTo(this.targetPosition);
        if (distance > 1) {
            const direction = Vector2.subtract(this.targetPosition, this.position).normalize();
            const moveSpeed = Math.min(distance, this.interpolationSpeed * deltaTime * 60);
            const movement = Vector2.multiply(direction, moveSpeed);
            this.position.add(movement);
        }
    }

    updateVisualEffects(deltaTime) {
        // Update glow intensity based on degradation
        this.glowIntensity = 1.0 - (this.degradationLevel * 0.7);
        
        // Handle flickering effect
        if (this.isFlickering) {
            this.flickerTimer += deltaTime;
            if (this.flickerTimer > 0.1) { // Flicker every 100ms
                this.glowIntensity *= (Math.random() > 0.5) ? 1.0 : 0.3;
                this.flickerTimer = 0;
            }
        }
    }

    render(ctx) {
        if (!this.isActive) return;
        
        ctx.save();
        
        // Apply transparency based on degradation
        ctx.globalAlpha = 0.8 - (this.degradationLevel * 0.3);
        
        // Glow effect
        ctx.shadowColor = this.currentColor;
        ctx.shadowBlur = 10 * this.glowIntensity;
        
        // Main body
        ctx.fillStyle = this.currentColor;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner core (dimmer for clones)
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * (1 - this.degradationLevel * 0.5)})`;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Clone ID indicator (for debugging)
        if (this.degradationLevel < 0.8) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.id.toString(), this.position.x, this.position.y - this.size - 5);
        }
        
        // Degradation visual indicator
        if (this.degradationLevel > 0.3) {
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        ctx.restore();
    }

    // Check if clone can interact with puzzle elements
    canInteract() {
        return this.isActive && this.degradationLevel < 0.8;
    }

    // Get clone's current reliability (inverse of degradation)
    getReliability() {
        return 1 - this.degradationLevel;
    }

    // Force deactivate the clone
    deactivate() {
        this.isActive = false;
        console.log(`Clone ${this.id} deactivated`);
    }

    // Get debug information
    getDebugInfo() {
        return {
            id: this.id,
            position: this.position.copy(),
            actionIndex: this.actionIndex,
            totalActions: this.recordedActions.length,
            degradationLevel: this.degradationLevel,
            isActive: this.isActive,
            hasFinishedPlayback: this.hasFinishedPlayback,
            reliability: this.getReliability()
        };
    }
}
