import React , { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { isMobile } from 'react-device-detect';
import { Blockcerts } from 'react-blockcerts';
import addDays from 'date-fns/add_days';
import distanceInWords from 'date-fns/distance_in_words';
import classNames from 'classnames';

import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import { withStyles } from '@material-ui/core/styles';
import { Button, Typography } from '@material-ui/core';
import { AvTimer, Close, CloudUpload, Fingerprint, LineStyle } from '@material-ui/icons';

import { constants } from '../../constants';
import talaoCertificateImage from '../../images/talaoCertificateImage';

import {
  removeExpFromBackend,
  askForCertificate,
  addCertificateToPostedExperienceOnBlockchain,
  addCertificateToExperienceDraftAndPostOnBlockchain,
  postExperience,
  removeBlockchainExp
} from '../../actions/freelance/experience';

import DateService from '../../services/DateService';

import CompetencyTag from '../competencyTag/CompetencyTag';

const Loading = require('react-loading-animation');

const styles = theme => ({
  experienceContainer: {
    marginBottom: '30px',
  },
  timeLine: {
    display: 'inline-block',
  },
  indicator: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    lineHeight: '20px',
    textAlign: 'center',
    padding: '20px',
    borderRadius: '50%',
  },
  line: {
    display: 'inline-block',
    borderTop: '6px solid ' + theme.palette.grey[300],
    borderRight: '6px solid transparent',
    width: '150px',
    paddingBottom: '3px',
  },
  timeContainer: {
    display: 'inline-block',
    paddingLeft: '5px',
    fontSize: '15px',
    color: theme.palette.grey[500],
    verticalAlign: 'top',
  },
  dateContainer: {
    color: theme.palette.grey[500],
    marginLeft: '80px',
    marginTop: '-10px',
    fontSize: '14px',
    fontWeight: '100',
  },
  content: {
    display: 'inline-block',
    verticalAlign: 'top',
    marginTop: '15px',
    marginLeft: '30px',
    paddingLeft: '50px',
    borderLeft: '1px solid ' + theme.palette.grey[300],
    width: '80%',
  },
  description: {
    marginTop: '15px',
  },
  experienceButtons: {
    marginTop: theme.spacing.unit * 2,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  experienceButton: {
    marginRight: theme.spacing.unit * 2,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  experienceBlackButton: {
    color: theme.palette.white.main,
    backgroundColor: theme.palette.black.main,
    '&:hover': {
      backgroundColor: theme.palette.black.main,
    },
  },
  experienceRedButton: {
    color: theme.palette.white.main,
    backgroundColor: theme.palette.red.main,
    '&:hover': {
      backgroundColor: theme.palette.red.main,
    },
  },
  viewCertificate: {
    marginTop: theme.spacing.unit * 2,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  blockcerts: {
    marginTop: theme.spacing.unit * 2,
  },
  popup: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    width: '70vw',
    padding: '30px',
    textAlign: 'center',
    background: '#fff',
    borderRadius: '10px',
    boxShadow: '0 20px 75px rgba(0, 0, 0, 0.13)',
    color: '#666',
  },
  iconMargin: {
    marginLeft: '5px'
  }
});

const mapStateToProps = state => ({
  user: state.userReducer.user
});

class Experience extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showCert: false
    };
    this.showCertification = this.showCertification.bind(this);
  }

  showCertification() {
    const { showCert } = this.state;
    this.setState({ showCert: !showCert });
  }

  removeExperience = () => {
    const { classes, experience, user } = this.props;
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className={classes.popup}>
            {
              !experience.idBlockchain ?
                // Experience not posted on blockchain
                <Fragment>
                  <Typography
                    variant="headline"
                    paragraph
                  >
                    Remove {experience.title} from the Talao database ?
                  </Typography>
                  <Button
                    style={{ marginRight: '20px' }}
                    className={classNames(classes.experienceButton, classes.experienceBlackButton)}
                    onClick={onClose}
                  >
                    No
                  </Button>
                  <Button
                    className={classNames(classes.experienceButton, classes.experienceRedButton)}
                    onClick={
                      () => {
                        this.props.dispatch(removeExpFromBackend(experience, user));
                        onClose();
                      }
                    }
                  >
                    Yes
                  </Button>
                </Fragment>
              :
                // Experience posted on blockchain.
                <Fragment>
                  <Typography
                    variant="headline"
                    paragraph
                  >
                    {
                      [1, 4].includes(experience.status) ?
                        'Unpost ' + experience.title + ' from the blockchain and remove it from Talao database?'
                      :
                        'Unpost ' + experience.title + ' from the blockchain ?'
                    }
                  </Typography>
                  <Button
                    style={{ marginRight: '20px' }}
                    className={classNames(classes.experienceButton, classes.experienceBlackButton)}
                    onClick={onClose}
                  >
                    No
                  </Button>
                  <Button
                    className={classNames(classes.experienceButton, classes.experienceRedButton)}
                    onClick={
                      () => {
                        this.props.dispatch(removeBlockchainExp(experience, user));
                        onClose();
                      }
                    }
                  >
                    Yes
                  </Button>
                </Fragment>
            }
          </div>
        )
      }
    })
  }

  render() {
    const { classes, experience, isClient, user } = this.props;
    const { showCert } = this.state;
    const durationInWords = distanceInWords(new Date(), addDays(new Date(), experience.jobDuration));
    let competencyTags;

    if (!user) {
      return (<Loading />);
    }
    else {
      competencyTags = experience.competencies.map((competency, index) =>
      (
        <CompetencyTag
          key={index}
          value={competency}
        />
      )
    );
  }
  return (
    <div className={classes.experienceContainer}>
      <div>
        <div className={classes.indicator} style={{ backgroundColor: constants.colors[this.props.lightColor], color: constants.colors[this.props.textColor] }}>
          &nbsp;
        </div>
        <div className={classes.timeLine} >
          <div
            className={classes.line}
            style={
              {
                width: isMobile ?
                  '28px'
                : experience.jobDuration < 800 ?
                  experience.jobDuration + 'px'
                : '800px'
              }
            }
          >
          </div>
          <div className={classes.timeContainer}>
            {durationInWords}
          </div>
        </div>
        <div className={classes.dateContainer}>
          {DateService.getMonthYearDate(experience.from)} -{' '}
          {DateService.getMonthYearDate(experience.to)}
        </div>
      </div>
      <div>
        <div className={classes.content}>
          <Typography variant="headline" gutterBottom>
            {experience.title}
          </Typography>
          {competencyTags}
          <Typography variant="body1" gutterBottom className={classes.description}>
            {experience.description}
          </Typography>
          {
            !isClient &&
              <div className={classes.experienceButtons}>
                {/* Directly post certificate => Post: @see NewExperienceWithCertificate */}
                {/* Directly posted certificate => Unpost */}
                {
                  experience.status === undefined &&
                    <Button
                      onClick={this.removeExperience}
                      style={{ display: !user.searchedFreelancers ? 'inline-flex' : 'none' }}
                      className={classNames(classes.experienceButton, classes.experienceRedButton)}
                    >
                      <Close />
                      Unpost
                    </Button>
                }
                {/* Request certificate */}
                {
                  (
                    [1].includes(experience.status) &&
                    !experience.certificatAsked
                  ) &&
                    <Button
                      onClick={
                        () => {
                          this.props.dispatch(
                            askForCertificate(experience.idBack, user)
                          );
                        }
                      }
                      className={classNames(classes.experienceButton, classes.experienceBlackButton)}
                    >
                      <Fingerprint />
                      <span className={classes.iconMargin}>
                        Request a certificate
                      </span>
                    </Button>
                }
                {/* Certificate asked */}
                {
                  [2, 3].includes(experience.status) &&
                    <Button
                      disabled
                      variant="outlined"
                      className={classes.experienceButton}
                    >
                      <AvTimer />Waiting for certificate
                    </Button>
                }
                {/* Add certificate to posted experience or to draft experience */}
                {
                  (
                    [1, 4].includes(experience.status) &&
                    experience.certificatAsked &&
                    !experience.certificatUrl
                  ) &&
                    <Button
                      onClick={
                        () => {
                          this.fileInput.click();
                        }
                      }
                      className={classNames(classes.experienceButton, classes.experienceBlackButton)}
                    >
                      <input
                        onChange={
                          (e) => {
                            // Posted experience
                            if (experience.idBlockchain) {
                              this.props.dispatch(
                                addCertificateToPostedExperienceOnBlockchain(
                                  e.target.files[0],
                                  experience,
                                  user
                                )
                              )
                            }
                            // Draft experience
                            else {
                              this.props.dispatch(
                                addCertificateToExperienceDraftAndPostOnBlockchain(
                                  e.target.files[0],
                                  experience,
                                  user
                                )
                              )
                            }
                          }
                        }
                        style={{ display: 'none' }}
                        ref={fileInput => this.fileInput = fileInput}
                        type="file" accept="application/json"
                      />
                      <Fingerprint />
                        {
                          experience.idBlockchain ?
                            'Add certificate and update'
                          : 'Add certificate and post'
                        }
                    </Button>
                }
                {/* Experience without certificate => Post */}
                {
                  (
                    [1, 2, 3].includes(experience.status) &&
                    !experience.idBlockchain
                  ) &&
                    <Button
                      onClick={() => this.props.dispatch(postExperience(experience, user))}
                      className={classNames(classes.experienceButton, classes.experienceBlackButton)}
                    >
                      <CloudUpload className={classes.leftIcon} />
                      Post
                    </Button>
                }
                {/* Experience not posted: Remove */}
                {
                  (
                    [1, 4].includes(experience.status) &&
                    !experience.idBlockchain
                  ) &&
                    <Fragment>
                      <Button
                        onClick={this.removeExperience}
                        style={{ display: !user.searchedFreelancers ? 'inline-flex' : 'none' }} className={classNames(classes.experienceButton, classes.experienceRedButton)}
                      >
                        <Close />
                        <span className={classes.iconMargin}>Remove</span>
                      </Button>
                    </Fragment>
                }
                {/* Experience posted and no certificate => Remove */}
                {
                  (
                    [1, 4].includes(experience.status) &&
                    experience.idBlockchain
                  ) &&
                    <Button
                      onClick={this.removeExperience}
                      style={{ display: !user.searchedFreelancers ? 'inline-flex' : 'none' }} className={classNames(classes.experienceButton, classes.experienceRedButton)}>
                      <Close />
                      Unpost and remove
                    </Button>
                }
                </div>
          }
          {
            experience.certificatUrl &&
              <div className={classes.viewCertificate}>
                <Button onClick={this.showCertification} className={classNames(classes.experienceButton, classes.experienceBlackButton)}>
                  <LineStyle />
                  <span style={{ display: !showCert ? 'inline-block' : 'none' }}>View certificat</span>
                  <span style={{ display: showCert ? 'inline-block' : 'none' }}>Hide certificat</span>
                </Button>
                <div
                  className={classes.blockcerts}
                  style={{ display: showCert ? 'block' : 'none' }}>
                  <Blockcerts
                    url={experience.certificatUrl}
                    image={talaoCertificateImage}
                    color='#282828'
                    color_bg='#edecec'
                  />
                </div>
              </div>
          }
          </div>
        </div>
      </div>
    );
  }
}

export default compose(withStyles(styles), connect(mapStateToProps))(Experience);
