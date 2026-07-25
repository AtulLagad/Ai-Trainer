class MockBackendAPI {
    static async startWorkout() {
        return { session_id: "gh_session_" + Date.now(), status: "started" };
    }

    static async countRep(sessionId, exerciseName, currentReps) {
        const history = JSON.parse(localStorage.getItem('workout_history') || '[]');
        history.push({ sessionId, exerciseName, currentReps, timestamp: new Date().toISOString() });
        localStorage.setItem('workout_history', JSON.stringify(history));
        return { status: "recorded" };
    }

    static async finishWorkout(summaryData) {
        localStorage.setItem('last_workout_summary', JSON.stringify(summaryData));
        return { status: "saved" };
    }
}
