import React from 'react';
import Card from '@material-ui/core/Card';
import { withStyles, CardContent } from '@material-ui/core';
import { TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { Link } from 'react-router-dom';
import CustomizedSnackbars from '../snackbars/snackbars';
import TimedSnackbar from '../snackbars/TimedSnackbar';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { createVaultClicked, setFreelancerAddress, searchFreelancerClicked, viewDatasClicked } from '../../actions/public/homepage';
import { isMobile } from 'react-device-detect';
import { removeResearch } from '../../actions/public/user';

const Loading = require('react-loading-animation');

const styles = theme => ({
  certificatButton: {
    margin: '20px',
    backgroundColor: '#3b3838',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#3b3838'
    }
  },
  certificatButtonDisabled: {
    margin: '20px',
    color: 'rgba(0, 0, 0, 0.26)',
    backgroundColor: '#f2f2f2',
    cursor: 'default',
    pointerEvents: 'none',
    border: '1px solid rgba(0, 0, 0, 0.23)'
  },
  content: {
    display: 'inline-block',
    verticalAlign: 'top',
    marginTop: '0px',
    marginLeft: '30px',
    marginBottom: '20px',
    padding: '20px 0px 20px 25px',
    borderLeft: '1px solid ' + theme.palette.grey[300]
  },
  card: {
    flexBasis: 'auto',
    height: '450px',
    marginRight: '20px',
    marginBottom: '20px',
  },
  container: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  textField: {
    margin: '10px 20px',
    width: '-webkit-fill-available',
  },
  title: {
    color: theme.palette.text.primary,
    lineHeight: '50px',
    fontSize: '30px',
    display: 'inline-block',
  },
  titleSecondary: {
    color: theme.palette.text.primary,
    textAlign: 'left',
    lineHeight: '30px',
    fontSize: (isMobile) ? '15px' : '20px',
    display: 'inline-block',
  },
  center: {
    textAlign: 'center',
  }
});

const mapStateToProps = state => ({
  message: state.guardReducer.message,
  freelancerAddress: state.homepageReducer.freelancerAddress,
  freelancerAddressError: state.homepageReducer.freelancerAddressError,
  freelancerAddressEmpty: state.homepageReducer.freelancerAddressEmpty,
  invalidAddress: state.homepageReducer.invalidAddress,
  emptyAddress: state.homepageReducer.emptyAddress,
  transactionError: state.transactionReducer.transactionError,
  transactionReceipt: state.transactionReducer.transactionReceipt,
  object: state.transactionReducer.object,
  transactionHash: state.transactionReducer.transactionHash,
  loading: state.guardReducer.loading
});

class Homepage extends React.Component {

  render() {
    const {
      message,
      freelancerAddress,
      freelancerAddressError,
      freelancerAddressEmpty,
      invalidAddress,
      emptyAddress,
      transactionError,
      transactionHash,
      transactionReceipt,
      object,
      loading
    } = this.props;

      //Loading.
      if (loading) {
        return (<Loading />);
      }
      //snackbar if guard has an error
      let snackbar;
      if (message) {
        snackbar = (<CustomizedSnackbars message={message} time={5000} type='error'/>);
      }
      if (transactionHash && !transactionReceipt) {
        snackbar = (<CustomizedSnackbars message={object} showSpinner={true} type='info'/>);
      } else if (transactionError) {
        snackbar = (<CustomizedSnackbars message={transactionError.message} showSpinner={false} type='error'/>);
      } else if (transactionReceipt) {
        snackbar = (<TimedSnackbar transaction message='Transaction successfull!' type='success' autoHideDuration={5000} />);
      }

      //If the user doesn't have a wallet he can't create a vault
      let showCreateYourVaultBlock;
      if (this.props.user.ethAddress) {
        showCreateYourVaultBlock =
        (<Grid item xs={12} lg={6}>
          <Card className={this.props.classes.card}>
            <CardContent>
              <div className={this.props.classes.center}>
                {(!this.props.user.freelancerDatas) ?
                  <p className={this.props.classes.title}>Are you a Talent ? Create you Certified Resume right now !<br /><br /><span className={this.props.classes.titleSecondary}>Talao provide you with the ultimate Blockchain protocol for experience, skills and diploma certifications</span></p> :
                  <p className={this.props.classes.title}>You are connected to your account !</p>
                }
              </div>
              <div className={this.props.classes.center}>
                <Button onClick={() => { if (this.props.user.freelancerDatas) {
                  let usr = this.props.user;
                  usr.searchedFreelancers = null;
                  this.props.dispatch(removeResearch(usr));
                  this.props.dispatch(viewDatasClicked(this.props.history)) } else {
                    this.props.dispatch(createVaultClicked(this.props.history))}
                  }
                } className={this.props.classes.certificatButton} label="login">
                <Link style={{ textDecoration: 'none', color: '#fff' }} to={(!this.props.user.freelancerDatas) ? "/register" : "/chronology"}>{(!this.props.user.freelancerDatas) ? 'Create Account' : 'View my data'}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Grid>)
    }

    //If the user doesn't have a wallet we propose him to install it
    let createYourWallet;
    if (!this.props.user.ethAddress) {
      createYourWallet =
      (<Grid item xs={12} lg={6}>
        <Card className={this.props.classes.card}>
          <CardContent>
            <div className={this.props.classes.center}>
              {(!this.props.user.freelancerDatas) ?
                <p className={this.props.classes.title}>Are you a Talent ?<br /><br /><span className={this.props.classes.titleSecondary}>Welcome to the Talao Blockchain protocol for experience, skills and diploma certifications !<br />Please connect with your Ethereum wallet to create a certified Resume</span></p> :
                <p className={this.props.classes.title}>You are connected to your account !</p>
              }
            </div>
            <div className={this.props.classes.center}>
              <Button className={this.props.classes.certificatButton} onClick={() => console.log('click')} label="login">
                I do not have an Ethereum wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </Grid>)
    }

    return (
      <Grid container className={this.props.classes.container}>
        <Grid item xs={12} lg={6}>
          <Card className={this.props.classes.card}>
            <CardContent>
              <div className={this.props.classes.center}>
                <p className={this.props.classes.title}>Looking for a certified resume ?<br />Type the talent Ethereum address here</p>
              </div>
              <TextField
                value={freelancerAddress}
                error={freelancerAddressError || freelancerAddressEmpty}
                helperText={(!freelancerAddressError && !freelancerAddressEmpty) ? '' : (freelancerAddressEmpty) ? emptyAddress : invalidAddress}
                onChange={(event) => this.props.dispatch(setFreelancerAddress(event.target.value))}
                className={this.props.classes.textField}
                inputProps={{
                  style: { textAlign: "center" }
                }}
              />
              <div className={this.props.classes.center}>
                <Button onClick={() => this.props.dispatch(searchFreelancerClicked(this.props.history, freelancerAddress))} className={(!freelancerAddressError && !freelancerAddressEmpty) ? this.props.classes.certificatButton : this.props.classes.certificatButtonDisabled} label="login">
                  Find my freelancer
                </Button>
              </div>
            </CardContent>
          </Card>
        </Grid>
        {showCreateYourVaultBlock}
        {createYourWallet}
        {snackbar}
      </Grid>
    );
  }
}

export default compose(withStyles(styles), connect(mapStateToProps))(Homepage);
