import BackendHeaders from '../helpers/BackendHeaders';
const apiGlobalRoute = process.env.REACT_APP_API_ADDRESS;

class CertificatService {
  //Singleton for the Certificat route
  static getCertificatService() {
    if(this.Certificat == null) {
      this.Certificat = new Certificat();
    }
    return this.Certificat;
  }
}

class Certificat {

  //Define the route /organization
  constructor() {
    this.certificatRoute = apiGlobalRoute + 'certificat';
    this.clientVaultRoute = apiGlobalRoute + 'vault/client';
    this.freelanceVaultRoute = apiGlobalRoute + 'vault/freelance';
    this.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  async getAllFromEth(ethaddress) {

    let response = await fetch(this.certificatRoute + '/frometh/' + ethaddress, {
      method: 'GET',
      headers: this.headers
    });

    let data = await response.json();

    return data;
  }

  async delete(id) {

    const response = await fetch(this.freelanceVaultRoute + '/certificate/delete/' + id, {
      method: 'DELETE',
      headers: BackendHeaders.setBackendHeaders()
    });

    const data = await response.json();

    return data;
  }
}

export default CertificatService;
