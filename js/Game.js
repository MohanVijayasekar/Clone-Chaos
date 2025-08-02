class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.isPaused = false;
        this.gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver', 'victory'
        
        // Game systems
        this.actionRecorder = new ActionRecorder();
        this.player = new Player(100, 100, this.actionRecorder);
        this.cloneManager = new CloneManager(this.actionRecorder);
        this.puzzleSystem = new PuzzleSystem();
        this.gameTimer = new GameTimer(120); // 2 minutes
        
        // Game loop
        this.lastFrameTime = 0;
        this.frameId = null;
        
        // Visual effects
        this.screenShake = { x: 0, y: 0, intensity: 0 };
        this.backgroundParticles = [];
        this.environmentalEffects = { redTint: 0, screenShake: 0 };
        
        // UI elements
        this.uiElements = {
            timer: document.getElementById('timeLeft'),
            cloneCounter: document.getElementById('cloneCounter'),
            gameStatus: document.getElementById('gameStatus'),
            gameOverModal: document.getElementById('gameOver'),
            gameOverTitle: document.getElementById('gameOverTitle'),
            gameOverMessage: document.getElementById('gameOverMessage'),
            restartBtn: document.getElementById('restartBtn')
        };
        
        this.initialize();
    }

    initialize() {
        console.log('Initializing Clone Chaos game...');
        
        // Initialize game systems
        this.puzzleSystem.initialize(this.canvas.width, this.canvas.height);
        
        // Set up timer callbacks
        this.gameTimer.setWarningCallback((seconds) => {
            this.handleTimeWarning(seconds);
        });
        
        this.gameTimer.setTimeUpCallback(() => {
            this.handleTimeUp();
        });
        
        this.gameTimer.setDangerLevelChangeCallback((level) => {
            this.handleDangerLevelChange(level);
        });
        
        // Set up UI event listeners
        this.setupUIEventListeners();
        
        // Create background particles
        this.createBackgroundParticles();
        
        // Start the game
        this.startGame();
    }

    setupUIEventListeners() {
        // Restart button
        this.uiElements.restartBtn.addEventListener('click', () => {
            this.restartGame();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'r':
                    if (this.gameState === 'gameOver' || this.gameState === 'victory') {
                        this.restartGame();
                    }
                    break;
                case 'p':
                    if (this.gameState === 'playing') {
                        this.pauseGame();
                    } else if (this.gameState === 'paused') {
                        this.resumeGame();
                    }
                    break;
                case 'escape':
                    if (this.gameState === 'playing') {
                        this.pauseGame();
                    }
                    break;
            }
        });
    }

    createBackgroundParticles() {
        // Create ambient particles for atmosphere
        for (let i = 0; i < 20; i++) {
            this.backgroundParticles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                size: Math.random() * 2 + 1,
                alpha: Math.random() * 0.3 + 0.1,
                color: '#4488ff'
            });
        }
    }

    startGame() {
        this.gameState = 'playing';
        this.isRunning = true;
        this.gameTimer.start();
        this.actionRecorder.startRecording();
        
        this.updateGameStatus('Navigate the lab and escape!');
        this.hideGameOverModal();
        
        console.log('Game started');
        this.gameLoop();
    }

    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.gameTimer.pause();
            this.updateGameStatus('Game Paused - Press P to resume');
            console.log('Game paused');
        }
    }

    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.gameTimer.resume();
            this.updateGameStatus('Navigate the lab and escape!');
            console.log('Game resumed');
        }
    }

    restartGame() {
        console.log('Restarting game...');
        
        // Reset all game systems
        this.player.reset(100, 100);
        this.cloneManager.clearAllClones();
        this.puzzleSystem.reset();
        this.gameTimer.reset();
        this.actionRecorder.clear();
        
        // Reset visual effects
        this.screenShake = { x: 0, y: 0, intensity: 0 };
        this.environmentalEffects = { redTint: 0, screenShake: 0 };
        
        // Start new game
        this.startGame();
    }

    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        const deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        
        // Update game systems
        this.update(deltaTime);
        
        // Render everything
        this.render();
        
        // Continue game loop
        this.frameId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update timer
        this.gameTimer.update(deltaTime);
        
        // Update environmental effects based on timer
        this.environmentalEffects = this.gameTimer.getEnvironmentalEffects();
        
        // Update player
        this.player.update(deltaTime, this.canvas.width, this.canvas.height);
        
        // Update clone manager
        this.cloneManager.update(deltaTime, Date.now(), this.player.position);
        
        // Update puzzle system
        this.puzzleSystem.update(deltaTime, this.player, this.cloneManager.clones);
        
        // Update background particles
        this.updateBackgroundParticles(deltaTime);
        
        // Update screen shake
        this.updateScreenShake(deltaTime);
        
        // Check win condition
        this.checkWinCondition();
        
        // Update UI
        this.updateUI();
    }

    updateBackgroundParticles(deltaTime) {
        for (const particle of this.backgroundParticles) {
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            // Wrap around screen
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Add some random movement based on danger level
            if (this.environmentalEffects.particleIntensity > 0) {
                particle.vx += (Math.random() - 0.5) * this.environmentalEffects.particleIntensity;
                particle.vy += (Math.random() - 0.5) * this.environmentalEffects.particleIntensity;
            }
        }
    }

    updateScreenShake(deltaTime) {
        if (this.environmentalEffects.screenShake > 0) {
            this.screenShake.intensity = this.environmentalEffects.screenShake;
            this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity;
            this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity;
        } else {
            this.screenShake.x = 0;
            this.screenShake.y = 0;
            this.screenShake.intensity = 0;
        }
    }

    checkWinCondition() {
        if (this.puzzleSystem.checkPlayerAtExit(this.player.position)) {
            this.handleVictory();
        }
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply screen shake
        this.ctx.save();
        this.ctx.translate(this.screenShake.x, this.screenShake.y);
        
        // Draw background
        this.renderBackground();
        
        // Draw background particles
        this.renderBackgroundParticles();
        
        // Draw puzzle elements
        this.puzzleSystem.render(this.ctx);
        
        // Draw clones (behind player)
        this.cloneManager.render(this.ctx);
        
        // Draw player
        this.player.render(this.ctx);
        
        // Apply danger effects
        this.renderDangerEffects();
        
        this.ctx.restore();
        
        // Draw UI overlays (not affected by screen shake)
        this.renderUIOverlays();
    }

    renderBackground() {
        // Laboratory floor pattern
        const gridSize = 50;
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    renderBackgroundParticles() {
        for (const particle of this.backgroundParticles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    renderDangerEffects() {
        // Red tint overlay for danger
        if (this.environmentalEffects.redTint > 0) {
            this.ctx.save();
            this.ctx.globalAlpha = this.environmentalEffects.redTint;
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
        
        // Flash effect for critical time
        if (this.gameTimer.shouldFlash()) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.2;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
    }

    renderUIOverlays() {
        // Debug information (if needed)
        if (window.DEBUG_MODE) {
            this.renderDebugInfo();
        }
    }

    renderDebugInfo() {
        const debugInfo = [
            `Player: ${this.player.position.toString()}`,
            `Clones: ${this.cloneManager.clones.length}`,
            `Timer: ${this.gameTimer.getFormattedTime()}`,
            `Danger: ${this.gameTimer.dangerLevel.toFixed(2)}`
        ];
        
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, debugInfo.length * 20 + 10);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        debugInfo.forEach((info, index) => {
            this.ctx.fillText(info, 15, 25 + index * 20);
        });
        this.ctx.restore();
    }

    updateUI() {
        // Update timer display
        this.uiElements.timer.textContent = this.gameTimer.getRemainingSeconds();
        
        // Update clone counter
        this.uiElements.cloneCounter.textContent = this.cloneManager.clones.length;
        
        // Update timer color based on danger level
        if (this.gameTimer.isCritical()) {
            this.uiElements.timer.style.color = '#ff4444';
        } else if (this.gameTimer.dangerLevel > 0.3) {
            this.uiElements.timer.style.color = '#ffaa44';
        } else {
            this.uiElements.timer.style.color = '#ff4444';
        }
    }

    updateGameStatus(message) {
        this.uiElements.gameStatus.textContent = message;
    }

    handleTimeWarning(seconds) {
        this.updateGameStatus(`WARNING: ${seconds} seconds until implosion!`);
        // Could add sound effects or visual warnings here
    }

    handleTimeUp() {
        this.gameState = 'gameOver';
        this.isRunning = false;
        this.showGameOverModal('Laboratory Imploded!', 'The facility has collapsed. Try again!');
    }

    handleDangerLevelChange(level) {
        if (level >= 0.7) {
            this.updateGameStatus('CRITICAL: Laboratory systems failing!');
        } else if (level >= 0.3) {
            this.updateGameStatus('WARNING: Environmental instability detected!');
        }
    }

    handleVictory() {
        this.gameState = 'victory';
        this.isRunning = false;
        this.gameTimer.stop();
        
        const timeBonus = Math.floor(this.gameTimer.getRemainingSeconds() / 10);
        this.showGameOverModal(
            'Escape Successful!', 
            `You escaped with ${this.gameTimer.getRemainingSeconds()} seconds remaining!\nTime bonus: ${timeBonus} points`
        );
    }

    showGameOverModal(title, message) {
        this.uiElements.gameOverTitle.textContent = title;
        this.uiElements.gameOverMessage.textContent = message;
        this.uiElements.gameOverModal.classList.remove('hidden');
    }

    hideGameOverModal() {
        this.uiElements.gameOverModal.classList.add('hidden');
    }

    // Clean up resources
    destroy() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
        }
        this.isRunning = false;
        console.log('Game destroyed');
    }
}
