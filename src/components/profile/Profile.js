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
import classnames from 'classnames';
import defaultFreelancerPicture from '../../images/freelancer-picture.jpg';
import Media from "react-media";
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { expandProfil } from '../../actions/experience';

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
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    wordBreak: 'break-word',
  },
});

const mapStateToProps = state => ({
  expanded: state.experienceReducer.expandProfil
});

class Profile extends React.Component {

  render() {
    const { expanded } = this.props;
    if (!this.props.freelancer) {
      //Prevent to have multiple loader
      return (<div />)
    }

    return (
      <Card>
        <CardContent>
          <div className={this.props.classes.container}>
            <div className={this.props.classes.pictureContainer}>
              <div className={this.props.classes.confidenceIndexContainer}>
                <div className={this.props.classes.confidenceIndex}>{Math.round(this.props.freelancer.confidenceIndex * 10) / 10}</div>
              </div>
              <img src={defaultFreelancerPicture} className={this.props.classes.picture} alt="Freelancer" />
            </div>
            <div className={this.props.classes.profileContainer}>
              <Typography variant="headline" component="h1" gutterBottom className={this.props.classes.name}>
                {this.props.freelancer.firstName} {this.props.freelancer.lastName}
              </Typography>
              <Typography variant="subheading" component="h2" className={this.props.classes.title}>
                {this.props.freelancer.title}
              </Typography>
              <Typography>
                {this.props.freelancer.description}
              </Typography>
            </div>
            <div className={this.props.classes.actionsContainer}>
              <CardActions className={this.props.classes.actions} disableActionSpacing>
                <IconButton
                  className={classnames(this.props.classes.expand, { [this.props.classes.expandOpen]: expanded })}
                  onClick={() => this.props.dispatch(expandProfil(!expanded))}
                  aria-expanded={expanded}
                  aria-label="Show more">
                  <ExpandMoreIcon />
                </IconButton>
              </CardActions >
            </div>
          </div>
        </CardContent>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Media query="(max-width: 959px)">
            {matches => {
              const marginLeftIfMobile = matches ? '0px' : '130px';
              return (
                <CardContent>
                  <Typography style={{ marginLeft: marginLeftIfMobile }} className={this.props.classes.detailsContainer}>
                    <MailIcon />&nbsp;{this.props.freelancer.email}<br />
                  </Typography>
                  <Typography style={{ marginLeft: marginLeftIfMobile }} className={this.props.classes.detailsContainer}>
                    <PhoneIcon />&nbsp;{this.props.freelancer.phone}<br />
                  </Typography>
                  <Typography style={{ marginLeft: marginLeftIfMobile }} className={this.props.classes.detailsContainer}>
                    <BlurOnIcon />&nbsp;{this.props.freelancer.ethereumAddress}
                  </Typography>
                </CardContent>
              )
            }
            }
          </Media>
        </Collapse>
      </Card >
    );
  }
}

export default compose(withStyles(styles), connect(mapStateToProps))(Profile);