const apiGlobalRoute = process.env.REACT_APP_API_ADDRESS;

class OrganizationService {
    //Singleton for the Organization route
    static getOrganizationService() {
        if(this.Organization == null) {
            this.Organization = new Organization();
        }
        return this.Organization;
    }
}

class Organization {

    //Define the route /organization
    constructor() {
        this.organizationRoute = apiGlobalRoute + 'organization'
        this.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          };
    }

    async getOrganizations() {

        let response = await fetch(this.organizationRoute, {
            method: 'GET',
            headers: this.headers
        });

        let data = await response.json();
        
        return data;
    }

    async add(organization) {

        let response = await fetch(this.organizationRoute + '/create', {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                organization
            })
        });

        let data = await response.json();
        
        return data;
    }

    async getAllFromEth(ethaddress) {

        let response = await fetch(this.organizationRoute + '/frometh/' + ethaddress, {
            method: 'GET',
            headers: this.headers
        });

        let data = await response.json();
        
        return data;
    }
}

export default OrganizationService;