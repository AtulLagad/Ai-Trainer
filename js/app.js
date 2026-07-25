document.addEventListener('DOMContentLoaded', () => {
    const workoutManager = new WorkoutManager();
    let cameraManager = null;

    const startScreen = document.getElementById('start-screen');
    const workoutScreen = document.getElementById('workout-screen');
    const summaryScreen = document.getElementById('summary-screen');

    const btnStart = document.getElementById('btn-start-workout');
    const btnPause = document.getElementById('btn-pause');
    const btnResume = document.getElementById('btn-resume');
    const btnFinish = document.getElementById('btn-finish');
    const btnSwitchCam = document.getElementById('btn-switch-cam');
    const btnRestart = document.getElementById('btn-restart');

    const exNumber = document.getElementById('ex-number');
    const exTitle = document.getElementById('ex-title');
    const workoutProgress = document.getElementById('workout-progress');
    const statRemaining = document.getElementById('stat-remaining');
    const statReps = document.getElementById('stat-reps');
    const guideText = document.getElementById('guide-text');
    const poseIndicator = document.getElementById('pose-indicator');

    btnStart.addEventListener('click', async () => {
        startScreen.classList.add('hidden');
        workoutScreen.classList.remove('hidden');

        voice.speak("Welcome to AI Fitness Trainer. Let's begin.");
        await workoutManager.startWorkout();

        if (!cameraManager) {
            cameraManager = new CameraManager(
                document.getElementById('webcam'),
                document.getElementById('skeleton-canvas'),
                (landmarks) => handlePoseUpdate(landmarks)
            );
        }
        await cameraManager.start();
        updateUI();
    });

    function handlePoseUpdate(landmarks) {
        workoutManager.processFrame(landmarks);
        updateUI();

        if (workoutManager.isFinished()) {
            finishWorkoutSession();
        }
    }

    function updateUI() {
        if (workoutManager.isFinished()) return;

        const ex = workoutManager.getCurrentExercise();
        exNumber.textContent = `Exercise ${workoutManager.currentIndex + 1} of 5`;
        exTitle.textContent = ex.name;

        const remaining = ex.detector.targetReps - ex.detector.reps;
        statRemaining.textContent = remaining > 0 ? remaining : 0;
        statReps.textContent = ex.detector.reps;

        guideText.textContent = ex.detector.instructions;

        const progressPercent = (workoutManager.currentIndex / 5) * 100;
        workoutProgress.style.width = `${progressPercent}%`;

        if (ex.detector.postureOk) {
            poseIndicator.textContent = ex.detector.warningText || "Posture Good";
            poseIndicator.className = "status-indicator status-green";
        } else {
            poseIndicator.textContent = ex.detector.warningText;
            poseIndicator.className = "status-indicator status-red";
        }
    }

    btnPause.addEventListener('click', () => {
        workoutManager.isPaused = true;
        btnPause.classList.add('hidden');
        btnResume.classList.remove('hidden');
        voice.speak("Workout paused.");
    });

    btnResume.addEventListener('click', () => {
        workoutManager.isPaused = false;
        btnResume.classList.add('hidden');
        btnPause.classList.remove('hidden');
        voice.speak("Resuming workout.");
    });

    btnSwitchCam.addEventListener('click', async () => {
        if (cameraManager) await cameraManager.switchCamera();
    });

    btnFinish.addEventListener('click', () => {
        finishWorkoutSession();
    });

    btnRestart.addEventListener('click', () => {
        summaryScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    });

    function finishWorkoutSession() {
        if (cameraManager) cameraManager.stop();
        workoutScreen.classList.add('hidden');
        summaryScreen.classList.remove('hidden');

        const summary = workoutManager.getSummary();
        document.getElementById('sum-ex').textContent = summary.exercisesFinished;
        document.getElementById('sum-reps').textContent = summary.totalReps;
        document.getElementById('sum-time').textContent = summary.time;
        document.getElementById('sum-calories').textContent = `${summary.calories} kcal`;

        voice.speak("Workout Complete. Great job!");
    }
});
