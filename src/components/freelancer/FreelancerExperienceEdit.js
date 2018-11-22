import React, { Component } from 'react';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@material-ui/core';

class FreelancerExperienceEdit extends Component {
  render() {
    const { open, onClose, title} = this.props;
    return (
      <Dialog
        aria-labelledby="confirmation-dialog-title"
        open={open}
        onClose={() => onClose(false)}
      >
        <DialogTitle
          id="confirmation-dialog-title"
        >
          {title}
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
            Update
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default FreelancerExperienceEdit;
