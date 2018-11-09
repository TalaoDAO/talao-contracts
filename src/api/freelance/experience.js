import AuthHelper from '../../helpers/authHelper';
const apiGlobalRoute = process.env.REACT_APP_API_ADDRESS;

export default class ExperienceService {

  static getService() {
    if (this.Experience == null) {
      this.Experience = new Experience();
    }
    return this.Experience;
  }
}

class Experience {

  constructor() {
    this.route = apiGlobalRoute + 'vault/freelance/experience';
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

  async add(experience) {
    const response = await fetch(
      this.route + '/create', {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          experience
        })
      }
    );
    const data = await response.json();
    return data;
  }

  async update(id, experience) {
    const response = await fetch(
      this.route + '/update/' + id, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({
          experience
        })
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
