import React from 'react';
import Experience from '../experience/Experience';
import FreelancerService from '../../services/FreelancerService';
import Card from '@material-ui/core/Card';
import ColorService from '../../services/ColorService';
import { withStyles, CardContent } from '@material-ui/core';
import NewExperience from '../experience/NewExperience';

const styles = {
    card: {
        transition: 'all .4s ease',
        paddingBottom: '15px',
    },
}

class Chronology extends React.Component {

    constructor() {
        super();
        this.state = {
            experiences: FreelancerService.getFreelancer().experiences,
        };
    }

    render() {
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
        return (
            <Card className={this.props.classes.card}>
                <CardContent>
                    <NewExperience />
                    {experiences}
                </CardContent>
            </Card>
        );
    }
}

export default withStyles(styles)(Chronology);