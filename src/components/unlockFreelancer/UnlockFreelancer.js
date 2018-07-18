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

    this.talaoContract = new window.web3.eth.Contract(
      JSON.parse(process.env.REACT_APP_TALAOTOKEN_ABI),
      process.env.REACT_APP_TALAOTOKEN_ADDRESS
    );

  }

  componentDidMount() {
    this.free.addListener('ExperienceChanged', this.handleEvents, this);
    if (this.props.location.state != null) {
      this.freelancerAddress = this.props.location.state.address;
    } else if (this.props.location.search !== null && this.props.location.search !== "") {
        var address = this.props.location.search
        this.freelancerAddress = address.substring(1, address.length);
    }

    //A client is searching a freelancer, so we display his Vault
    if (this.freelancerAddress !== null && typeof this.freelancerAddress !== 'undefined') {
        this.free.initFreelancer(this.freelancerAddress);
    } else {
      //If someone access to the url directly without the freelance address, redirect on homepage
      this.props.history.push({
        pathname: '/homepage',
        search: this.state.freelancerAddress,
        state: { address: this.state.freelancerAddress }
      });
    }

    this.talaoContract.methods.data(this.freelancerAddress).call().then(info => {
      let price = window.web3.utils.fromWei(info.accessPrice);
      this.setState({numTalaoForVault: price});
      this.setState({description: "The freelancer allows you to unlock his vault for " + price + " Talao tokens.You will then access to the description of his experiences and educations.You will be able to contact him."});
    })
  }

  componentWillUnmount() {
      this.free.removeListener('ExperienceChanged', this.handleEvents, this);
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
        search: this.state.freelancerAddress,
        state: { address: this.state.freelancerAddress }
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
                    {this.state.description}
                </Typography>
              </Grid>
              <Grid item xs={5} md={2} lg={2}>
                <Button onClick={() => this.handleSubmit()} variant="contained" color="primary" className={this.props.classes.unlockButton}>
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