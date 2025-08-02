class ActionRecorder {
    constructor() {
        this.actions = [];
        this.isRecording = false;
        this.maxRecordingTime = 10000; // 10 seconds in milliseconds
        this.recordingStartTime = 0;
    }

    // Start recording player actions
    startRecording() {
        this.actions = [];
        this.isRecording = true;
        this.recordingStartTime = Date.now();
        console.log('Started recording actions');
    }

    // Stop recording and return the recorded sequence
    stopRecording() {
        this.isRecording = false;
        const recordedActions = [...this.actions];
        console.log(`Stopped recording. Captured ${recordedActions.length} actions`);
        return recordedActions;
    }

    // Record a single action
    recordAction(actionType, data = {}) {
        if (!this.isRecording) return;

        const currentTime = Date.now();
        const elapsedTime = currentTime - this.recordingStartTime;

        // Stop recording if we've exceeded the max time
        if (elapsedTime >= this.maxRecordingTime) {
            this.stopRecording();
            return;
        }

        const action = {
            type: actionType,
            timestamp: elapsedTime,
            data: { ...data }
        };

        this.actions.push(action);
    }

    // Record movement action
    recordMovement(position, velocity = new Vector2(0, 0)) {
        this.recordAction('move', {
            position: position.copy(),
            velocity: velocity.copy()
        });
    }

    // Record interaction action
    recordInteraction(interactionType, targetId = null, position = null) {
        this.recordAction('interact', {
            interactionType,
            targetId,
            position: position ? position.copy() : null
        });
    }

    // Record state change (for debugging and advanced features)
    recordStateChange(stateType, oldValue, newValue) {
        this.recordAction('stateChange', {
            stateType,
            oldValue,
            newValue
        });
    }

    // Get actions within a specific time range
    getActionsInRange(startTime, endTime) {
        return this.actions.filter(action => 
            action.timestamp >= startTime && action.timestamp <= endTime
        );
    }

    // Get the total recording duration
    getRecordingDuration() {
        if (this.actions.length === 0) return 0;
        const lastAction = this.actions[this.actions.length - 1];
        return lastAction.timestamp;
    }

    // Clear all recorded actions
    clear() {
        this.actions = [];
        this.isRecording = false;
        this.recordingStartTime = 0;
    }

    // Create a compressed version of actions for memory efficiency
    compress() {
        // Remove redundant movement actions that are too similar
        const compressed = [];
        let lastMoveAction = null;
        const positionThreshold = 2; // pixels

        for (const action of this.actions) {
            if (action.type === 'move') {
                if (lastMoveAction && 
                    action.data.position.distanceTo(lastMoveAction.data.position) < positionThreshold) {
                    // Skip this action as it's too similar to the last one
                    continue;
                }
                lastMoveAction = action;
            }
            compressed.push(action);
        }

        return compressed;
    }

    // Debug method to log all actions
    debugLog() {
        console.log('Recorded Actions:');
        this.actions.forEach((action, index) => {
            console.log(`${index}: ${action.type} at ${action.timestamp}ms`, action.data);
        });
    }
}
