class Experience {
  constructor(
    title,
    description,
    from,
    to,
    competencies,
    certificatUrl,
    confidenceIndex,
    jobDuration,
    certificatAsked,
    idBlockchain,
    idBack,
    statusBack
  ) {
    this.title = title;
    this.description = description;
    this.from = from;
    this.to = to;
    this.competencies = competencies;
    this.certificatUrl = certificatUrl;
    this.confidenceIndex = confidenceIndex;
    this.jobDuration = jobDuration;
    this.certificatAsked = certificatAsked;
    this.idBlockchain = idBlockchain;
    this.idBack = idBack;
    this.status = statusBack;
  }
}

export default Experience;
