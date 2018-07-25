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
import FreelancerService from '../../services/FreelancerService';
import defaultFreelancerPicture from '../../images/freelancer-picture.jpg';
import { Icon } from '@material-ui/core';
import queryString from 'query-string'

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

class UnlockFreelancer extends React.Component {

  constructor() {
    super();
    this.free = FreelancerService.getFreelancer();

    this.state = {
      freelancer: this.free,
      competencies: this.free.getCompetencies(),
      numTalaoForVault : null,
      description : ''
    }

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

  componentDidMount() {

    this.free.addListener('ExperienceChanged', this.handleEvents, this);

    //get the freelancer address from the url
    this.freelancerAddress = queryString.extract(this.props.location.search);

    //if the address is not a valid ethereum address, redirect to homepage
    if (!window.web3.utils.isAddress(this.freelancerAddress)) {
        this.props.history.push({pathname: '/homepage'});

    //Check if the user try to unlock himself
    } else if (this.freelancerAddress.toLowerCase() !== window.account.toLowerCase()) {

      this.vaultFactoryContract.methods.FreelanceVault(this.freelancerAddress).call().then(vaultAddress => {
        //The vault exist ??
        if (vaultAddress !== '0x0000000000000000000000000000000000000000') {
            // This client is a partner of the freelancer ??
            this.freelancerContract.methods.isPartner(this.freelancerAddress, window.account).call().then(isPartner => {
                // This client has already unlock the freelancer vault ??
                this.talaoContract.methods.hasVaultAccess(this.freelancerAddress, window.account).call().then(hasAccessToFreelanceVault => {
                    //The vault price of the freelancer is 0 talao token ??
                    this.talaoContract.methods.data(this.freelancerAddress).call().then(info => {
                      let price = window.web3.utils.fromWei(info.accessPrice);
                      let accessPriceIsZeroTalaoToken = (parseInt(price, 10) === 0 ) ? true : false;
                      if (hasAccessToFreelanceVault || isPartner || accessPriceIsZeroTalaoToken) {
                        this.props.history.push({pathname: '/homepage'});
                      } else {
                        this.setState({numTalaoForVault: price});
                        this.free.initFreelancer(this.freelancerAddress);
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
    } else {
      //If the freelancer try to access unlock himself, redirect on his page
      this.props.history.push({pathname: '/Chronology'});
    }
  }

  componentWillUnmount() {
      this.free.removeListener('ExperienceChanged', this.handleEvents, this);
      this.free.initFreelancer();
      this.isCancelled = true;
  }

  handleEvents = () => {
      !this.isCancelled && this.setState({
          competencies: this.free.getCompetencies()
      });
      if(!this.isCancelled) this.forceUpdate();
  };

  
  handleSubmit() {
    
    this.talaoContract.methods.getVaultAccess(this.freelancerAddress).send({from: window.account}).then(response => {
      this.props.history.push({
        pathname: '/chronology',
        search: this.freelancerAddress,
        state: { address: this.freelancerAddress }
      });
    }, function() {
      console.log('transaction failed');
    });
  }

  render() {
    const competencies = this.state.competencies
    const competencyTags = competencies.map((competency, index) =>
    (<CompetencyTag value={competency} key={index} />));

    return ( 
      <Card>
        <CardContent>
          <div className={this.props.classes.container}>
            <div className={this.props.classes.pictureContainer}>
              <div className={this.props.classes.confidenceIndexContainer}>
                <div className={this.props.classes.confidenceIndex}>{this.state.freelancer.confidenceIndex}</div>
              </div>
              <img src={defaultFreelancerPicture} className={this.props.classes.picture} alt="Freelancer" />
            </div>
            <div className={this.props.classes.profileContainer}>
              <Typography variant="headline" component="h1" gutterBottom className={this.props.classes.name}>
                {this.state.freelancer.firstName} {this.state.freelancer.lastName}
              </Typography>
              <Typography variant="subheading">
                {this.state.freelancer.title}
              </Typography>
              <Typography offset-md='10'>
                {this.state.freelancer.description}
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
                    {' ' + this.state.numTalaoForVault} Talao token{this.state.numTalaoForVault > 1 ? 's' : ''}.
                  </span>
                  You will then access to the description of his experiences and educations.You will be able to contact him.
                </Typography>
              </Grid>
              <Grid item xs={5} md={2} lg={2}>
                <Button onClick={() => this.handleSubmit()} variant="contained" color="primary" className={this.props.classes.unlockButton}>
                  <Icon style={{ fontSize: 20, margin: 5 }}>
                    no_encryption
                  </Icon>
                  Unlock
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </CardContent>
      </Card >
    );
  }
}

export default withStyles(styles)(UnlockFreelancer);