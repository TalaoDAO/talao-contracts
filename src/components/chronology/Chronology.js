import React from 'react';
import Experience from '../experience/Experience';
import FreelancerService from '../../services/FreelancerService';
import Card from '@material-ui/core/Card';
import ColorService from '../../services/ColorService';
import { withStyles, CardContent } from '@material-ui/core';
import NewExperience from '../experience/NewExperience';
const Loading = require('react-loading-animation');


const styles = {
    card: {
        transition: 'all .6s ease',
        paddingBottom: '15px',
    },
}

class Chronology extends React.Component {

    constructor() {
        super();
        this.free = FreelancerService.getFreelancer();
        this.state = {
            experiences: this.free.experiences,
            waiting: this.free.isWaiting,
        };
    }

    componentDidMount() {
        this.free.addListener('ExperienceChanged', this.handleEvents, this);
        this.free.addListener('FreeDataChanged', this.handleEvents, this);
    }

    componentWillUnmount() {
        this.isCancelled = true;
    }

    handleEvents = () => {
        !this.isCancelled && this.setState({
            experiences: this.free.experiences,
            waiting: this.free.isWaiting,
        });
        this.forceUpdate();
    };

    render() {
        if (this.state.experiences == null) return (<NewExperience />);
        if (this.state.waiting) return (<Loading />);
        const experiences = this.state.experiences//this.state.experiences
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