import AuthHelper from '../../helpers/authHelper';
const apiGlobalRoute = process.env.REACT_APP_API_ADDRESS;

export default class OrganizationService {

  static getService() {
    if (this.Organization == null) {
      this.Organization = new Organization();
    }
    return this.Organization;
  }

}

class Organization {

  constructor() {
    this.route = apiGlobalRoute + 'vault/freelance/organization';
    this.headers = AuthHelper.setHeaders();
  }

  async get(filters = null) {
    let url = new URL(this.route);
    if (filters) {
      Object.keys(filters).forEach(key => url.searchParams.append(key, filters[key]));  
    }
    const response = await fetch(
      url, {
        method: 'GET',
        headers: this.headers
      }
    );
    const result = await response.json();
    return result;
  }

  async add(organization) {

    const response = await fetch(
      this.organizationRoute + '/create', {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          organization
        })
      }
    );
    const data = await response.json();
    return data;
  }

}
