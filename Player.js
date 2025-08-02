class Player {
    constructor(x, y, actionRecorder) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.speed = 150; // pixels per second
        this.size = 20;
        this.color = '#00ff88';
        this.actionRecorder = actionRecorder;
        
        // Input state
        this.keys = {
            w: false, a: false, s: false, d: false,
            up: false, left: false, down: false, right: false,
            space: false
        };
        
        // Movement state
        this.isMoving = false;
        this.lastPosition = this.position.copy();
        this.lastRecordTime = 0;
        this.recordInterval = 50; // Record position every 50ms
        
        this.setupInputHandlers();
    }

    setupInputHandlers() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        
        switch(key) {
            case 'w':
            case 'arrowup':
                this.keys.w = true;
                this.keys.up = true;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.a = true;
                this.keys.left = true;
                break;
            case 's':
            case 'arrowdown':
                this.keys.s = true;
                this.keys.down = true;
                break;
            case 'd':
            case 'arrowright':
                this.keys.d = true;
                this.keys.right = true;
                break;
            case ' ':
                if (!this.keys.space) {
                    this.keys.space = true;
                    this.interact();
                }
                event.preventDefault();
                break;
        }
    }

    handleKeyUp(event) {
        const key = event.key.toLowerCase();
        
        switch(key) {
            case 'w':
            case 'arrowup':
                this.keys.w = false;
                this.keys.up = false;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.a = false;
                this.keys.left = false;
                break;
            case 's':
            case 'arrowdown':
                this.keys.s = false;
                this.keys.down = false;
                break;
            case 'd':
            case 'arrowright':
                this.keys.d = false;
                this.keys.right = false;
                break;
            case ' ':
                this.keys.space = false;
                break;
        }
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        // Calculate movement vector
        const movement = new Vector2(0, 0);
        
        if (this.keys.w || this.keys.up) movement.y -= 1;
        if (this.keys.s || this.keys.down) movement.y += 1;
        if (this.keys.a || this.keys.left) movement.x -= 1;
        if (this.keys.d || this.keys.right) movement.x += 1;
        
        // Normalize diagonal movement
        if (movement.magnitude() > 0) {
            movement.normalize();
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }
        
        // Apply movement
        this.velocity = Vector2.multiply(movement, this.speed);
        const deltaMovement = Vector2.multiply(this.velocity, deltaTime);
        this.position.add(deltaMovement);
        
        // Keep player within canvas bounds
        this.position.x = Math.max(this.size, Math.min(canvasWidth - this.size, this.position.x));
        this.position.y = Math.max(this.size, Math.min(canvasHeight - this.size, this.position.y));
        
        // Record movement for clones
        this.recordMovement(deltaTime);
    }

    recordMovement(deltaTime) {
        const currentTime = Date.now();
        
        // Record position at regular intervals or when movement changes significantly
        if (currentTime - this.lastRecordTime >= this.recordInterval || 
            this.position.distanceTo(this.lastPosition) > 5) {
            
            if (this.actionRecorder) {
                this.actionRecorder.recordMovement(this.position, this.velocity);
            }
            
            this.lastPosition = this.position.copy();
            this.lastRecordTime = currentTime;
        }
    }

    interact() {
        // Record interaction
        if (this.actionRecorder) {
            this.actionRecorder.recordInteraction('activate', null, this.position);
        }
        
        // This will be expanded to interact with puzzle elements
        console.log('Player interaction at', this.position.toString());
    }

    render(ctx) {
        // Draw player as a glowing circle
        ctx.save();
        
        // Glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        // Main body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner core
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Direction indicator (if moving)
        if (this.isMoving && this.velocity.magnitude() > 0) {
            const direction = this.velocity.copy().normalize();
            const indicatorLength = this.size * 1.5;
            const endPoint = Vector2.add(this.position, Vector2.multiply(direction, indicatorLength));
            
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(endPoint.x, endPoint.y);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    // Get current state for debugging
    getState() {
        return {
            position: this.position.copy(),
            velocity: this.velocity.copy(),
            isMoving: this.isMoving,
            keys: { ...this.keys }
        };
    }

    // Reset player to starting position
    reset(x, y) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.isMoving = false;
        this.lastPosition = this.position.copy();
        
        // Clear input state
        Object.keys(this.keys).forEach(key => {
            this.keys[key] = false;
        });
    }
}
