class Competency {

    constructor(name, confidenceIndex, experiences, jobDuration) {
        this.name = name;
        this.confidenceIndex = confidenceIndex;
        this.jobDuration = jobDuration;

        if (experiences) {
            this.experiences = experiences;
        }
        else {
            this.experiences = [];
        }
    }

    updateConfidenceIndex(confidenceIndex, jobDuration) {
        let newAmountWorkedOn = parseInt(jobDuration, 10) + parseInt(this.jobDuration, 10);
        let oldRating = parseInt(this.jobDuration, 10) * parseInt(this.confidenceIndex, 10);
        let newRating = parseInt(confidenceIndex, 10) * parseInt(jobDuration, 10);
        this.confidenceIndex = (oldRating + newRating) / newAmountWorkedOn;
        this.jobDuration = newAmountWorkedOn;
    }

    getConfidenceIndex() {
        if (this.experiences.length === 0) return 0;
        return this.confidenceIndex;
    }
}

export default Competency;