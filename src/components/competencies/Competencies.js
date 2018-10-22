import React from 'react';
import Competency from '../competency/Competency';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Profile from '../profile/Profile';
import queryString from 'query-string'
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { hasAccess } from '../../actions/guard';
import { fetchFreelancer } from '../../actions/user';
import CustomizedSnackbars from '../snackbars/snackbars';
import Button from '@material-ui/core/Button';
import { moveToNewExp } from '../../actions/experience';
import Typography from "@material-ui/core/Typography";

const Loading = require('react-loading-animation');

const styles = {
    certificatButton: {
        margin: '20px 0px',
        backgroundColor: '#3b3838',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#3b3838'
        }
    },
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

const mapStateToProps = state => ({
    loadingGuard: state.guardReducer.loading,
    guardCheck: state.guardReducer.guardCheck,
    transactionError: state.transactionReducer.transactionError,
    transactionHash: state.transactionReducer.transactionHash,
    transactionReceipt: state.transactionReducer.transactionReceipt,
    object: state.transactionReducer.object
  });

class Competencies extends React.Component {

    componentDidMount() {
        if (this.props.user && !this.props.guardCheck) {
            this.props.dispatch(hasAccess(window.location.pathname.split('/')[1], queryString.extract(window.location.search), this.props.user, this.props.history));
        }
    }

    componentDidUpdate() {
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
        snackbar = (<CustomizedSnackbars message='Transaction successfull!' showSpinner={false} type='success' time='3000' />);
    }

    //pick the current user or a searched freelancer
    let freelancer = (queryString.extract(window.location.search)) ? this.props.user.searchedFreelancers : this.props.user.freelancerDatas;
    let showContact = (queryString.extract(window.location.search)) ? false : true;
    const oneCompetencyFocused = (this.props.match.params.competencyName);
    const competencies = freelancer.competencies
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
                        user={this.props.user}
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
                    <Profile freelancer={freelancer} showContact={showContact}/>
                </Grid>
                <Grid item xs={12}>
                    <div className={this.props.classes.competenciesContainer}>
                        {competencies}
                    </div>
                </Grid>
                {(!this.props.user.searchedFreelancers && freelancer.competencies.length === 0) &&
                        <Grid item xs={12}
                              container
                              direction="column"
                              justify="center"
                              alignItems="center">
                            <Typography variant="subheading">The skills section is automatically filled with your certified experiences.</Typography>
                            <Button onClick={() => this.props.dispatch(moveToNewExp(this.props.history))} className={this.props.classes.certificatButton}>
                                Add your first experience and request a certificate
                            </Button>
                        </Grid>
                }
                {snackbar}
            </Grid>
        );

    }
}

export default compose(withStyles(styles), connect(mapStateToProps))(Competencies);
