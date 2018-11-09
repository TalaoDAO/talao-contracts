import React, { Component } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { confirmAlert } from 'react-confirm-alert';
import { Blockcerts } from 'react-blockcerts';
import { slugify } from 'transliteration';
import downloadjs from 'downloadjs';

import { getDashboardDatas, deleteAsync } from '../../actions/freelance/dashboard';

import {
  Card,
  Grid,
  CardContent,
  TableHead,
  TableRow,
  Paper,
  TableBody,
  TableCell,
  Table,
  Typography,
  Button,
  withStyles
} from '@material-ui/core';
import { CloudDownload, Visibility, Share, DeleteForever } from '@material-ui/icons';
import talaoCertificateImage from '../../images/talaoCertificateImage';

const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

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
  table: {
    minWidth: 700,
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default
    }
  },
  tableTitle: {
    textAlign: 'center'
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
});

//map the redux store the the props component
const mapStateToProps = state => ({
  experiences: state.dashboardReducer.experiences,
  organizations: state.dashboardReducer.organizations,
  certificates: state.dashboardReducer.certificates
});

class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cert: null
    }
    this.previewcertificat = this.previewcertificat.bind(this);
  }

  componentDidMount() {
    if (this.props.user)
    this.props.dispatch(getDashboardDatas(this.props.user.ethAddress));
  }

  getStatusFromNumber(status) {
    switch (status) {
      case 1:
        return 'Draft';
      case 2:
        return 'Request sent to Client';
      case 3:
        return 'Finalization by Talao';
      case 4:
        return 'Completed';
      default:
        break;
    }
  }

  removeCertificat = (certificat) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className={this.props.classes.popup}>
            <h1>Remove {certificat.job_title} certificat from the Talao database ?</h1>
            <p>Are you sure you want to remove this experience ?</p>
            <Button style={{ marginRight: '20px' }} className={this.props.classes.certificatButton} onClick={onClose}>No</Button>
            <Button className={this.props.classes.removeButton} onClick={() => {
              this.props.dispatch(deleteAsync(certificat.id, this.props.certificates));
              onClose()
            }}>Yes</Button>
          </div>
        )
      }
    })
  }

  previewcertificat(signedCertificat) {
    if(!this.state.cert) {
      var decoder = new TextDecoder("utf-8");
      let certificat = JSON.parse(decoder.decode(Buffer.from(signedCertificat.data)));
      this.setState({ cert: certificat});
    } else {
      this.setState({cert: null});
    }
  }

  downloadCertificat(signedCertificat) {
    const decoder = new TextDecoder("utf-8");
    const certificat = decoder.decode(Buffer.from(signedCertificat.data));
    const certificatJson =  JSON.parse(certificat);
    const fileName = slugify(certificatJson.recipientProfile.name + '-' + certificatJson.jobTitle);
    downloadjs(certificat, fileName + '.json', 'application/json');
  }

  render() {
    const { experiences, organizations, certificates } = this.props;
    const tableExpRows = experiences.map(experience => {
      return (
        <TableRow className={this.props.classes.row} key={experience.id}>
          <CustomTableCell>{experience.job_title}</CustomTableCell>
          <CustomTableCell component="th" scope="row"> {experience.organization.name} </CustomTableCell>
          <CustomTableCell>{ this.getStatusFromNumber(experience.status) }</CustomTableCell>
        </TableRow>
      );
    });
    const tableCertsRows = certificates.map(certificate => {
      return (
        <TableRow className={this.props.classes.row} key={certificate.id}>
          <CustomTableCell component="th" scope="row"> {certificate.job_title} </CustomTableCell>
          <CustomTableCell>
            <Button onClick={() => this.previewcertificat(certificate.signed_json)}>
              <Visibility />
            </Button>
            <Button>
              <Share />
            </Button>
            <Button onClick={() => this.downloadCertificat(certificate.signed_json)}>
              <CloudDownload />
            </Button>
            <Button onClick={() => this.removeCertificat(certificate)}>
              <DeleteForever />
            </Button>
          </CustomTableCell>
        </TableRow>
      );
    });
    const tableOrgRows = organizations.map(organization => {
      return (
        <TableRow className={this.props.classes.row} key={organization.id}>
          <CustomTableCell component="th" scope="row"> {organization.name} </CustomTableCell>
          <CustomTableCell>{organization.responsible_first_name + ' ' + organization.responsible_last_name}</CustomTableCell>
          <CustomTableCell>{ organization.validated ? 'Completed' : 'Pending' }</CustomTableCell>
          <CustomTableCell>actions...</CustomTableCell>
        </TableRow>
      );
    });
    return (
      <Card className={this.props.classes.card}>
        <CardContent>
          <div className={this.props.classes.content}>
            <Grid container spacing={40}>
              {
                experiences.length > 0 &&
                  <Grid item lg={12}>
                    <Typography variant="display1" className={this.props.classes.tableTitle}>My certificate requests</Typography>
                    <Paper className={this.props.classes.root}>
                      <Table className={this.props.classes.table}>
                        <TableHead>
                          <TableRow>
                            <CustomTableCell>Job title</CustomTableCell>
                            <CustomTableCell>Client</CustomTableCell>
                            <CustomTableCell>Statut</CustomTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tableExpRows}
                        </TableBody>
                      </Table>
                    </Paper>
                  </Grid>
              }
              {
                certificates.length > 0 &&
                  <Grid item lg={12}>
                    <Typography variant="display1" className={this.props.classes.tableTitle}>My certificates</Typography>
                    <Paper className={this.props.classes.root}>
                      <Table className={this.props.classes.table}>
                        <TableHead>
                          <TableRow>
                            <CustomTableCell>Experience title</CustomTableCell>
                            <CustomTableCell>Actions</CustomTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tableCertsRows}
                        </TableBody>
                      </Table>
                    </Paper>
                  </Grid>
              }
              {this.state.cert &&
                <Blockcerts json={this.state.cert} key={this.state.cert} image={talaoCertificateImage} color='#282828' color_bg='#edecec'/>
              }
              {
                organizations.length > 0 &&
                  <Grid item lg={12}>
                    <Typography variant="display1" className={this.props.classes.tableTitle}>My client request</Typography>
                    <Paper className={this.props.classes.root}>
                      <Table className={this.props.classes.table}>
                        <TableHead>
                          <TableRow>
                            <CustomTableCell>Company</CustomTableCell>
                            <CustomTableCell>Name</CustomTableCell>
                            <CustomTableCell>Statut</CustomTableCell>
                            <CustomTableCell>Actions</CustomTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tableOrgRows}
                        </TableBody>
                      </Table>
                    </Paper>
                  </Grid>
              }
            </Grid>
          </div>
        </CardContent>
      </Card>
    );
  }
}

export default compose(withStyles(styles), connect(mapStateToProps))(Dashboard);
