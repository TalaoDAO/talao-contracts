import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { postOnBlockchainExperienceWithCertificate } from '../../actions/freelance/experience';
import Dropzone from 'react-dropzone';
import { Blockcerts } from 'react-blockcerts';

import { withStyles } from '@material-ui/core/styles';
import { Button, Paper, Typography } from '@material-ui/core';
import { CloudUpload } from '@material-ui/icons';
import PropTypes from 'prop-types';
import talaoCertificateImage from '../../images/talaoCertificateImage';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    width: '80%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.unit * 8,
  },
  dropzoneContainer: {
    width: '100%',
    marginTop: theme.spacing.unit * 4,
    marginBottom: theme.spacing.unit * 4,
    backgroundColor: theme.palette.background.default,
  },
  dropzone: {
    textAlign: 'center',
    paddingTop: theme.spacing.unit * 8,
    paddingBottom: theme.spacing.unit * 8,
    color: theme.palette.primary.main,
  },
  blockcerts: {
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  icon: {
    fontSize: 64,
  },
  postButton: {
    margin: theme.spacing.unit * 8,
    color: theme.palette.white.main,
    backgroundColor: theme.palette.black.main,
    '&:hover': {
      backgroundColor: '#3b3838',
    },
  },
});

const mapStateToProps = state => ({
  user: state.userReducer.user
});

class FreelancerExperienceCreateWithCertificate extends Component {
  constructor (props) {
    super (props);
    this.state = {
      signedCertificate: {},
      file: null
    }
  }
  onDrop = (acceptedFiles, rejectedFiles) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileAsBinaryString = reader.result;
        const signedCertificate = JSON.parse(fileAsBinaryString);
        this.setState({
          signedCertificate: signedCertificate,
          file: file
        });
      };
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.readAsBinaryString(file);
    })
  }
  render() {
    const { classes, user } = this.props;
    const { file, signedCertificate } = this.state;
    return (
      <div className={classes.root}>
        <div className={classes.section}>
          {
            Object.keys(signedCertificate).length > 0 ?
              <div className={classes.blockcerts}>
                <Blockcerts
                  json={signedCertificate}
                  image={talaoCertificateImage}
                  color='#282828'
                  color_bg='#edecec'
                />
                <Button
                  size="large"
                  className={this.props.classes.postButton}
                  onClick={() => {
                      this.props.dispatch(postOnBlockchainExperienceWithCertificate(file, user));
                      this.props.dispatch({type:'RESET_EXPERIENCE_REDUCER'});
                    }
                  }
                >
                  <CloudUpload className={classes.leftIcon} />Post this certified experience
                </Button>
              </div>
            :
              <Paper className={classes.dropzoneContainer}>
                <Dropzone
                  accept='application/json'
                  onDrop={(acceptedFiles, rejectedFiles) => this.onDrop(acceptedFiles, rejectedFiles)}
                  className={classes.dropzone}
                >
                  <CloudUpload className={classes.icon} />
                  <Typography variant="title" paragraph>Drop here your certificate, or click to choose a file.</Typography>
                </Dropzone>
              </Paper>
          }
        </div>
      </div>
    );
  }
}

FreelancerExperienceCreateWithCertificate.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default compose(
  withStyles(styles),
  connect(mapStateToProps)
)(FreelancerExperienceCreateWithCertificate);
