class Experience {
  constructor(
    title,
    description,
    from,
    to,
    competencies,
    certificatUrl,
    certificate,
    confidenceIndex,
    jobDuration,
    certificatAsked,
    idBlockchain,
    idBack,
    statusBack,
    certificateId
  ) {
    this.title = title;
    this.description = description;
    this.from = from;
    this.to = to;
    this.competencies = competencies;
    this.certificatUrl = certificatUrl;
    this.certificate = certificate;
    this.confidenceIndex = confidenceIndex;
    this.jobDuration = jobDuration;
    this.certificatAsked = certificatAsked;
    this.idBlockchain = idBlockchain;
    this.idBack = idBack;
    this.status = statusBack;
    this.certificateId = certificateId;
  }
}

export default Experience;
