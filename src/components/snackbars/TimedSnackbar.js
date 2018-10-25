import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import CircularProgress from '@material-ui/core/CircularProgress';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { isMobile } from 'react-device-detect';
import { withStyles } from '@material-ui/core/styles';

import { removeSnackbar } from '../../actions/snackbar';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

const styles1 = theme => ({
  success: {
    backgroundColor: green[600],
    marginBottom: '10px'
  },
  error: {
    marginBottom: '10px',
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    marginBottom: '10px',
    backgroundColor: theme.palette.primary.dark,
  },
  warning: {
    marginBottom: '10px',
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing.unit,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
  progress: {
    marginLeft: '10px'
  },
  spacingButton: {
    position: 'absolute',
    right: '0px',
    padding: '10px'
  }
});

function MySnackbarContent(props) {
  const { classes, className, message, onClose, variant, time, showSpinner, ...other } = props;
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={classNames(classes[variant], className)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          <Icon className={classNames(classes.icon, classes.iconVariant)} />
          {message}
          {showSpinner ?
          <CircularProgress className={classes.progress}/>
          :
          null
          }
        </span>
      }
      {...other}
    />
  );
}

MySnackbarContent.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  message: PropTypes.node,
  time: PropTypes.number,
  showSpinner: PropTypes.bool,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']).isRequired,
};

const MySnackbarContentWrapper = withStyles(styles1)(MySnackbarContent);

const styles2 = theme => ({
  margin: {
    margin: theme.spacing.unit,
  },
});

class TimedSnackbar extends Component {
  state = {
    open: true,
  };
  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ open: false });
    this.props.dispatch(removeSnackbar());
  };
  render() {
    const { autoHideDuration, message, type } = this.props;
    const { open } = this.state;
    return (
      <Snackbar
        key={message}
        open={open}
        onClose={this.handleClose}
        autoHideDuration={autoHideDuration}
        anchorOrigin={{
          vertical: (isMobile) ? 'top' : 'bottom',
          horizontal: 'center',
        }}
      >
        <MySnackbarContentWrapper
          variant={type}
          message={message}
        />
      </Snackbar>
    );
  }
}

TimedSnackbar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default compose(
  withStyles(styles2),
  connect()
)(TimedSnackbar);
