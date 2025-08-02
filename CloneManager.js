class CloneManager {
    constructor(actionRecorder) {
        this.actionRecorder = actionRecorder;
        this.clones = [];
        this.nextCloneId = 1;
        this.spawnInterval = 10000; // 10 seconds in milliseconds
        this.lastSpawnTime = 0;
        this.maxClones = 15; // Limit to prevent performance issues
        
        // Spawn settings
        this.spawnRadius = 50; // How far from player to spawn clones
        this.isSpawningEnabled = true;
        
        // Performance optimization
        this.updateInterval = 16; // Update clones every 16ms (60 FPS)
        this.lastUpdateTime = 0;
    }

    update(deltaTime, currentTime, playerPosition) {
        // Check if it's time to spawn a new clone
        if (this.shouldSpawnClone(currentTime)) {
            this.spawnClone(playerPosition, currentTime);
        }
        
        // Update all active clones
        this.updateClones(deltaTime, currentTime);
        
        // Clean up inactive clones
        this.cleanupInactiveClones();
    }

    shouldSpawnClone(currentTime) {
        return this.isSpawningEnabled &&
               this.clones.length < this.maxClones &&
               (currentTime - this.lastSpawnTime) >= this.spawnInterval &&
               this.actionRecorder.actions.length > 0;
    }

    spawnClone(playerPosition, currentTime) {
        // Stop current recording and get the actions
        const recordedActions = this.actionRecorder.stopRecording();
        
        if (recordedActions.length === 0) {
            console.log('No actions to record for clone');
            this.actionRecorder.startRecording(); // Restart recording
            return;
        }

        // Compress actions to optimize memory usage
        const compressedActions = this.compressActions(recordedActions);
        
        // Calculate spawn position (slightly offset from player)
        const spawnOffset = this.calculateSpawnOffset(playerPosition);
        const spawnPosition = Vector2.add(playerPosition, spawnOffset);
        
        // Create new clone
        const clone = new Clone(
            this.nextCloneId++,
            compressedActions,
            spawnPosition,
            currentTime
        );
        
        this.clones.push(clone);
        this.lastSpawnTime = currentTime;
        
        console.log(`Spawned clone ${clone.id} with ${compressedActions.length} actions`);
        
        // Start recording new actions for the next clone
        this.actionRecorder.startRecording();
        
        // Trigger visual/audio cue for clone spawn
        this.triggerSpawnEffect(spawnPosition);
    }

    calculateSpawnOffset(playerPosition) {
        // Spawn clones in a spiral pattern around the player
        const angle = (this.nextCloneId * 0.618 * 2 * Math.PI) % (2 * Math.PI); // Golden angle
        const radius = this.spawnRadius + (this.nextCloneId % 3) * 10; // Vary radius slightly
        
        return new Vector2(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius
        );
    }

    compressActions(actions) {
        // Remove redundant actions and optimize for memory
        const compressed = [];
        let lastPosition = null;
        const positionThreshold = 3; // pixels
        
        for (const action of actions) {
            if (action.type === 'move') {
                if (lastPosition && 
                    action.data.position.distanceTo(lastPosition) < positionThreshold) {
                    continue; // Skip similar positions
                }
                lastPosition = action.data.position.copy();
            }
            compressed.push(action);
        }
        
        return compressed;
    }

    updateClones(deltaTime, currentTime) {
        // Batch update clones for better performance
        for (const clone of this.clones) {
            if (clone.isActive) {
                clone.update(deltaTime, currentTime);
            }
        }
    }

    cleanupInactiveClones() {
        // Remove clones that are no longer active or useful
        const initialCount = this.clones.length;
        this.clones = this.clones.filter(clone => {
            // Keep active clones
            if (clone.isActive) return true;
            
            // Keep recently finished clones for a short time
            const timeSinceFinished = Date.now() - clone.spawnTime;
            if (clone.hasFinishedPlayback && timeSinceFinished < 5000) {
                return true;
            }
            
            // Remove old or completely degraded clones
            return false;
        });
        
        const removedCount = initialCount - this.clones.length;
        if (removedCount > 0) {
            console.log(`Cleaned up ${removedCount} inactive clones`);
        }
    }

    render(ctx) {
        // Render clones in order of creation (oldest first)
        for (const clone of this.clones) {
            clone.render(ctx);
        }
        
        // Render spawn preview if about to spawn
        this.renderSpawnPreview(ctx);
    }

    renderSpawnPreview(ctx) {
        if (!this.isSpawningEnabled) return;
        
        const currentTime = Date.now();
        const timeUntilSpawn = this.spawnInterval - (currentTime - this.lastSpawnTime);
        
        if (timeUntilSpawn <= 2000 && timeUntilSpawn > 0) { // Show preview 2 seconds before spawn
            const alpha = Math.sin((currentTime / 200) % (Math.PI * 2)) * 0.3 + 0.5;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            
            // Draw spawn indicator circles
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(100, 100, 20 + i * 10, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            ctx.restore();
        }
    }

    triggerSpawnEffect(position) {
        // This would trigger particle effects, sound, etc.
        console.log(`Clone spawn effect at ${position.toString()}`);
    }

    // Get all clones within a certain radius of a position
    getClonesNear(position, radius) {
        return this.clones.filter(clone => 
            clone.isActive && clone.position.distanceTo(position) <= radius
        );
    }

    // Get all clones that can interact (not too degraded)
    getInteractableClones() {
        return this.clones.filter(clone => clone.canInteract());
    }

    // Get clone count by reliability level
    getCloneStats() {
        const stats = {
            total: this.clones.length,
            active: 0,
            reliable: 0,
            degraded: 0,
            critical: 0
        };
        
        for (const clone of this.clones) {
            if (clone.isActive) {
                stats.active++;
                const reliability = clone.getReliability();
                if (reliability > 0.8) stats.reliable++;
                else if (reliability > 0.3) stats.degraded++;
                else stats.critical++;
            }
        }
        
        return stats;
    }

    // Force spawn a clone (for testing/debugging)
    forceSpawn(playerPosition) {
        const currentTime = Date.now();
        this.lastSpawnTime = currentTime - this.spawnInterval; // Reset timer
        this.spawnClone(playerPosition, currentTime);
    }

    // Enable/disable clone spawning
    setSpawningEnabled(enabled) {
        this.isSpawningEnabled = enabled;
        if (enabled && !this.actionRecorder.isRecording) {
            this.actionRecorder.startRecording();
        }
    }

    // Clear all clones (for game reset)
    clearAllClones() {
        this.clones = [];
        this.nextCloneId = 1;
        this.lastSpawnTime = 0;
        console.log('All clones cleared');
    }

    // Get debug information
    getDebugInfo() {
        return {
            cloneCount: this.clones.length,
            nextCloneId: this.nextCloneId,
            isSpawningEnabled: this.isSpawningEnabled,
            timeUntilNextSpawn: Math.max(0, this.spawnInterval - (Date.now() - this.lastSpawnTime)),
            stats: this.getCloneStats(),
            clones: this.clones.map(clone => clone.getDebugInfo())
        };
    }
}
