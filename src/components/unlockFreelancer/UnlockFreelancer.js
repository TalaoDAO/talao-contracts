import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { constants } from '../../constants';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from "@material-ui/core/CardContent";
import CompetencyTag from '../competencyTag/CompetencyTag';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from "@material-ui/core/Typography";
import defaultFreelancerPicture from '../../images/freelancer-picture.jpg';
import { Icon } from '@material-ui/core';
import queryString from 'query-string'
import { hasAccess } from '../../actions/guard';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { fetchFreelancer } from '../../actions/user';
import { unlockFreelancerClicked } from '../../actions/unlockFreelancer';
import CustomizedSnackbars from '../snackbars/snackbars';

const Loading = require('react-loading-animation');
const styles = theme => ({
  container: {
    display: 'flex',
  },
  pictureContainer: {
    flexShrink: 0,
    width: '140px',
  },
  confidenceIndexContainer: {
    position: 'relative',
    width: 0,
    height: 0,
  },
  confidenceIndex: {
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    width: '40px',
    height: '40px',
    lineHeight: '40px',
    display: 'inline-block',
    textAlign: 'center',
    position: 'relative',
    left: '75px',
    top: '0px',
    color: '#fff',
  },
  unlockButton: {
    margin: '20px',
    backgroundColor: '#3b3838',
    color: '#ffffff',
    '&:hover': {
        backgroundColor: '#3b3838'
    }
  },
  dividerMargins: {
    margin: '20px'
  },
  picture: {
    borderRadius: '50%',
    width: '100px',
    height: '100px',
  },
  profileContainer: {
    flexGrow: 1,
  },
  name: {
    textTransform: 'uppercase',
    fontSize: constants.fontSize.extraLarge,
  },
  detailsContainer: {
    marginLeft: '130px',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
  }
});

const mapStateToProps = state => ({
  loadingGuard: state.guardReducer.loading,
  guardCheck: state.guardReducer.guardCheck,
  transactionError: state.transactionReducer.transactionError,
  transactionReceipt: state.transactionReducer.transactionReceipt,
  object: state.transactionReducer.object,
  transactionHash: state.transactionReducer.transactionHash
});

class UnlockFreelancer extends React.Component {

  componentDidMount() {
    //The user is initialize and the guard is not check
    if (this.props.user && !this.props.guardCheck) {
      this.props.dispatch(hasAccess(window.location.pathname.split('/')[1], queryString.extract(this.props.location.search), this.props.user, this.props.history));
    }
  }

  componentDidUpdate() {
    //The guard check is over, so the request is valid, so we init the searched freelancer
    if (queryString.extract(window.location.search) && this.props.guardCheck && !this.props.user.searchedFreelancers) {
        this.props.dispatch(fetchFreelancer(this.props.user, queryString.extract(window.location.search)));
    }
  }

  render() {
    const { loadingGuard, transactionError, object, transactionReceipt, transactionHash } = this.props;

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
        snackbar = (<CustomizedSnackbars message={object + ' Transaction in progress...'} showSpinner={true} type='info'/>);
    } else if (transactionError) {
        snackbar = (<CustomizedSnackbars message={transactionError.message} showSpinner={false} type='error'/>);
    } else if (transactionReceipt) {
        snackbar = (<CustomizedSnackbars message='Transaction sucessfull !' showSpinner={false} type='success'/>);
    }

    let freelancer = this.props.user.searchedFreelancers;
    const competencies = freelancer.competencies
    const competencyTags = competencies.map((competency, index) =>
    (<CompetencyTag value={competency} key={index} />));

    return ( 
      <Card>
        <CardContent>
          <div className={this.props.classes.container}>
            <div className={this.props.classes.pictureContainer}>
              <div className={this.props.classes.confidenceIndexContainer}>
                <div className={this.props.classes.confidenceIndex}>{Math.round(freelancer.confidenceIndex * 10) / 10}</div>
              </div>
              <img src={(freelancer.pictureUrl) ? this.props.freelancer.pictureUrl : defaultFreelancerPicture} className={this.props.classes.picture} alt="Freelancer" />
            </div>
            <div className={this.props.classes.profileContainer}>
              <Typography variant="headline" component="h1" gutterBottom className={this.props.classes.name}>
                {freelancer.firstName} {freelancer.lastName}
              </Typography>
              <Typography variant="subheading">
                {freelancer.title}
              </Typography>
              <Typography offset-md='10'>
                {freelancer.description}
              </Typography>
            </div>
          </div>
          <CardContent >
            <div>{competencyTags}</div>
            <Divider className={this.props.classes.dividerMargins}></Divider>
            <Grid container>
              <Grid item xs={7} md={10} lg={10}>
                <Typography>
                  The freelancer allows you to unlock his vault for
                  <span style={{fontWeight: 'bold'}}>
                    {' ' + freelancer.accessPrice} Talao token{freelancer.accessPrice > 1 ? 's. ' : '. '}
                  </span>
                  You will then access to the description of his experiences and educations.You will be able to contact him.
                </Typography>
              </Grid>
              <Grid item xs={5} md={2} lg={2}>
                <Button onClick={() => this.props.dispatch(unlockFreelancerClicked(this.props.user, this.props.history))} variant="contained" color="primary" className={this.props.classes.unlockButton}>
                  <Icon style={{ fontSize: 20, margin: 5 }}>
                    no_encryption
                  </Icon>
                  Unlock
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </CardContent>
        {snackbar}
      </Card >
    );
  }
}

export default compose(withStyles(styles), connect(mapStateToProps))(UnlockFreelancer);