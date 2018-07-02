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
                new Date(2018, 1, 1), 
                new Date(2018, 6, 1),
                [
                    new Competency("Project Management", 100)
                ],
                null,
                100,
            ),
            new Experience(
                "Consectetur adipiscing", 
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec nec ex sodales, finibus quam nec, convallis augue.",
                new Date(2016, 1, 1), 
                new Date(2018, 1, 1),
                [
                    new Competency("Project Management", 90), 
                    new Competency("Blockchain", 80),
                    new Competency("Javascript", 85)
                ],
                null,
                83,
            ),
            new Experience(
                "Consectetur adipiscing 2", 
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec nec ex sodales, finibus quam nec, convallis augue.",
                new Date(2015, 10, 1), 
                new Date(2016, 1, 1),
                [
                    new Competency("Design", 95), 
                ],
                null,
                62,
            ),
            new Experience(
                "Consectetur adipiscing 3", 
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec nec ex sodales, finibus quam nec, convallis augue.",
                new Date(2015, 3, 1), 
                new Date(2015, 10, 1),
                [
                    new Competency("Javascript", 25), 
                ],
                null,
                13,
            ),
            new Experience(
                "Consectetur adipiscing 4", 
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec nec ex sodales, finibus quam nec, convallis augue.",
                new Date(2013, 1, 1), 
                new Date(2015, 3, 1),
                [
                    new Competency("Education", 35), 
                ],
                null,
                63,
            ),
        ]
    }

    getCompetencies() {
        let competencies = [];
        this.experiences.forEach((experience) => {
            experience.competencies.forEach((competency) => {
                let indexCompetency = competencies.findIndex(c => c.name === competency.name);
                if (indexCompetency === -1) {
                    competencies.push(new Competency(competency.name, competency.confidenceIndex, [experience]));
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