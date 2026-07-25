class WorkoutManager {
    constructor() {
        this.exercises = [
            { name: "Squats", detector: new SquatDetector(10) },
            { name: "Jumping Jacks", detector: new JumpingJackDetector(20) },
            { name: "Lunges", detector: new LungeDetector(20) },
            { name: "Push-ups", detector: new PushUpDetector(10) },
            { name: "Plank", detector: new PlankDetector(30) }
        ];
        this.currentIndex = 0;
        this.isPaused = false;
        this.startTime = null;
        this.totalRepsCompleted = 0;
        this.inactivityTimer = null;
        this.sessionId = null;
    }

    getCurrentExercise() {
        return this.exercises[this.currentIndex];
    }

    async startWorkout() {
        this.currentIndex = 0;
        this.totalRepsCompleted = 0;
        this.startTime = Date.now();
        this.isPaused = false;
        const apiRes = await MockBackendAPI.startWorkout();
        this.sessionId = apiRes.session_id;
        this.announceCurrentExercise();
    }

    announceCurrentExercise() {
        const ex = this.getCurrentExercise();
        voice.speak(`Next exercise is ${ex.name}. ${ex.detector.instructions}`);
        this.resetInactivityTimer();
    }

    processFrame(landmarks) {
        if (this.isPaused) return;

        const currentEx = this.getCurrentExercise();
        const repIncremented = currentEx.detector.process(landmarks);

        if (repIncremented) {
            this.resetInactivityTimer();
            this.totalRepsCompleted += 1;
            voice.speak(`${currentEx.detector.reps}`);

            MockBackendAPI.countRep(this.sessionId, currentEx.name, currentEx.detector.reps);

            if (currentEx.detector.reps >= currentEx.detector.targetReps) {
                this.nextExercise();
            }
        }
    }

    nextExercise() {
        voice.speak("Excellent! Exercise complete.");
        this.currentIndex += 1;
        if (this.currentIndex < this.exercises.length) {
            setTimeout(() => this.announceCurrentExercise(), 2000);
        }
    }

    isFinished() {
        return this.currentIndex >= this.exercises.length;
    }

    resetInactivityTimer() {
        clearTimeout(this.inactivityTimer);
        this.inactivityTimer = setTimeout(() => {
            if (!this.isPaused && !this.isFinished()) {
                voice.speak("Continue your workout.");
            }
        }, 10000);
    }

    getSummary() {
        const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const estimatedCalories = Math.round(this.totalRepsCompleted * 0.5);

        const summary = {
            exercisesFinished: this.currentIndex,
            totalReps: this.totalRepsCompleted,
            time: timeFormatted,
            calories: estimatedCalories
        };

        MockBackendAPI.finishWorkout(summary);
        return summary;
    }
}
