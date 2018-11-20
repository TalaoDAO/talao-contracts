import AuthHelper from '../../helpers/authHelper';
import BlobService from '../../services/BlobService';

const apiGlobalRoute = process.env.REACT_APP_API_ADDRESS;

export default class CertificateService {

  static getService() {
    if (this.Certificate == null) {
      this.Certificate = new Certificate();
    }
    return this.Certificate;
  }

}

class Certificate {

  constructor() {
    this.route = apiGlobalRoute + 'vault/freelance/certificate';
    this.headers = AuthHelper.setHeaders();
  }

  async get() {
    const response = await fetch(
      this.route, {
        method: 'GET',
        headers: this.headers
      }
    );
    const blobCertificates = await response.json();
    const result = BlobService.BlobCertificatesToJson(blobCertificates);
    return result;
  }

  async share(id) {
    const response = await fetch(
      this.route + '/share/' + id, {
        method: 'PUT',
        headers: this.headers
      }
    );
    const blobCertificate = await response.json();
    const result = BlobService.BlobCertificateToJson(blobCertificate);
    return result;
  }

  async delete(id) {
    const response = await fetch(
      this.route + '/delete/' + id, {
        method: 'DELETE',
        headers: this.headers
      }
    );
    const result = await response.json();
    return result;
  }

}
