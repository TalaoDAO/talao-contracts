import React from 'react';
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
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { connect } from "react-redux";
import compose from 'recompose/compose';

import { withStyles } from '@material-ui/core/styles';
import { resetTransaction } from '../../actions/transactions';

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
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            className={classes.spacingButton}
            onClick={onClose}
          >
          <CloseIcon className={classes.icon} />
          </IconButton>
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

class CustomizedSnackbars extends React.Component {

  state = {
    open: true,
  };

  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.props.dispatch(resetTransaction());
    this.setState({ open: false });
  };

  render() {
    return (
      <div>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={this.state.open}
          autoHideDuration={this.props.time}
          onClose={this.handleClose}
        >
          <MySnackbarContentWrapper
            onClose={this.handleClose}
            variant={this.props.type}
            message={this.props.message}
            showSpinner={this.props.showSpinner}
          />
        </Snackbar>      
      </div>
    );
  }
}

CustomizedSnackbars.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default compose(withStyles(styles2), connect())(CustomizedSnackbars);