import HttpHeaderHelper from '../helpers/headerHelper';
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

    //Define the route /user
    constructor() {
        this.experienceRoute = apiGlobalRoute + 'user'
        this.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          };
    }

    async register(email, password, confirmedpassword) {

        let response = await fetch(this.userRoute + '/register', {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
              email: email,
              password: password,
              confirmedpassword: confirmedpassword
            })
        });

        let data = await response.json();
        
        return data;
    }

}

export default ExperienceService;