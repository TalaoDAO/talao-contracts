import Freelancer from "../models/Freelancer";

class FreelancerService {
    static getFreelancer() {
        return new Freelancer();
    }
}

export default FreelancerService;