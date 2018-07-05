import React from 'react';
import Experience from '../experience/Experience';
import FreelancerService from '../../services/FreelancerService';
import Card from '@material-ui/core/Card';
import ColorService from '../../services/ColorService';
import { withStyles, CardContent } from '@material-ui/core';
import NewExperience from '../experience/NewExperience';

const styles = {
    card: {
        transition: 'all .6s ease',
        paddingBottom: '15px',
    },
}

class Chronology extends React.Component {

    constructor() {
        super();
        //this.free = FreelancerService.getFreelancer();
        this.state = {
            freelancer : window.freeLancer,
            experiences: null
        };
    }

    componentDidMount() {
        //this.free.addListener('ExperienceChanged', this.handleEvents, this);
        //this.setState({freelancer : window.freeLancer});
        
        const exPeriences = this.state.freelancer.experiences//this.state.experiences
        // Sort descending by date
        .sort((extendedExperienceA, extendedExperienceB) => {
            return extendedExperienceA.from < extendedExperienceB.from;
        })

        // Generate components
        .map((extendedExperience) => {
            const backgroundColorString = ColorService.getCompetencyColorName(extendedExperience, extendedExperience.confidenceIndex);
            const backgroundLightColorString = ColorService.getLightColorName(backgroundColorString);
            const textColorString = "text" + backgroundColorString[0].toUpperCase() + backgroundColorString.substring(1);
            return (
                <Experience
                    value={extendedExperience}
                    key={extendedExperience.title}
                    color={backgroundColorString}
                    lightColor={backgroundLightColorString}
                    textColor={textColorString}
                />
            );
        });

        this.setState({experiences: exPeriences});
    }

    componentWillUnmount() {
        //this.free.removeListener('ExperienceChanged');

    }

    handleEvents = () => {
        this.forceUpdate();
    };


    render() {
<<<<<<< HEAD
=======
        const experiences = this.state.experiences
            // Sort descending by date
            .sort((extendedExperienceA, extendedExperienceB) => {
                return extendedExperienceA.from < extendedExperienceB.from;
            })

            // Generate components
            .map((extendedExperience) => {
                const backgroundColorString = ColorService.getCompetencyColorName(extendedExperience, extendedExperience.confidenceIndex);
                const backgroundLightColorString = ColorService.getLightColorName(backgroundColorString);
                const textColorString = "text" + backgroundColorString[0].toUpperCase() + backgroundColorString.substring(1);
                return (
                    <Experience
                        value={extendedExperience}
                        key={extendedExperience.title}
                        color={backgroundColorString}
                        lightColor={backgroundLightColorString}
                        textColor={textColorString}
                    />
                );
            });

>>>>>>> 876613d4346e5813fa2ecfe3dee13c93ca649ac6
        return (
            <Card className={this.props.classes.card}>
                <CardContent>
                    <NewExperience />
                    {this.state.experiences}
                </CardContent>
            </Card>
        );
    }
}

export default withStyles(styles)(Chronology);