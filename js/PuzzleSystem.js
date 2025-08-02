class PuzzleSystem {
    constructor() {
        this.puzzleElements = [];
        this.activePuzzles = [];
        this.solvedPuzzles = [];
        this.exitPosition = new Vector2(750, 550); // Near bottom-right corner
        this.exitSize = 40;
        this.exitActive = false;
    }

    initialize(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.createPuzzleElements();
    }

    createPuzzleElements() {
        // Create pressure plates that require multiple entities
        this.addPressurePlate(200, 150, 'plate1', 2); // Requires 2 entities
        this.addPressurePlate(600, 200, 'plate2', 3); // Requires 3 entities
        this.addPressurePlate(400, 400, 'plate3', 1); // Requires 1 entity

        // Create timed switches
        this.addTimedSwitch(150, 300, 'switch1', 5000); // 5 second timer
        this.addTimedSwitch(650, 350, 'switch2', 3000); // 3 second timer

        // Create moving platforms
        this.addMovingPlatform(300, 250, 100, 0, 'platform1'); // Horizontal movement
        this.addMovingPlatform(500, 100, 0, 80, 'platform2'); // Vertical movement

        // Create laser barriers
        this.addLaserBarrier(250, 50, 250, 150, 'laser1');
        this.addLaserBarrier(450, 300, 550, 300, 'laser2');

        console.log(`Created ${this.puzzleElements.length} puzzle elements`);
    }

    addPressurePlate(x, y, id, requiredEntities) {
        const plate = {
            type: 'pressurePlate',
            id: id,
            position: new Vector2(x, y),
            size: 30,
            requiredEntities: requiredEntities,
            currentEntities: 0,
            isActivated: false,
            activationRadius: 25,
            color: '#4488ff',
            activatedColor: '#44ff44'
        };
        this.puzzleElements.push(plate);
    }

    addTimedSwitch(x, y, id, duration) {
        const timedSwitch = {
            type: 'timedSwitch',
            id: id,
            position: new Vector2(x, y),
            size: 20,
            duration: duration,
            remainingTime: 0,
            isActivated: false,
            isPressed: false,
            color: '#ff8844',
            activatedColor: '#44ff44',
            lastInteractionTime: 0
        };
        this.puzzleElements.push(timedSwitch);
    }

    addMovingPlatform(x, y, moveX, moveY, id) {
        const platform = {
            type: 'movingPlatform',
            id: id,
            startPosition: new Vector2(x, y),
            position: new Vector2(x, y),
            size: new Vector2(80, 20),
            movement: new Vector2(moveX, moveY),
            moveSpeed: 50, // pixels per second
            direction: 1,
            isActivated: false,
            color: '#8844ff'
        };
        this.puzzleElements.push(platform);
    }

    addLaserBarrier(x1, y1, x2, y2, id) {
        const laser = {
            type: 'laserBarrier',
            id: id,
            start: new Vector2(x1, y1),
            end: new Vector2(x2, y2),
            isActive: true,
            canBeBlocked: true,
            blockedBy: [],
            color: '#ff4444',
            disabledColor: '#444444'
        };
        this.puzzleElements.push(laser);
    }

    update(deltaTime, player, clones) {
        // Update all puzzle elements
        for (const element of this.puzzleElements) {
            this.updatePuzzleElement(element, deltaTime, player, clones);
        }

        // Check if all puzzles are solved
        this.checkWinCondition();
    }

    updatePuzzleElement(element, deltaTime, player, clones) {
        switch (element.type) {
            case 'pressurePlate':
                this.updatePressurePlate(element, player, clones);
                break;
            case 'timedSwitch':
                this.updateTimedSwitch(element, deltaTime, player, clones);
                break;
            case 'movingPlatform':
                this.updateMovingPlatform(element, deltaTime);
                break;
            case 'laserBarrier':
                this.updateLaserBarrier(element, player, clones);
                break;
        }
    }

    updatePressurePlate(plate, player, clones) {
        // Count entities on the pressure plate
        let entitiesOnPlate = 0;
        
        // Check player
        if (player.position.distanceTo(plate.position) <= plate.activationRadius) {
            entitiesOnPlate++;
        }
        
        // Check clones
        for (const clone of clones) {
            if (clone.isActive && clone.position.distanceTo(plate.position) <= plate.activationRadius) {
                entitiesOnPlate++;
            }
        }
        
        plate.currentEntities = entitiesOnPlate;
        plate.isActivated = entitiesOnPlate >= plate.requiredEntities;
    }

    updateTimedSwitch(timedSwitch, deltaTime, player, clones) {
        // Check if switch is being pressed
        const switchRadius = 25;
        let isBeingPressed = false;
        
        if (player.position.distanceTo(timedSwitch.position) <= switchRadius) {
            isBeingPressed = true;
        }
        
        for (const clone of clones) {
            if (clone.canInteract() && 
                clone.position.distanceTo(timedSwitch.position) <= switchRadius) {
                isBeingPressed = true;
                break;
            }
        }
        
        // Handle switch activation
        if (isBeingPressed && !timedSwitch.isPressed) {
            timedSwitch.isPressed = true;
            timedSwitch.remainingTime = timedSwitch.duration;
            timedSwitch.lastInteractionTime = Date.now();
            console.log(`Timed switch ${timedSwitch.id} activated`);
        }
        
        // Update timer
        if (timedSwitch.remainingTime > 0) {
            timedSwitch.remainingTime -= deltaTime * 1000;
            timedSwitch.isActivated = true;
        } else {
            timedSwitch.isActivated = false;
            timedSwitch.isPressed = false;
        }
    }

    updateMovingPlatform(platform, deltaTime) {
        if (!platform.isActivated) return;
        
        // Move platform back and forth
        const movement = Vector2.multiply(platform.movement, platform.direction * deltaTime);
        platform.position.add(movement);
        
        // Check bounds and reverse direction
        const distanceFromStart = platform.position.distanceTo(platform.startPosition);
        if (distanceFromStart >= 100) { // Max distance from start
            platform.direction *= -1;
        }
    }

    updateLaserBarrier(laser, player, clones) {
        if (!laser.canBeBlocked) return;
        
        laser.blockedBy = [];
        
        // Check if any entity is blocking the laser
        const entities = [player, ...clones.filter(c => c.isActive)];
        
        for (const entity of entities) {
            if (this.isEntityBlockingLaser(entity, laser)) {
                laser.blockedBy.push(entity);
            }
        }
        
        laser.isActive = laser.blockedBy.length === 0;
    }

    isEntityBlockingLaser(entity, laser) {
        // Simple line-circle intersection test
        const lineLength = laser.start.distanceTo(laser.end);
        const direction = Vector2.subtract(laser.end, laser.start).normalize();
        
        // Project entity position onto laser line
        const toEntity = Vector2.subtract(entity.position, laser.start);
        const projectionLength = toEntity.x * direction.x + toEntity.y * direction.y;
        
        // Check if projection is within laser bounds
        if (projectionLength < 0 || projectionLength > lineLength) {
            return false;
        }
        
        // Calculate closest point on laser to entity
        const closestPoint = Vector2.add(laser.start, Vector2.multiply(direction, projectionLength));
        const distance = entity.position.distanceTo(closestPoint);
        
        return distance <= entity.size;
    }

    checkWinCondition() {
        // Check if all required puzzles are solved
        const requiredPuzzles = this.puzzleElements.filter(e => 
            e.type === 'pressurePlate' || e.type === 'timedSwitch'
        );
        
        const solvedCount = requiredPuzzles.filter(puzzle => puzzle.isActivated).length;
        const totalRequired = requiredPuzzles.length;
        
        // Activate exit when enough puzzles are solved
        this.exitActive = solvedCount >= Math.ceil(totalRequired * 0.7); // 70% of puzzles
        
        // Activate moving platforms when some puzzles are solved
        for (const platform of this.puzzleElements.filter(e => e.type === 'movingPlatform')) {
            platform.isActivated = solvedCount >= 2;
        }
    }

    checkPlayerAtExit(playerPosition) {
        if (!this.exitActive) return false;
        return playerPosition.distanceTo(this.exitPosition) <= this.exitSize;
    }

    render(ctx) {
        // Render all puzzle elements
        for (const element of this.puzzleElements) {
            this.renderPuzzleElement(ctx, element);
        }
        
        // Render exit
        this.renderExit(ctx);
    }

    renderPuzzleElement(ctx, element) {
        ctx.save();
        
        switch (element.type) {
            case 'pressurePlate':
                this.renderPressurePlate(ctx, element);
                break;
            case 'timedSwitch':
                this.renderTimedSwitch(ctx, element);
                break;
            case 'movingPlatform':
                this.renderMovingPlatform(ctx, element);
                break;
            case 'laserBarrier':
                this.renderLaserBarrier(ctx, element);
                break;
        }
        
        ctx.restore();
    }

    renderPressurePlate(ctx, plate) {
        const color = plate.isActivated ? plate.activatedColor : plate.color;
        
        ctx.fillStyle = color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(plate.position.x, plate.position.y, plate.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Show required entities
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${plate.currentEntities}/${plate.requiredEntities}`, 
                    plate.position.x, plate.position.y + 4);
    }

    renderTimedSwitch(ctx, timedSwitch) {
        const color = timedSwitch.isActivated ? timedSwitch.activatedColor : timedSwitch.color;
        
        ctx.fillStyle = color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        ctx.fillRect(timedSwitch.position.x - timedSwitch.size, 
                    timedSwitch.position.y - timedSwitch.size,
                    timedSwitch.size * 2, timedSwitch.size * 2);
        ctx.strokeRect(timedSwitch.position.x - timedSwitch.size, 
                      timedSwitch.position.y - timedSwitch.size,
                      timedSwitch.size * 2, timedSwitch.size * 2);
        
        // Show timer
        if (timedSwitch.remainingTime > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            const timeLeft = Math.ceil(timedSwitch.remainingTime / 1000);
            ctx.fillText(timeLeft.toString(), timedSwitch.position.x, timedSwitch.position.y + 3);
        }
    }

    renderMovingPlatform(ctx, platform) {
        ctx.fillStyle = platform.isActivated ? platform.color : '#444444';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        
        ctx.fillRect(platform.position.x - platform.size.x / 2,
                    platform.position.y - platform.size.y / 2,
                    platform.size.x, platform.size.y);
        ctx.strokeRect(platform.position.x - platform.size.x / 2,
                      platform.position.y - platform.size.y / 2,
                      platform.size.x, platform.size.y);
    }

    renderLaserBarrier(ctx, laser) {
        ctx.strokeStyle = laser.isActive ? laser.color : laser.disabledColor;
        ctx.lineWidth = 3;
        ctx.setLineDash(laser.isActive ? [] : [5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(laser.start.x, laser.start.y);
        ctx.lineTo(laser.end.x, laser.end.y);
        ctx.stroke();
        
        ctx.setLineDash([]);
    }

    renderExit(ctx) {
        const color = this.exitActive ? '#44ff44' : '#666666';
        const glowColor = this.exitActive ? '#88ff88' : '#444444';
        
        ctx.save();
        
        if (this.exitActive) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 20;
        }
        
        ctx.fillStyle = color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.arc(this.exitPosition.x, this.exitPosition.y, this.exitSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Exit label
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('EXIT', this.exitPosition.x, this.exitPosition.y + 4);
        
        ctx.restore();
    }

    reset() {
        // Reset all puzzle states
        for (const element of this.puzzleElements) {
            element.isActivated = false;
            if (element.type === 'pressurePlate') {
                element.currentEntities = 0;
            } else if (element.type === 'timedSwitch') {
                element.remainingTime = 0;
                element.isPressed = false;
            } else if (element.type === 'movingPlatform') {
                element.position = element.startPosition.copy();
                element.direction = 1;
            } else if (element.type === 'laserBarrier') {
                element.isActive = true;
                element.blockedBy = [];
            }
        }
        
        this.exitActive = false;
        console.log('Puzzle system reset');
    }
}
