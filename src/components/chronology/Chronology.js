import React from 'react';
import Experience from '../experience/Experience';
import FreelancerService from '../../services/FreelancerService';
import Card from '@material-ui/core/Card';
import ColorService from '../../services/ColorService';
import { withStyles, CardContent, Grid } from '@material-ui/core';
import NewExperience from '../experience/NewExperience';
import Profile from '../profile/Profile';
import queryString from 'query-string'

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
            isWaiting: true
        };

        this.vaultFactoryContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_VAULTFACTORY_ABI),
            process.env.REACT_APP_VAULTFACTORY_ADDRESS
        );
        this.talaoContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_TALAOTOKEN_ABI),
            process.env.REACT_APP_TALAOTOKEN_ADDRESS
        );
        this.freelancerContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_FREELANCER_ABI),
            process.env.REACT_APP_FREELANCER_ADDRESS
        );
    }

    componentWillMount() {
        console.log('avant...');
        //get the freelancer address from the url
        this.freelancerAddress = queryString.extract(this.props.location.search);

        //Check if this is the current user
        if((!this.freelancerAddress && this.free.isVaultCreated) || (this.freelancerAddress.toLowerCase() === window.account.toLowerCase() && this.free.isVaultCreated)) {
            this.free.initFreelancer(window.account);

        //we are looking for a freelancer 
        } else if (this.freelancerAddress.toLowerCase() !== window.account.toLowerCase() && window.web3.utils.isAddress(this.freelancerAddress)) {
            console.log('ok1');
            this.vaultFactoryContract.methods.FreelanceVault(this.freelancerAddress).call().then(vaultAddress => {
                //The vault exist ??
                if (vaultAddress !== '0x0000000000000000000000000000000000000000') {
                    // This client is a partner of the freelancer ??
                    this.freelancerContract.methods.isPartner(this.freelancerAddress, window.account).call().then(isPartner => {
                        // This client has already unlock the freelancer vault ??
                        this.talaoContract.methods.hasVaultAccess(this.freelancerAddress, window.account).call().then(hasAccessToFreelanceVault => {
                            //The vault price of the freelancer is 0 talao token ??
                            this.talaoContract.methods.data(this.freelancerAddress).call().then(info => {
                                let accessPriceIsZeroTalaoToken = (parseInt(window.web3.utils.fromWei(info.accessPrice), 10) === 0 ) ? true : false;
                                if (hasAccessToFreelanceVault || isPartner || accessPriceIsZeroTalaoToken) {
                                    console.log('ok');
                                    this.free.initFreelancer(this.freelancerAddress);
                                } else {
                                    this.props.history.push({
                                        pathname: '/unlockfreelancer',
                                        search: this.freelancerAddress,
                                        state: { address: this.freelancerAddress }
                                    });
                                }
                            })
                        }); 
                    });
                }
                //No vault exist for this address
                else {
                    console.log('ok');
                    this.props.history.push({pathname: '/homepage'});
                }
            });
        //Error
        } else {
            console.log('ok2');
            this.props.history.push({pathname: '/homepage'});
        }
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
            isWaiting: false,
        });
        if (!this.isCancelled) this.forceUpdate();
    };

    render() {
        if (this.state.experiences == null) return (<NewExperience />);
        if (this.state.isWaiting) return (<Loading />);
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