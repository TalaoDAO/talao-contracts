class Competency {
    constructor(name, experiences) {
        this.name = name;
        this.experiences = experiences;
    }

    getConfidenceIndex() {

        // TODO: compute the confidence index with real business rules
        if (this.experiences.length === 0) return 0;
        if (this.experiences.length === 1) return this.experiences[0].confidenceIndex;
        let sumOfConfidenceIndexes = this.experiences.reduce((experienceA, experienceB) => experienceA.confidenceIndex + experienceB.confidenceIndex);
        return sumOfConfidenceIndexes / this.experiences.length;
    }
}

export default Competency;