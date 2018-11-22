import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  withStyles
} from '@material-ui/core';
import { Save } from '@material-ui/icons';

const styles = theme => ({
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
})

const mapStateToProps = state => ({
  user: state.userReducer.user
});

class FreelancerExperienceEdit extends Component {
  render() {
    const { classes, experience } = this.props;
    const { open, onClose } = this.props;
    console.log(experience)
    return (
      <Dialog
        aria-labelledby="confirmation-dialog-title"
        open={open}
        onClose={() => onClose(false)}
      >
        <DialogTitle
          id="confirmation-dialog-title"
        >
          Edit experience
        </DialogTitle>
        <DialogContent>
          Content
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => onClose(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onClose(true)}
            color="primary"
            variant="outlined"
          >
            <Save className={classes.leftIcon} />Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps)
)(FreelancerExperienceEdit);
