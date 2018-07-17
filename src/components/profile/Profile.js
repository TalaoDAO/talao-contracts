import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { constants } from '../../constants';
import Card from '@material-ui/core/Card';
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import MailIcon from '@material-ui/icons/Mail';
import PhoneIcon from '@material-ui/icons/Phone';
import BlurOnIcon from '@material-ui/icons/BlurOn';
import FreelancerService from '../../services/FreelancerService';
import classnames from 'classnames';
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
  picture: {
    borderRadius: '50%',
    width: '100px',
    height: '100px',
  },
  profileContainer: {
    flexGrow: 1,
  },
  actionsContainer: {
    width: '70px',
    alignSelf: 'center',
  },
  name: {
    textTransform: 'uppercase',
    fontSize: constants.fontSize.extraLarge,
  },
  title: {
    fontSize: constants.fontSize.large,
  },
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    marginLeft: 'auto',
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  detailsContainer: {
    marginLeft: '130px',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
  },
});

class Profile extends React.Component {

  constructor() {
    super();
    this.free = FreelancerService.getFreelancer();
    this.state = {
      freelancer: this.free,
      expanded: false
    }
  }

  componentDidMount() {
    this.free.addListener('FreeDataChanged', this.handleEvents, this);
  }

  componentWillUnmount() {
    this.free.removeListener('FreeDataChanged', this.handleEvents, this);
  }

  handleEvents = () => {
    this.setState({ freelancer: this.free });
    this.forceUpdate();
  };

  handleExpandClick = () => this.setState({ expanded: !this.state.expanded });

  render() {
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
              <Typography variant="subheading" component="h2" className={this.props.classes.title}>
                {this.state.freelancer.title}
              </Typography>
              <Typography>
                {this.state.freelancer.description}
              </Typography>
            </div>
            <div className={this.props.classes.actionsContainer}>
              <CardActions className={this.props.classes.actions} disableActionSpacing>
                <IconButton
                  className={classnames(this.props.classes.expand, { [this.props.classes.expandOpen]: this.state.expanded })}
                  onClick={this.handleExpandClick}
                  aria-expanded={this.state.expanded}
                  aria-label="Show more">
                  <ExpandMoreIcon />
                </IconButton>
              </CardActions >
            </div>
          </div>
        </CardContent>
        <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography className={this.props.classes.detailsContainer}>
              <MailIcon />&nbsp;{this.state.freelancer.email}<br />
            </Typography>
            <Typography className={this.props.classes.detailsContainer}>
              <PhoneIcon />&nbsp;{this.state.freelancer.phone}<br />
            </Typography>
            <Typography className={this.props.classes.detailsContainer}>
              <BlurOnIcon />&nbsp;{this.state.freelancer.ethereumAddress}
            </Typography>
          </CardContent>
        </Collapse>
      </Card >
    );
  }
}

export default withStyles(styles)(Profile);