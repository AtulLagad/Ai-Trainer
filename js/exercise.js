function calculateAngle(a, b, c) {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
}

class BaseExercise {
    constructor(targetReps) {
        this.targetReps = targetReps;
        this.reps = 0;
        this.stage = "UP";
        this.postureOk = true;
        this.warningText = "Keep going!";
    }

    reset() {
        this.reps = 0;
        this.stage = "UP";
    }
}

class SquatDetector extends BaseExercise {
    constructor(targetReps = 10) {
        super(targetReps);
        this.instructions = "Stand straight with feet shoulder-width apart. Lower hips down, then return up.";
    }

    process(lm) {
        const hip = lm[24], knee = lm[26], ankle = lm[28];
        const shoulder = lm[12];
        const angle = calculateAngle(hip, knee, ankle);
        const backAngle = calculateAngle(shoulder, hip, knee);

        this.postureOk = true;
        this.warningText = "Good posture";

        if (backAngle < 60) {
            this.postureOk = false;
            this.warningText = "Keep your back straight!";
        }

        if (angle > 160) {
            this.stage = "UP";
        }
        if (angle < 90 && this.stage === "UP" && this.postureOk) {
            this.stage = "DOWN";
            this.reps += 1;
            return true;
        }
        return false;
    }
}

class JumpingJackDetector extends BaseExercise {
    constructor(targetReps = 20) {
        super(targetReps);
        this.instructions = "Start with feet together and arms at sides. Jump, spreading legs and bringing hands overhead.";
    }

    process(lm) {
        const leftHand = lm[15], rightHand = lm[16], head = lm[0];
        const leftAnkle = lm[27], rightAnkle = lm[28];

        const handsDistance = Math.hypot(leftHand.x - rightHand.x, leftHand.y - rightHand.y);
        const feetDistance = Math.hypot(leftAnkle.x - rightAnkle.x, leftAnkle.y - rightAnkle.y);

        this.postureOk = true;
        this.warningText = "Good form";

        if (handsDistance < 0.2 && feetDistance < 0.15) {
            this.stage = "IN";
        }
        if (leftHand.y < head.y && rightHand.y < head.y && feetDistance > 0.25 && this.stage === "IN") {
            this.stage = "OUT";
            this.reps += 1;
            return true;
        }
        return false;
    }
}

class LungeDetector extends BaseExercise {
    constructor(targetReps = 20) {
        super(targetReps);
        this.instructions = "Step forward with one leg and lower hips until knees form 90 degrees.";
    }

    process(lm) {
        const leftKneeAngle = calculateAngle(lm[23], lm[25], lm[27]);
        const rightKneeAngle = calculateAngle(lm[24], lm[26], lm[28]);

        this.postureOk = true;
        this.warningText = "Keep chest up";

        if (leftKneeAngle > 160 && rightKneeAngle > 160) {
            this.stage = "UP";
        }
        if ((leftKneeAngle < 100 || rightKneeAngle < 100) && this.stage === "UP") {
            this.stage = "DOWN";
            this.reps += 1;
            return true;
        }
        return false;
    }
}

class PushUpDetector extends BaseExercise {
    constructor(targetReps = 10) {
        super(targetReps);
        this.instructions = "Place hands shoulder-width apart. Lower body until chest nearly touches floor, then push up.";
    }

    process(lm) {
        const elbow = calculateAngle(lm[11], lm[13], lm[15]);
        const bodyAngle = calculateAngle(lm[11], lm[23], lm[27]);

        this.postureOk = true;
        this.warningText = "Keep body straight";

        if (bodyAngle < 140) {
            this.postureOk = false;
            this.warningText = "Don't sag your hips!";
        }

        if (elbow > 160) {
            this.stage = "UP";
        }
        if (elbow < 90 && this.stage === "UP" && this.postureOk) {
            this.stage = "DOWN";
            this.reps += 1;
            return true;
        }
        return false;
    }
}

class PlankDetector extends BaseExercise {
    constructor(targetSeconds = 30) {
        super(targetSeconds);
        this.instructions = "Hold a push-up position resting on forearms. Maintain a straight line from head to heels.";
        this.lastTime = Date.now();
    }

    process(lm) {
        const bodyAngle = calculateAngle(lm[11], lm[23], lm[27]);
        this.postureOk = bodyAngle > 150;
        
        if (!this.postureOk) {
            this.warningText = "Align your back and hips!";
            return false;
        }

        this.warningText = "Holding plank position...";
        const now = Date.now();
        if (now - this.lastTime >= 1000) {
            this.reps += 1;
            this.lastTime = now;
            return true;
        }
        return false;
    }
}
