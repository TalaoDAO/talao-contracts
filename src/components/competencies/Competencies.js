import React from 'react';
import Competency from '../competency/Competency';
import { withStyles } from '@material-ui/core/styles';
import FreelancerService from '../../services/FreelancerService';
import { Grid } from '@material-ui/core';
import Profile from '../profile/Profile';
import queryString from 'query-string'

const styles = {
    competenciesContainer: {
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    competencyContainer: {
        flexBasis: 'auto',
        width: '350px',
        marginRight: '20px',
        marginBottom: '20px',
    },
    '@media screen and (max-width: 950px)': {
        competencyContainer: {
            flexBasis: '100%',
            marginRight: '0',
        },
    },
    competencyContainerFocused: {
        animationName: 'focusCompetency',
        animationDuration: '.2s',
        animationDelay: '.1s',
        animationFillMode: 'forwards',
    },
    competencyContainerHidden: {
        animationName: 'hideCompetency',
        animationDuration: '.2s',
        animationFillMode: 'forwards',
    },
    '@keyframes hideCompetency': {
        '0%': {
            opacity: 1,
            height: '340px',
            width: '350px',
        },
        '50%': {
            opacity: 0,
            width: '350px',
            height: '340px',
            marginRight: '20px',
            marginBottom: '20px',
        },
        '75%': {
            opacity: 0,
            width: '0',
            height: '0',
            marginRight: '0',
            marginBottom: '0',
        },
        '100%': {
            opacity: 0,
            width: '0',
            height: '0',
            marginRight: '0',
            marginBottom: '0',
        },
    },
    '@keyframes focusCompetency': {
        '0%': {
            width: '350px',
            marginRight: '20px',
            marginBottom: '20px',
        },
        '100%': {
            width: '100%',
            marginRight: '0',
            marginBottom: '0',
        },
    },
};

class Competencies extends React.Component {

    constructor(props) {
        super(props);
        this.free = FreelancerService.getFreelancer();

        this.state = {
            competencies: this.free.getCompetencies(),
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
        //get the freelancer address from the url
        this.freelancerAddress = queryString.extract(this.props.location.search);

        //Check if this is the current user
        if((!this.freelancerAddress && this.free.isVaultCreated) || (this.freelancerAddress.toLowerCase() === window.account.toLowerCase() && this.free.isVaultCreated)) {
            this.free.initFreelancer(window.account);

        //we are looking for a freelancer 
        } else if (this.freelancerAddress.toLowerCase() !== window.account.toLowerCase() && window.web3.utils.isAddress(this.freelancerAddress)) {

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
                    this.props.history.push({pathname: '/homepage'});
                }
            });
        //Error
        } else {
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
        !this.isCancelled && this.setState({
            competencies: this.free.getCompetencies()
        });
        if (!this.isCancelled) this.forceUpdate();
    };

    render() {
        const oneCompetencyFocused = (this.props.match.params.competencyName);
        const competencies = this.state.competencies

            // Compute confidence index of each competency
            .map((competency) => ({
                competency: competency,
                confidenceIndex: competency.getConfidenceIndex(),
            }))

            // Sort descending by confidence index and let the education at the end
            .sort((extendedCompetencyA, extendedCompetencyB) => {
                if (extendedCompetencyA.competency.name === "Education") return true;
                if (extendedCompetencyB.competency.name === "Education") return false;
                return extendedCompetencyA.confidenceIndex < extendedCompetencyB.confidenceIndex;
            })

            // Generate components
            .map((extendedCompetency, index) => {
                const thisCompetencyFocused = extendedCompetency.competency.name === this.props.match.params.competencyName;
                let appliedClasses = [this.props.classes.competencyContainer];
                let layout = 'normal';
                if (thisCompetencyFocused) {
                    layout = 'focused';
                    appliedClasses.push(this.props.classes.competencyContainerFocused);
                }
                else if (oneCompetencyFocused) {
                    layout = 'hidden';
                    appliedClasses.push(this.props.classes.competencyContainerHidden);
                }
                return (
                    <div key={index} className={appliedClasses.join(' ')}>
                        <Competency
                            competency={extendedCompetency.competency}
                            confidenceIndex={extendedCompetency.confidenceIndex}
                            layout={layout}>
                        </Competency>
                    </div>
                );
            });
        return (
            <Grid container spacing={24}>
                <Grid item xs={12}>
                    <Profile />
                </Grid>
                <Grid item xs={12}>
                    <div className={this.props.classes.competenciesContainer}>
                        {competencies}
                    </div>
                </Grid>
            </Grid>
        );

    }
}

export default withStyles(styles)(Competencies);