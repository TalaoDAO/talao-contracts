import Experience from './Experience';
import Competency from './Competency';

class Freelancer {
    constructor() {
        this.firstName = "Paul";
        this.lastName = "Durand";
        this.confidenceIndex = 82;
        this.title = "Blockchain specialist";
        this.description = "You have a project that implies the use of the blockchain? I can surely guide you to the road of success.";
        this.pictureUrl = "freelancer-picture.jpg";
        this.email = "paul.durand@gmail.com";
        this.phone = "(650) 555-1234";
        this.ethereumAddress = "0xEf9E029Ca326b4201927AD2672545cbE19DA10f1";
        this.experiences = [
            new Experience(
                "Dolor sit amet", 
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec nec ex sodales, finibus quam nec, convallis augue. Donec vestibulum lectus eu orci eleifend ultrices. Nunc ornare nec libero a ornare. Integer consectetur mi in est maximus tristique. Curabitur maximus ligula ipsum, mollis consequat erat aliquam vitae.",
                new Date(), 
                new Date(),
                ["Project Management"],
                null,
                100,
            ),
            new Experience(
                "Consectetur adipiscing", 
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec nec ex sodales, finibus quam nec, convallis augue.",
                new Date(), 
                new Date(),
                ["Project Management", "Blockchain", "Javascript"],
                null,
                83,
            ),
            new Experience(
                "Consectetur adipiscing", 
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec nec ex sodales, finibus quam nec, convallis augue.",
                new Date(), 
                new Date(),
                ["Design"],
                null,
                62,
            ),
            new Experience(
                "Consectetur adipiscing", 
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec nec ex sodales, finibus quam nec, convallis augue.",
                new Date(), 
                new Date(),
                ["Javascript"],
                null,
                13,
            ),
            new Experience(
                "Consectetur adipiscing", 
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec nec ex sodales, finibus quam nec, convallis augue.",
                new Date(), 
                new Date(),
                ["Education"],
                null,
                63,
            ),
        ]
    }

    getCompetencies() {
        let competencies = [];
        this.experiences.forEach((experience, index) => {
            experience.competencies.forEach((competencyName) => {
                let indexCompetency = competencies.findIndex(c => c.name === competencyName);
                if (indexCompetency === -1) {
                    competencies.push(new Competency(competencyName, [experience]));
                }
                else {
                    competencies[indexCompetency].experiences.push(experience);
                }
            });
        });
        return competencies;
    }
}

export default Freelancer;