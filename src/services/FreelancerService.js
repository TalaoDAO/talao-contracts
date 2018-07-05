import Freelancer from "../models/Freelancer";

class FreelancerService {

    static getFreelancer() {
        if(this.Freelancer == null)
            this.Freelancer = new Freelancer();

        return this.Freelancer;
    }
}

export default FreelancerService;