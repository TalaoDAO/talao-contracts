import React from 'react';
import { withStyles } from '@material-ui/core';
import { Card, Grid, CardContent, TableHead, TableRow, Paper, TableBody, TableCell, Table, Typography, Button } from '@material-ui/core';
import { CloudDownload, Visibility, Share, DeleteForever  } from '@material-ui/icons';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { getDashboardDatas, deleteAsync } from '../../actions/dashboard';
import { confirmAlert } from 'react-confirm-alert';
import talaoCertificateImage from '../../images/talaoCertificateImage';
import { Blockcerts } from 'react-blockcerts';
import downloadjs from 'downloadjs';

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
    certificats: state.dashboardReducer.certificats
  });

class Dashboard extends React.Component {

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
                return 'Request send to client'
            case 2:
                return 'Wainting for Talao finalization'
            case 3:
                return 'Completed'
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
                            this.props.dispatch(deleteAsync(certificat.id, this.props.certificats));
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
        var decoder = new TextDecoder("utf-8");
        let certificat = decoder.decode(Buffer.from(signedCertificat.data));
        downloadjs(certificat, 'certificate.json', 'application/json');
    }

    render() {
        const { experiences, organizations, certificats } = this.props;
        let tableExpRows = experiences.map((experience) => {
            return (
                <TableRow className={this.props.classes.row} key={experience.id}>
                    <CustomTableCell component="th" scope="row"> {experience.organization.name} </CustomTableCell>
                    <CustomTableCell>{experience.job_title}</CustomTableCell>
                    <CustomTableCell>{ this.getStatusFromNumber(experience.status) }</CustomTableCell>
                    <CustomTableCell>
                        <Button>
                            <Visibility />
                        </Button>
                        <Button>
                            <Share />
                        </Button>
                        <Button>
                            <CloudDownload />
                        </Button>
                        <Button>
                            <DeleteForever />
                        </Button>
                    </CustomTableCell>
                </TableRow>
            );
        });

        let tableOrgRows = organizations.map((organization) => {
            return (
                <TableRow className={this.props.classes.row} key={organization.id}>
                    <CustomTableCell component="th" scope="row"> {organization.name} </CustomTableCell>
                    <CustomTableCell>{organization.responsible_first_name + ' ' + organization.responsible_last_name}</CustomTableCell>
                    <CustomTableCell>{ organization.validated ? 'Completed' : 'Pending' }</CustomTableCell>
                    <CustomTableCell>actions...</CustomTableCell>
                </TableRow>
            );
        });

        let tableCertsRows = certificats.map((certificat) => {
            return (
                <TableRow className={this.props.classes.row} key={certificat.id}>
                    <CustomTableCell component="th" scope="row"> {certificat.job_title} </CustomTableCell>
                    <CustomTableCell>
                        <Button onClick={() => this.previewcertificat(certificat.signed_json)}>
                            <Visibility />
                        </Button>
                        <Button>
                            <Share />
                        </Button>
                        <Button onClick={() => this.downloadCertificat(certificat.signed_json)}>
                            <CloudDownload />
                        </Button>
                        <Button onClick={() => this.removeCertificat(certificat)}>
                            <DeleteForever />
                        </Button>
                    </CustomTableCell>
                </TableRow>
            );
        });

        return (
            <Card className={this.props.classes.card}>
                <CardContent>
                    <div className={this.props.classes.content}>
                        <Grid container spacing={40}>
                            <Grid item lg={12}>
                            <Typography variant="display1" className={this.props.classes.tableTitle}>My experiences</Typography>
                                <Paper className={this.props.classes.root}>
                                    <Table className={this.props.classes.table}>
                                        <TableHead>
                                        <TableRow>
                                            <CustomTableCell>Client</CustomTableCell>
                                            <CustomTableCell>Job title</CustomTableCell>
                                            <CustomTableCell>Statut</CustomTableCell>
                                            <CustomTableCell>Actions</CustomTableCell>
                                        </TableRow>
                                        </TableHead>
                                        {tableExpRows &&
                                            <TableBody>
                                                {tableExpRows}
                                            </TableBody>
                                        }
                                    </Table>
                                </Paper>
                            </Grid>
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
                                        {tableOrgRows &&
                                            <TableBody>
                                                {tableOrgRows}
                                            </TableBody>
                                        }
                                    </Table>
                                </Paper>
                            </Grid>
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
                                        {tableCertsRows &&
                                            <TableBody>
                                                {tableCertsRows}
                                            </TableBody>
                                        }
                                    </Table>
                                </Paper>
                            </Grid>
                            {this.state.cert &&
                                <Blockcerts json={this.state.cert} key={this.state.cert} image={talaoCertificateImage} color='#282828' color_bg='#edecec'/>
                            }
                        </Grid>
                    </div>
                </CardContent>
            </Card>
        );
    }
}

export default compose(withStyles(styles), connect(mapStateToProps))(Dashboard);
