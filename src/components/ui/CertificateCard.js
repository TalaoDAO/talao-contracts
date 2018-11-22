import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import format from 'date-fns/format';

import {
  Card,
  CardActions,
  // CardContent,
  CardHeader,
  CardMedia,
  // Typography,
  withStyles
} from '@material-ui/core';

const styles = {
  card: {},
  cardHeaderRoot: {
    height: 70,
  },
  media: {
    maxHeight: 100,
    width: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  content: {
    paddingTop: 20,
    marginBottom: 10,
  },
  buttons: {
    display: 'flex',
    alignItems: 'space-between',
    justifyContent: 'space-around',
  },
};

class CertificateCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      raised: false
    }
  }
  onMouseOver = () => {
    this.setState({
      raised: true
    });
  }
  onMouseOut = () => {
    this.setState({
      raised: false
    });
  }
  render() {
    const { actions, classes, certificate } = this.props;
    const { raised } = this.state;
    return (
      <Card
        onMouseOver={() => this.onMouseOver()}
        onMouseOut={() => this.onMouseOut()}
        raised={raised}
        className={classes.card}
      >
        <CardHeader
          title={certificate.signed_json.jobTitle}
          subheader={certificate.signed_json.badge.issuer.name}
          classes={{
            root: classes.cardHeaderRoot
          }}
        />
        <CardMedia
          onClick={() => this.props.onClick()}
          component="img"
          src={certificate.signed_json.badge.issuer.image}
          className={classes.media}
        />
        {/* <CardContent>
          <Typography variant="caption">
            Issued on {format(certificate.signed_json.issuedOn, 'D MMMM YYYY [at] H[h]mm')}
          </Typography>
        </CardContent> */}
        <CardActions>
          {actions}
        </CardActions>
      </Card>
    );
  }
}

CertificateCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CertificateCard);
