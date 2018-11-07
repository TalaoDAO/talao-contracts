import BackendAuth from '../helpers/BackendAuth';
const apiGlobalRoute = process.env.REACT_APP_API_ADDRESS;

class CertificateService {
  static getCertificateService() {
    if (this.Certificate == null) {
      this.Certificate = new Certificate();
    }
    return this.Certificate;
  }
}

class Certificate {

  constructor() {
    this.vaultRoute = apiGlobalRoute + 'vault/';
    this.freelanceVaultRoute = this.vaultRoute + 'freelance';
    this.clientVaultRoute = this.vaultRoute + 'client';
    this.headers = BackendAuth.setHeaders();
  }

  /**
   * Freelance.
   */

  async get() {

    const response = await fetch(
      this.freelanceVaultRoute + '/certificate', {
        method: 'GET',
        headers: this.headers
    });

    const data = await response.json();

    return data;
  }

  async delete(id) {

    const response = await fetch(
      this.freelanceVaultRoute + '/certificate/delete/' + id, {
        method: 'DELETE',
        headers: this.headers
    });

    const data = await response.json();

    return data;
  }

  /**
   * Client.
   */
}

export default CertificateService;
