import AuthHelper from '../../helpers/authHelper';
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
    const data = await response.json();
    return data;
  }

  async delete(id) {

    const response = await fetch(
      this.route + '/delete/' + id, {
        method: 'DELETE',
        headers: this.headers
      }
    );
    const data = await response.json();
    return data;
  }

}
