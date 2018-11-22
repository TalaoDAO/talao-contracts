import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { Link } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert';
import { Blockcerts } from 'react-blockcerts';
import { slugify } from 'transliteration';
import downloadjs from 'downloadjs';
import Loading from 'react-loading-animation';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import {
  getDashboardDatas,
  deleteAsync,
  shareCertificate,
  shareCertificateInit
} from '../../actions/freelance/dashboard';

import ConfirmationDialog from '../ui/ConfirmationDialog';
import CertificateCard from '../ui/CertificateCard';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Switch,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Table,
  Typography,
  Button,
  withStyles
} from '@material-ui/core';
import { CloudDownload, LineStyle, Share, DeleteForever } from '@material-ui/icons';
import talaoCertificateImage from '../../images/talaoCertificateImage';

const styles = theme => ({
  root: {
    width: '-webkit-fill-available',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  content: {
    verticalAlign: 'top',
    marginTop: '0px',
    marginLeft: '30px',
    marginBottom: '20px',
    padding: '20px 0px 20px 25px',
  },
  card: {
    transition: 'all .4s ease',
    paddingBottom: '15px',
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default
    }
  },
  certificatButton: {
    margin: '20px 0px',
    backgroundColor: '#3b3838',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#3b3838'
    }
  },
  removeButton: {
    margin: '20px 0px',
    backgroundColor: '#FF3C47',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#FF3C47'
    }
  },
  rightAction: {
    marginLeft: 'auto',
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
  section: {
    marginTop: theme.spacing.unit * 4,
  },
  stepper: {
    background: '#fafafa',
    marginTop: theme.spacing.unit * 8,
    marginBottom: theme.spacing.unit * 2,
  },
  buttons: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mapStateToProps = state => ({
  experiences: state.dashboardReducer.experiences,
  organizations: state.dashboardReducer.organizations,
  certificates: state.dashboardReducer.certificates,
  certificate: state.dashboardReducer.certificate,
  certificateLoading: state.dashboardReducer.certificateLoading,
  dashboardLoading: state.dashboardReducer.loading,
  guardLoading: state.guardReducer.loading,
});

class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      confirmationDialog: null,
      dialog: null,
      shareDialog: null,
      step: 0
    }
  }

  componentDidMount() {
    const { user } = this.props;
    if (user) {
      this.props.dispatch(getDashboardDatas(user.ethAddress));
    }
    this.interval = setInterval(() => this.nextStep(), 3000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  nextStep = () => {
    let { step } = this.state;
    if (step === 3) {
      step = 0;
    }
    else {
      step++;
    }
    this.setState({
      step
    });
  }

  getExperienceStatus = experience => {
    const { organizations } = this.props;
    const index = organizations.findIndex(x => x.id === experience.organizationId);
    if (index !== -1) {
      const organization = organizations[index];
      if (!organization.validated) {
        return 'Company pending validation by Talao';
      }
    }
    switch (experience.status) {
      case 1:
        return 'Experience draft';
      case 2:
        return 'Certificate request sent, pending certification by Company';
      case 3:
        return 'Pending certificate finalization by Talao';
      case 4:
        return 'Completed, you can now add the certificate to your experience';
      default:
        break;
    }
  }

  removeCertificate = certificate => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className={this.props.classes.popup}>
            <h1>Remove {certificate.job_title} certificat from the Talao database ?</h1>
            <p>Are you sure you want to remove this experience ?</p>
            <Button style={{ marginRight: '20px' }} className={this.props.classes.certificatButton} onClick={onClose}>No</Button>
            <Button className={this.props.classes.removeButton} onClick={() => {
              this.props.dispatch(deleteAsync(certificate.id, this.props.certificates));
              onClose()
            }}>Yes</Button>
          </div>
        )
      }
    })
  }

  viewCertificate = json => {
    this.setState({
      dialog: {
        open: true,
        json
      }
    });
  }

  closeDialog = () => {
    this.setState({
      dialog: null
    });
  }

  downloadCertificate(json) {
    const fileName = slugify(
      json.recipientProfile.name + '-' + json.jobTitle
    );
    const jsonString = JSON.stringify(json);
    downloadjs(jsonString, fileName + '.json', 'application/json');
  }

  openConfirmationDialog = (title, content, action) => {
    this.setState({
      confirmationDialog: {
        open: true,
        confirmed: null,
        title,
        content,
        action
      }
    });
  }

  closeConfirmationDialog = confirmed => {
    const { confirmationDialog } = this.state;
    if (confirmed) {
      this.props.dispatch(confirmationDialog.action);
    }
    this.setState({
      confirmationDialog: null
    });
  }

  openShareDialog = certificate => {
    this.props.dispatch(shareCertificateInit(certificate));
    this.setState({
      shareDialog: {
        open: true
      }
    });
  }

  closeShareDialog = () => {
    this.setState({
      shareDialog: null
    });
  }

  shareDialogCopied = () => {
    this.setState({
      shareDialog: {
        open: true,
        copied: true
      }
    });
  }

  render() {
    const {
      classes,
      experiences,
      certificates,
      certificate,
      certificateLoading,
      dashboardLoading,
      guardLoading
    } = this.props;
    const { confirmationDialog, dialog, shareDialog, step } = this.state;
    const shareLink = certificate ? process.env.REACT_APP_ISSUERFRONT + 'public/certificates/' + certificate.uuid : null;

    if (guardLoading || dashboardLoading) {
      return (<Loading />);
    }

    return (
      <Grid container spacing={24}>
        <Grid item xs={12}>
          <Stepper
            activeStep={step}
            alternativeLabel
            className={classes.stepper}
          >
            <Step key={0}>
              <StepLabel>Add a new experience</StepLabel>
            </Step>
            <Step key={1}>
              <StepLabel>Request a certificate</StepLabel>
            </Step>
            <Step key={2}>
              <StepLabel>Company rates & certifies the experience</StepLabel>
            </Step>
            <Step key={3}>
              <StepLabel>You get your certificate!</StepLabel>
            </Step>
          </Stepper>
          <div className={classes.buttons}>
            <Button
              component={Link}
              to={'/chronology'}
              color="primary"
              variant="outlined"
            >
              Add an experience
            </Button>
          </div>
        </Grid>
        {
          experiences.length > 0 &&
            <Grid item xs={12}>
              <Typography variant="display2" paragraph>My experiences</Typography>
              <Table className={this.props.classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell><Typography variant="subheading">Experience title</Typography></TableCell>
                    <TableCell><Typography variant="subheading">Company</Typography></TableCell>
                    <TableCell><Typography variant="subheading">Status</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    experiences.map(experience => {
                      return (
                        <Fragment key={experience.id}>
                          {
                            [1, 2, 3, 4].includes(experience.status) &&
                              <TableRow className={this.props.classes.row} key={experience.id}>
                                <TableCell><Typography>{experience.job_title}</Typography></TableCell>
                                <TableCell><Typography>{experience.organization.name}</Typography></TableCell>
                                <TableCell><Typography>{this.getExperienceStatus(experience)}</Typography></TableCell>
                              </TableRow>
                          }
                        </Fragment>
                      );
                    })
                  }
                </TableBody>
              </Table>
            </Grid>
        }
        {
          certificates && Object.keys(certificates).length > 0 &&
            <Grid item xs={12} className={classes.section}>
              <Typography variant="display2" paragraph>My certificates</Typography>
              <Grid container spacing={24}>
                {
                  Object.values(certificates).map((certificate, index) => {
                    return (
                      <Grid item xs={12} lg={4} key={index}>
                        <CertificateCard
                          certificate={certificate}
                          onClick={() => this.viewCertificate(certificate.signed_json)}
                          actions={
                            <Fragment>
                              <IconButton
                                aria-label="View"
                                onClick={() => this.viewCertificate(certificate.signed_json)}
                              >
                                <LineStyle />
                              </IconButton>
                              <IconButton
                                aria-label="Download"
                                onClick={() => this.downloadCertificate(certificate.signed_json)}
                              >
                                <CloudDownload />
                              </IconButton>
                              <IconButton
                                aria-label="Share"
                                onClick={() => this.openShareDialog(certificate)}
                              >
                                <Share />
                              </IconButton>
                              <IconButton
                                aria-label="Delete"
                                onClick={
                                  () => {
                                    const title = 'Delete this certificate?';
                                    const content = 'If you delete this certificate, Talao will remove all data in its possession concerning it. You will not be able to share it any more through Talao. Please download the certificate first, and keep the file in a secure place. Are you sure to delete this certificate now?';
                                    this.openConfirmationDialog(
                                      title,
                                      content,
                                      deleteAsync(certificate.id, certificates)
                                    )
                                  }
                                }
                                className={classes.rightAction}
                              >
                                <DeleteForever />
                              </IconButton>
                            </Fragment>
                          }
                        />
                      </Grid>
                    )
                  })
                }
              </Grid>
            </Grid>
        }
        {
          confirmationDialog &&
            <ConfirmationDialog
              open={confirmationDialog.open}
              onClose={confirmed => this.closeConfirmationDialog(confirmed)}
              title={confirmationDialog.title}
              content={confirmationDialog.content}
            />
        }
        {
          dialog &&
            <Dialog
              open={dialog.open}
              onClose={() => this.closeDialog()}
              scroll="body"
              maxWidth="md"
            >
              <Blockcerts
                json={dialog.json}
                image={talaoCertificateImage}
                color='#282828'
                color_bg='#edecec'
              />
              <DialogActions>
                <Button
                  onClick={() => this.closeDialog()}
                  color="primary"
                  variant="outlined"
                >
                  Close
                </Button>
              </DialogActions>
            </Dialog>
        }
        {
          (
            shareDialog
          ) &&
            <Dialog
              open={shareDialog.open}
              onClose={() => this.closeShareDialog()}
              maxWidth="md"
            >
              <DialogTitle>
                {certificate.signed_json.jobTitle}
              </DialogTitle>
              <DialogContent>
                {
                  certificateLoading ?
                    <Loading />
                  :
                    <Fragment>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={certificate.shared}
                            onChange={
                              () => {
                                this.props.dispatch(shareCertificate(certificate.id, certificates));
                              }
                            }
                          />
                        }
                        label="Share this certificate"
                      />
                      {
                        certificate.shared &&
                          <Typography variant="caption" paragraph>
                            Warning: If you stop sharing this certificate, the share link you might have sent to your contacts will be disabled.
                          </Typography>
                      }
                    </Fragment>
                }
              </DialogContent>
              <DialogActions>
                {
                  certificate.shared  &&
                    <Fragment>
                      <Button
                        href={shareLink}
                        target="issuerfront"
                        color="primary"
                      >
                        Open share link
                      </Button>
                      {
                        shareDialog.copied ?
                          <Button
                            disabled
                          >
                            Link now copied
                          </Button>
                        :
                          <CopyToClipboard
                            text={shareLink}
                            onCopy={() => this.shareDialogCopied()}
                          >
                            <Button
                              color="primary"
                            >
                              Copy share link
                            </Button>
                          </CopyToClipboard>
                      }
                    </Fragment>
                }
                <Button
                  onClick={() => this.closeShareDialog()}
                >
                  Close
                </Button>
              </DialogActions>
            </Dialog>
        }
      </Grid>
    );
  }
}

export default compose(withStyles(styles), connect(mapStateToProps))(Dashboard);
