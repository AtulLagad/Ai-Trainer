class CameraManager {
    constructor(videoElement, canvasElement, onResultsCallback) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.onResultsCallback = onResultsCallback;
        this.facingMode = 'user';
        this.camera = null;

        this.initPose();
    }

    initPose() {
        this.pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        this.pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.pose.onResults((results) => this.handleResults(results));
    }

    async start() {
        if (this.camera) {
            await this.camera.stop();
        }

        this.camera = new Camera(this.video, {
            onFrame: async () => {
                await this.pose.send({ image: this.video });
            },
            facingMode: this.facingMode,
            width: 640,
            height: 480
        });

        await this.camera.start();
    }

    async switchCamera() {
        this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
        await this.start();
    }

    handleResults(results) {
        this.canvas.width = this.video.videoWidth || 640;
        this.canvas.height = this.video.videoHeight || 480;

        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (results.poseLandmarks) {
            this.drawSkeleton(results.poseLandmarks);
            this.onResultsCallback(results.poseLandmarks);
        }
        this.ctx.restore();
    }

    drawSkeleton(landmarks) {
        landmarks.forEach((lm) => {
            this.ctx.beginPath();
            this.ctx.arc(lm.x * this.canvas.width, lm.y * this.canvas.height, 4, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#38bdf8';
            this.ctx.fill();
        });
    }

    stop() {
        if (this.camera) this.camera.stop();
    }
}
