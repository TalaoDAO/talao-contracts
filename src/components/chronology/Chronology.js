import React from 'react';
import Experience from '../experience/Experience';
import Card from '@material-ui/core/Card';
import ColorService from '../../services/ColorService';
import { withStyles, CardContent, Grid } from '@material-ui/core';
import NewExperience from '../experience/NewExperience';
import Profile from '../profile/Profile';
//import queryString from 'query-string'
import { connect } from "react-redux";
import compose from 'recompose/compose';

const Loading = require('react-loading-animation');

const styles = {
    card: {
        transition: 'all .6s ease',
        paddingBottom: '15px',
    },
}

class Chronology extends React.Component {
    
    componentWillMount() {

        //get the address from the url
      //  this.urlAddress = queryString.extract(this.props.location.search);
        /*//Check if this is the current user
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
        }*/
    }

    render() {
        const { user } = this.props;
        let experiences = null;
        if (!this.props.user) {
            return (<Loading />);
        }
        else {
            experiences = user.freelancerDatas.experiences
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
                        user={user}
                        value={extendedExperience}
                        key={extendedExperience.title}
                        color={backgroundColorString}
                        lightColor={backgroundLightColorString}
                        textColor={textColorString}
                    />
                );
            });
        }
       const MyProfileComponent = (props) => {
            return (
            <Profile 
                user={user}
                {...props}
            />
            );
        }
        const MyNewExperienceComponent = (props) => {
            return (
            <NewExperience 
                user={user}
                {...props}
            />
            );
        }
        
        return (
            <Grid container spacing={24}>
                <Grid item xs={12}>
                    <MyProfileComponent />
                </Grid>
                <Grid item xs={12}>
                    <Card className={this.props.classes.card}>
                        <CardContent>
                            {user.freelancerDatas !== null ? <MyNewExperienceComponent /> : null}
                            {experiences}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = state => ({
    user: state.userReducer.user,
    loading: state.userReducer.loading,
    error: state.userReducer.error
  });

export default compose(withStyles(styles), connect(mapStateToProps))(Chronology);