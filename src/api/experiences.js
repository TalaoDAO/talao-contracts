const apiGlobalRoute = process.env.REACT_APP_API_ADDRESS;

class ExperienceService {
    //Singleton for the Experience route
    static getExperienceService() {
        if(this.Experience == null) {
            this.Experience = new Experience();
        }
        return this.Experience;
    }
}

class Experience {

    //Define the route /experience
    constructor() {
        this.experienceRoute = apiGlobalRoute + 'experience'
        this.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          };
    }

    async add(experience) {

        let response = await fetch(this.experienceRoute + '/create', {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                experience
            })
        });

        let data = await response.json();
        
        return data;
    }

    async getAll() {

        let response = await fetch(this.experienceRoute, {
            method: 'GET',
            headers: this.headers
        });

        let data = await response.json();
        
        return data;
    }

    async getAllFromEth(ethaddress) {

        let response = await fetch(this.experienceRoute + '/frometh/' + ethaddress, {
            method: 'GET',
            headers: this.headers
        });

        let data = await response.json();
        
        return data;
    }

    async delete(id) {

        let response = await fetch(this.experienceRoute + '/delete/' + id, {
            method: 'DELETE',
            headers: this.headers
        });

        let data = await response.json();
        
        return data;
    }

    async update(id, experience) {

        let response = await fetch(this.experienceRoute + '/update/' + id, {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify({
                experience
            })
        });

        let data = await response.json();
        
        return data;
    }
}

export default ExperienceService;