import React, { Component } from 'react';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@material-ui/core';

class ConfirmationDialog extends Component {
  render() {
    const { open, onClose, title, content } = this.props;
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
          {content}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => onClose(false)}
          >
            No
          </Button>
          <Button
            onClick={() => onClose(true)}
            color="primary"
            variant="outlined"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default ConfirmationDialog;
