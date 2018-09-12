import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import CopyToClipboard from 'react-copy-to-clipboard';

const styles = theme => ({
  typography: {
    margin: theme.spacing.unit * 2,
  },
  certificatButton: {
    margin: '20px',
    backgroundColor: '#3b3838',
    color: '#ffffff',
    '&:hover': {
        backgroundColor: '#3b3838'
    }
  },
});

class SimplePopover extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      anchorEl: null,
      copied: false
    };
  }

  handleClick = event => {
    this.setState({
      anchorEl: event.currentTarget,
      copied: true
    });
  };

  handleClose = () => {
    this.setState({
      anchorEl: null,
      copied: false
    });
  };

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div>
          <CopyToClipboard text={'http://vault.talao.io:3002/chronology?' + this.props.ethAddress}
                                    onCopy={() => this.setState({copied: true})}>
            <Button
              aria-owns={open ? 'simple-popper' : null}
              aria-haspopup="true"
              variant="contained"
              onClick={this.handleClick}
              className={this.props.classes.certificatButton}
            >
              {this.props.isWatching ? 'Copy this certified profile Resume URL': 'Copy the URL of your certified Resume'}
            </Button>
          </CopyToClipboard>
          {this.state.copied && <Popover
              id="simple-popper"
              open={open}
              anchorEl={anchorEl}
              onClose={this.handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <Typography className={classes.typography}>Copied to clipboard.</Typography>
           </Popover>
          }
      </div>
    );
  }
}

SimplePopover.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimplePopover);