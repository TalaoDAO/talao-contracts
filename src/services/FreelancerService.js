import Freelancer from "../models/Freelancer";
import Experience from "../models/Experience";
import Competency from "../models/Competency";

class FreelancerService {

    static getFreelancer() {

        if(this.Freelancer == null)
            this.Freelancer = new Freelancer();

        return this.Freelancer;
    }

    // static NotifyFreelancerUpdate(freelancer) {
    //     this.Callback(freelancer);
    // }
}

export default FreelancerService;