// Clone Chaos - Main Entry Point
// Initialize the game when the page loads

let game = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Clone Chaos - Initializing...');
    
    // Get the canvas element
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    // Set up canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get 2D context from canvas!');
        return;
    }
    
    // Enable debug mode for development (can be toggled)
    window.DEBUG_MODE = false;
    
    // Initialize the game
    try {
        game = new Game(canvas);
        console.log('Clone Chaos initialized successfully!');
        
        // Add global keyboard shortcuts
        setupGlobalControls();
        
        // Add window resize handling
        setupResizeHandling();
        
        // Add visibility change handling (pause when tab is hidden)
        setupVisibilityHandling();
        
    } catch (error) {
        console.error('Failed to initialize Clone Chaos:', error);
        showErrorMessage('Failed to initialize the game. Please refresh the page.');
    }
});

function setupGlobalControls() {
    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'F1':
                event.preventDefault();
                window.DEBUG_MODE = !window.DEBUG_MODE;
                console.log('Debug mode:', window.DEBUG_MODE ? 'ON' : 'OFF');
                break;
                
            case 'F5':
                // Allow normal refresh
                break;
                
            case 'F11':
                // Allow fullscreen toggle
                break;
                
            default:
                // Let the game handle other keys
                break;
        }
    });
}

function setupResizeHandling() {
    let resizeTimeout;
    
    window.addEventListener('resize', function() {
        // Debounce resize events
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            handleResize();
        }, 250);
    });
}

function handleResize() {
    // For now, we keep the canvas size fixed
    // In a full implementation, you might want to make it responsive
    console.log('Window resized');
}

function setupVisibilityHandling() {
    document.addEventListener('visibilitychange', function() {
        if (game) {
            if (document.hidden) {
                // Page is hidden, pause the game
                if (game.gameState === 'playing') {
                    game.pauseGame();
                    console.log('Game paused due to tab visibility change');
                }
            }
            // Note: We don't auto-resume when visible again to avoid surprising the player
        }
    });
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ff4444;
        color: white;
        padding: 20px;
        border-radius: 10px;
        font-family: monospace;
        z-index: 10000;
        text-align: center;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
}

// Global functions for debugging and development
window.gameDebug = {
    // Get current game state
    getGameState: function() {
        return game ? game.gameState : 'No game instance';
    },
    
    // Force spawn a clone
    spawnClone: function() {
        if (game && game.cloneManager) {
            game.cloneManager.forceSpawn(game.player.position);
            console.log('Clone spawned manually');
        }
    },
    
    // Add time to the timer
    addTime: function(seconds = 30) {
        if (game && game.gameTimer) {
            game.gameTimer.addTime(seconds);
            console.log(`Added ${seconds} seconds to timer`);
        }
    },
    
    // Get clone information
    getCloneInfo: function() {
        if (game && game.cloneManager) {
            return game.cloneManager.getDebugInfo();
        }
        return 'No game instance';
    },
    
    // Get player information
    getPlayerInfo: function() {
        if (game && game.player) {
            return game.player.getState();
        }
        return 'No game instance';
    },
    
    // Toggle debug mode
    toggleDebug: function() {
        window.DEBUG_MODE = !window.DEBUG_MODE;
        console.log('Debug mode:', window.DEBUG_MODE ? 'ON' : 'OFF');
    },
    
    // Restart the game
    restart: function() {
        if (game) {
            game.restartGame();
            console.log('Game restarted manually');
        }
    }
};

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { game };
}

console.log('Clone Chaos main.js loaded');
console.log('Debug functions available at window.gameDebug');
console.log('Press F1 to toggle debug mode');
