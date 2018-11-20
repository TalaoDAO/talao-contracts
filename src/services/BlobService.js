const decoder = new TextDecoder('utf-8');

export default class BlobService {

  static BlobToJson(blob) {
    if (blob) {
      const result = JSON.parse(decoder.decode(Buffer.from(blob)))
      return result;
    }
  }

  static BlobCertificateToJson(blobCertificate) {
    let certificate = blobCertificate;
    certificate.signed_json = this.BlobToJson(blobCertificate.signed_json.data);
    return certificate;
  }

  static BlobCertificatesToJson(blobCertificates) {
    let certificates = [];
    blobCertificates.forEach(blobCertificate => {
      const certificate = this.BlobCertificateToJson(blobCertificate);
      certificates.push(certificate);
    });
    return certificates;
  }

}
