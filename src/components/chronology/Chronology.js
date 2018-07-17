import React from 'react';
import Experience from '../experience/Experience';
import FreelancerService from '../../services/FreelancerService';
import Card from '@material-ui/core/Card';
import ColorService from '../../services/ColorService';
import { withStyles, CardContent, Grid } from '@material-ui/core';
import NewExperience from '../experience/NewExperience';
import Profile from '../profile/Profile';
const Loading = require('react-loading-animation');

const styles = {
    card: {
        transition: 'all .6s ease',
        paddingBottom: '15px',
    },
}

class Chronology extends React.Component {

    constructor(props) {
        super(props);
        this.free = FreelancerService.getFreelancer();

        this.state = {
            experiences: this.free.experiences,
            waiting: this.free.isWaiting,
        };
    }

    componentWillMount() {
        if (this.props.location.state != null) {
            this.freelancerAddress = this.props.location.state.address;
        } else if (this.props.location.search !== null && this.props.location.search !== "") {
            var address = this.props.location.search
            this.freelancerAddress = address.substring(1, address.length);
        }

        //A client is searching a freelancer, so we display his Vault
        if (this.freelancerAddress !== null && typeof this.freelancerAddress !== 'undefined')
            this.free.initFreelancer(this.freelancerAddress);
    }

    componentDidMount() {
        this.free.addListener('ExperienceChanged', this.handleEvents, this);
    }

    componentWillUnmount() {
        this.free.removeListener('ExperienceChanged', this.handleEvents, this);
        this.isCancelled = true;
    }

    handleEvents = () => {
        this.free = FreelancerService.getFreelancer();
        !this.isCancelled && this.setState({
            experiences: this.free.experiences,
            waiting: this.free.isWaiting,
        });
        if (!this.isCancelled) this.forceUpdate();
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
            <Grid container spacing={24}>
                <Grid item xs={12}>
                    <Profile />
                </Grid>
                <Grid item xs={12}>
                    <Card className={this.props.classes.card}>
                        <CardContent>
                            {this.free.isFreelancer() ? <NewExperience /> : null}
                            {experiences}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(Chronology);