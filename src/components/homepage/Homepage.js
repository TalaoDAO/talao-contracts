import React from 'react';
import Card from '@material-ui/core/Card';
import { withStyles, CardContent } from '@material-ui/core';
import { TextField } from '@material-ui/core';
import Button from 'material-ui/Button';
import Grid from '@material-ui/core/Grid';
import { Link } from 'react-router-dom';
import CustomizedSnackbars from '../snackbars/snackbars';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { createVaultClicked, setFreelancerAddress, searchFreelancerClicked, viewDatasClicked } from '../../actions/homepage';
import { guardRedirect } from '../../actions/guard';

const Loading = require('react-loading-animation');

const styles = theme => ({
    certificatButton: {
        margin: '20px',
        backgroundColor: '#3b3838',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#3b3838'
        }
    },
    certificatButtonDisabled: {
        margin: '20px',
        color: 'rgba(0, 0, 0, 0.26)',
        backgroundColor: '#f2f2f2',
        cursor: 'default',
        pointerEvents: 'none',
        border: '1px solid rgba(0, 0, 0, 0.23)'
    },
    content: {
        display: 'inline-block',
        verticalAlign: 'top',
        marginTop: '0px',
        marginLeft: '30px',
        marginBottom: '20px',
        padding: '20px 0px 20px 25px',
        borderLeft: '1px solid ' + theme.palette.grey[300]
    },
    card: {
        flexBasis: 'auto',
        height: '400px',
        marginRight: '20px',
        marginBottom: '20px',
    },
    container: {
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    textField: {
        margin: '10px 20px',
        width: '-webkit-fill-available',
    },
    title: {
        color: theme.palette.text.primary,
        lineHeight: '50px',
        fontSize: '30px',
        display: 'inlin-block',
    },
    center: {
        textAlign: 'center',
    }
});

const mapStateToProps = state => ({
    message: state.guardReducer.message,
    freelancerAddress: state.homepageReducer.freelancerAddress, 
    freelancerAddressError: state.homepageReducer.freelancerAddressError, 
    freelancerAddressEmpty: state.homepageReducer.freelancerAddressEmpty, 
    invalidAddress: state.homepageReducer.invalidAddress, 
    emptyAddress: state.homepageReducer.emptyAddress,
    guardRedirect: state.guardReducer.guardRedirect,
    transactionError: state.transactionReducer.transactionError,
    transactionReceipt: state.transactionReducer.transactionReceipt,
    object: state.transactionReducer.object,
    transactionHash: state.transactionReducer.transactionHash,
  });
  
class Homepage extends React.Component {

    componentWillReceiveProps() {
        if (this.props.guardRedirect) {
            this.props.history.push(this.props.guardRedirect)
            this.props.dispatch(guardRedirect(''));
        }
    }
    
    render() {
        //get props
        const { message, 
                freelancerAddress, 
                freelancerAddressError, 
                freelancerAddressEmpty, 
                invalidAddress, 
                emptyAddress, 
                transactionError, 
                transactionHash,
                transactionReceipt,
                object } = this.props;

        //Loading user...
        if (!this.props.user) {
            return (<Loading />);
        }
        //snackbar if guard has an error
        let snackbar;
        if (message) {
            snackbar = (<CustomizedSnackbars message={message} time={5000} type='error'/>);
        }
        if (transactionHash && !transactionReceipt) {
            snackbar = (<CustomizedSnackbars message={object + ' Transaction in progress...'} showSpinner={true} type='info'/>);
        } else if (transactionError) {
            snackbar = (<CustomizedSnackbars message={transactionError.message} showSpinner={false} type='error'/>);
        } else if (transactionReceipt) {
            snackbar = (<CustomizedSnackbars message='Transaction sucessfull !' showSpinner={false} type='success'/>);
        }
        //If the user is doesn't have a wallet he can't create a vault
        let showCreateYourVaultBlock;
        if (this.props.user.ethAddress) {
            showCreateYourVaultBlock = 
            (<Grid item xs={12} lg={6}>
                <Card className={this.props.classes.card}>
                    <CardContent>
                        <div className={this.props.classes.center}>
                        {(!this.props.user.freelancerDatas) ?
                            <p className={this.props.classes.title}>You are a freelancer?<br />Create your vault right now!</p> :
                            <p className={this.props.classes.title}>View my datas</p>
                        }
                        </div>
                        <div className={this.props.classes.center}>
                            <Button onClick={() => this.props.user.freelancerDatas ? this.props.dispatch(viewDatasClicked(this.props.history)) : this.props.dispatch(createVaultClicked(this.props.history))} className={this.props.classes.certificatButton} label="login">
                                <Link style={{ textDecoration: 'none', color: '#fff' }} to={(!this.props.user.freelancerDatas) ? "/register" : "/chronology"}>{(!this.props.user.freelancerDatas) ? 'Create my vault' : 'View my datas'}</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </Grid>)
        }
        return (
            <Grid container className={this.props.classes.container}>
                <Grid item xs={12} lg={6}>
                    <Card className={this.props.classes.card}>
                        <CardContent>
                            <div className={this.props.classes.center}>
                                <p className={this.props.classes.title}>Looking for a freelancer?<br />Type his address here:</p>
                            </div>
                            <TextField
                                value={freelancerAddress}
                                error={freelancerAddressError || freelancerAddressEmpty}
                                helperText={(!freelancerAddressError && !freelancerAddressEmpty) ? '' : (freelancerAddressEmpty) ? emptyAddress : invalidAddress}
                                onChange={(event) => this.props.dispatch(setFreelancerAddress(event.target.value))}
                                className={this.props.classes.textField}
                                inputProps={{
                                    style: { textAlign: "center" }
                                }}
                            />
                            <div className={this.props.classes.center}>
                                <Button onClick={() => this.props.dispatch(searchFreelancerClicked(this.props.history, freelancerAddress))} className={(!freelancerAddressError && !freelancerAddressEmpty) ? this.props.classes.certificatButton : this.props.classes.certificatButtonDisabled} label="login">
                                        Find my freelancer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
                {showCreateYourVaultBlock}
                {snackbar}
            </Grid>
        );
    }
}

export default compose(withStyles(styles), connect(mapStateToProps))(Homepage);