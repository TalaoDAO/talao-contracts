class Competency {

    constructor(name, confidenceIndex, experiences) {
        this.name = name;
        this.confidenceIndex = confidenceIndex;
        if (experiences) {
            this.experiences = experiences;
        }
        else {
            this.experiences = [];
        }
    }

    updateConfidenceIndex(confidenceIndex) {
        this.confidenceIndex = Math.round((parseInt(this.confidenceIndex, 10) + parseInt(confidenceIndex, 10)) / 2);
    }

    getConfidenceIndex() {
        if (this.experiences.length === 0) return 0;
        return this.confidenceIndex;
    }
}

export default Competency;