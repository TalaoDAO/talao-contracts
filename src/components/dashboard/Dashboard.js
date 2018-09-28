import React from 'react';
import { withStyles } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import { Grid, CardContent, TableHead, TableRow, Paper, TableBody, TableCell, Table, Typography } from '@material-ui/core';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { getExperiences } from '../../actions/dashboard';

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
    }
});

//map the redux store the the props component
const mapStateToProps = state => ({
    experiences: state.dashboardReducer.experiences
  });

class Dashboard extends React.Component {

    componentDidMount() {
        this.props.dispatch(getExperiences());
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

    render() {
        const { experiences } = this.props;
        let tableRows = (experiences) && experiences.map((experience) => { 
            return (
                <TableRow className={this.props.classes.row} key={experience.id}>
                    <CustomTableCell component="th" scope="row"> {experience.organization.name} </CustomTableCell>
                    <CustomTableCell>{experience.job_description}</CustomTableCell>
                    <CustomTableCell>{ this.getStatusFromNumber(experience.status) }</CustomTableCell>
                    <CustomTableCell>actions...</CustomTableCell>
                </TableRow>
            ); 
        });
        return (
            <Card className={this.props.classes.card}>
                <CardContent>
                    <div className={this.props.classes.content}>
                        <Grid container spacing={40}>
                            <Grid item lg={12}>
                            <Typography variant="display1" className={this.props.classes.tableTitle}>My certificates</Typography>
                                <Paper className={this.props.classes.root}>
                                    <Table className={this.props.classes.table}>
                                        <TableHead>
                                        <TableRow>
                                            <CustomTableCell>Client</CustomTableCell>
                                            <CustomTableCell>Job description</CustomTableCell>
                                            <CustomTableCell>Statut</CustomTableCell>
                                            <CustomTableCell>Actions</CustomTableCell>
                                        </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {tableRows}
                                        </TableBody>
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
                                        <TableBody>
                                            {tableRows}
                                        </TableBody>
                                    </Table>
                                </Paper>
                            </Grid>                                                               
                        </Grid>
                    </div>
                </CardContent>
            </Card>
        );
    }
}

export default compose(withStyles(styles), connect(mapStateToProps))(Dashboard);