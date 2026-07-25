class VoiceService {
    constructor() {
        this.synth = window.speechSynthesis;
    }

    speak(text) {
        if (!this.synth) return;
        if (this.synth.speaking) {
            this.synth.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        this.synth.speak(utterance);
    }
}

const voice = new VoiceService();
