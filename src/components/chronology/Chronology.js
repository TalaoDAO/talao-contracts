import React from 'react';
import Experience from '../experience/Experience';
import Card from '@material-ui/core/Card';
import ColorService from '../../services/ColorService';
import { withStyles, CardContent, Grid } from '@material-ui/core';
import NewExperience from '../experience/NewExperience';
import Profile from '../profile/Profile';
import queryString from 'query-string';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { hasAccess } from '../../actions/guard';
import CustomizedSnackbars from '../snackbars/snackbars';
import { fetchFreelancer } from '../../actions/user';

const Loading = require('react-loading-animation');

const styles = {
    card: {
        transition: 'all .6s ease',
        paddingBottom: '15px',
    },
}

const mapStateToProps = state => ({
    loadingGuard: state.guardReducer.loading,   
    guardCheck: state.guardReducer.guardCheck,
    transactionError: state.transactionReducer.transactionError,
    transactionHash: state.transactionReducer.transactionHash, 
    transactionReceipt: state.transactionReducer.transactionReceipt,
    object: state.transactionReducer.object
  });
  
class Chronology extends React.Component {
    
    componentDidMount() {
        //The user is initialize and the guard is not check
        if (this.props.user && !this.props.guardCheck) {
            this.props.dispatch(hasAccess(window.location.pathname.split('/')[1], queryString.extract(window.location.search), this.props.user, this.props.history));
        }
    }

    componentDidUpdate() {
        //The guard check is over, so the request is valid, so we init the searched freelancer
        if (queryString.extract(window.location.search) && this.props.guardCheck && !this.props.user.searchedFreelancers && queryString.extract(window.location.search).toLowerCase() !== this.props.user.ethAddress) {
            this.props.dispatch(fetchFreelancer(this.props.user, queryString.extract(window.location.search)));
        }
    }

    render() {
        const { loadingGuard, transactionError, transactionHash, transactionReceipt, object } = this.props;

        if (!this.props.user || loadingGuard) {
            return (<Loading />);
        }
        else {
            if ((!this.props.user.freelancerDatas && !queryString.extract(window.location.search)) || (!this.props.user.searchedFreelancers && queryString.extract(window.location.search))) {
                return (<Loading />)
            }
        }

        let snackbar;
        if (transactionHash && !transactionReceipt) {
            snackbar = (<CustomizedSnackbars message={object} showSpinner={true} type='info'/>);
        } else if (transactionError) {
            snackbar = (<CustomizedSnackbars message={transactionError.message} showSpinner={false} type='error'/>);
        } else if (transactionReceipt) {
            snackbar = (<CustomizedSnackbars message='Transaction sucessfull !' showSpinner={false} type='success'/>);
        }

        //pick the current user or a searched freelancer
        let freelancer = (queryString.extract(window.location.search)) ? this.props.user.searchedFreelancers : this.props.user.freelancerDatas;
        let experiences = freelancer.experiences
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
                    user={freelancer}
                    isClient={(queryString.extract(window.location.search)) ? true : false}
                    value={extendedExperience}
                    key={extendedExperience.title}
                    color={backgroundColorString}
                    lightColor={backgroundLightColorString}
                    textColor={textColorString}
                />
            );
        });

        const MyNewExperienceComponent = (props) => {
            return (
            <NewExperience 
                user={this.props.user}
                {...props}
            />
            );
        }
        
        return (
            <Grid container spacing={24}>
                <Grid item xs={12}>
                    <Profile freelancer={freelancer}/>
                </Grid>
                {!queryString.extract(window.location.search) &&
                    <Grid item xs={12}>
                        <Card className={this.props.classes.card}>
                            <CardContent>
                                <MyNewExperienceComponent />
                                {experiences.length > 0 && experiences}
                            </CardContent>
                        </Card>
                    </Grid>
                }
                {(queryString.extract(window.location.search) && experiences.length > 0) &&
                    <Grid item xs={12}>
                        <Card className={this.props.classes.card}>
                            <CardContent>
                                {experiences}
                            </CardContent>
                        </Card>
                    </Grid>
                }
                {snackbar}
            </Grid>
        );
    }
}

export default compose(withStyles(styles), connect(mapStateToProps))(Chronology);