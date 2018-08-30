import React from 'react';
import Card from '@material-ui/core/Card';
import { withStyles, CardContent } from '@material-ui/core';
import { TextField, Grid } from '@material-ui/core';
import Button from 'material-ui/Button';
import { constants } from '../../constants';
import Collapse from '@material-ui/core/Collapse';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import defaultFreelancerPicture from '../../images/freelancer-picture.jpg';
import { initVaultCreation, canSwitchStep, accessPriceChange, setVaultInput, setAccessPrice, submitVault, addImageClicked, addProfilePicture } from '../../actions/createVault';
import queryString from 'query-string'
import { hasAccess } from '../../actions/guard';
import CustomizedSnackbars from '../snackbars/snackbars';

const Loading = require('react-loading-animation');

const styles = theme => ({
    certificatButton: {
        margin: '20px 20px 0px -35px',
        backgroundColor: '#3b3838',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#3b3838'
        }
    },
    progress: {
        color: '#ffffff',
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -16,
        marginLeft: -16
    },
    certificatButtonDisabled: {
        margin: '20px 20px 0px -35px',
        color: 'rgba(0, 0, 0, 0.26)',
        backgroundColor: '#f2f2f2',
        cursor: 'default',
        pointerEvents: 'none',
        border: '1px solid rgba(0, 0, 0, 0.23)',
    },
    content: {
        display: 'inline-block',
        verticalAlign: 'top',
        marginTop: '0px',
        marginLeft: '30px',
        marginBottom: '20px',
        padding: '20px 0px 20px 25px',
        borderLeft: '1px solid ' + theme.palette.grey[300],
    },
    card: {
        transition: 'all .6s ease',
        paddingBottom: '15px',
    },
    indicator: {
        display: 'inline-block',
        width: '20px',
        height: '20px',
        lineHeight: '20px',
        textAlign: 'center',
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '50%',
        cursor: 'pointer',
    },
    wrapper: {
        margin: theme.spacing.unit,
        position: 'relative',
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        margin: '10px 20px',
        width: '-webkit-fill-available',
    },
    formControl: {
        margin: '60px',
    },
    timeLine: {
        display: 'inline-block',
        cursor: 'pointer',
    },
    timeContainer: {
        display: 'inline-block',
        paddingLeft: '5px',
        fontSize: '25px',
        verticalAlign: 'top',
        lineHeight: '20px',
    },
    line: {
        display: 'inline-block',
        borderTop: '6px solid ' + theme.palette.grey[300],
        borderRight: '6px solid transparent',
        width: '150px',
        paddingBottom: '3px',
    },
    picture: {
        borderRadius: '50%',
        width: '100px',
        height: '100px',
        marginLeft: '30%',
    },
    specialWidth: {
        width: '250px'
    }
});

//map the redux store the the props component
const mapStateToProps = state => ({
    user: state.userReducer.user,
    step: state.createVaultReducer.step,
    accessPrice: state.createVaultReducer.accessPrice,
    firstName: state.createVaultReducer.firstName,
    lastName: state.createVaultReducer.lastName,
    title: state.createVaultReducer.title,
    description: state.createVaultReducer.description,
    mail: state.createVaultReducer.mail,
    phone: state.createVaultReducer.phone,
    vaultMaxAccessPrice: state.createVaultReducer.vaultMaxAccessPrice,
    accessPriceError: state.createVaultReducer.accessPriceError,
    isAccessPriceSet: state.createVaultReducer.isAccessPriceSet,
    maxAccessPricePlaceholder: state.createVaultReducer.maxAccessPricePlaceholder,
    firstNameError: state.createVaultReducer.firstNameError,
    firstNameEmpty: state.createVaultReducer.firstNameEmpty,
    lastNameError: state.createVaultReducer.lastNameError,
    lastNameEmpty: state.createVaultReducer.lastNameEmpty,
    titleError: state.createVaultReducer.titleError,
    titleEmpty: state.createVaultReducer.titleEmpty,
    mailError: state.createVaultReducer.mailError,
    mailEmpty: state.createVaultReducer.mailEmpty,
    phoneError: state.createVaultReducer.phoneError,
    phoneEmpty: state.createVaultReducer.phoneEmpty,
    helperTextTooLong: state.createVaultReducer.helperTextTooLong,
    helperIncorrectMail: state.createVaultReducer.helperIncorrectMail,
    helperIncorrectPhoneNumber: state.createVaultReducer.helperIncorrectPhoneNumber,
    helperTextEmpty: state.createVaultReducer.helperTextEmpty, 
    transactionError: state.transactionReducer.transactionError,
    transactionReceipt: state.transactionReducer.transactionReceipt,
    object: state.transactionReducer.object,
    transactionHash: state.transactionReducer.transactionHash,
    loadingGuard: state.guardReducer.loading,
    initVaultDatasFinish: state.createVaultReducer.initVaultDatasFinish,
    profilPicture: state.createVaultReducer.profilPicture,
    pictureToUpload: state.createVaultReducer.pictureToUpload
  });


class VaultCreation extends React.Component {

    //check if the action ask for a redirection or init the vault if the user is loaded
    componentDidMount() {
        //check the user access to this route and init his datas
        if (this.props.user) {
            this.urlParams = queryString.extract(this.props.location.search);
            this.route = window.location.pathname.split('/')[1];
            this.props.dispatch(hasAccess(this.route, this.urlParams, this.props.user, this.props.history));
            this.props.dispatch(initVaultCreation(this.props.user));
        }
    }

    render() {
        const { 
            user,
            step, 
            accessPrice, 
            firstName, 
            lastName, 
            title, 
            description, 
            mail, 
            phone, 
            vaultMaxAccessPrice, 
            accessPriceError, 
            maxAccessPricePlaceholder, 
            isAccessPriceSet, 
            firstNameError, 
            firstNameEmpty,
            lastNameError, 
            lastNameEmpty,
            titleError, 
            titleEmpty,
            phoneError, 
            mailError,
            helperTextTooLong,
            helperIncorrectMail,
            helperIncorrectPhoneNumber,
            helperTextEmpty,
            transactionError, 
            transactionReceipt,
            transactionHash,
            object,
            loadingGuard,
            initVaultDatasFinish,
            profilPicture,
            pictureToUpload
        } = this.props;

        //Loading user from parent AppConnected...
        if (!this.props.user || loadingGuard || !initVaultDatasFinish) {
            return (<Loading />)
        }

        let snackbar;
        if (transactionHash && !transactionReceipt) {
            snackbar = (<CustomizedSnackbars message={object + ' Transaction in progress...'} showSpinner={true} type='info'/>);
        } else if (transactionError) {
            snackbar = (<CustomizedSnackbars message={transactionError.message} showSpinner={false} type='error'/>);
        } else if (transactionReceipt) {
            snackbar = (<CustomizedSnackbars message='Transaction sucessfull !' showSpinner={false} type='success'/>);
        }

        let canSubmit = (!firstNameError && !firstNameEmpty && !lastNameError && !lastNameEmpty && !titleError && !titleEmpty && !mailError && !phoneError);

        //Header display if the price is set
        let stepHeader = (step === 0) ? 
        <span>{(this.props.user.freelancerDatas) ? 'Update access price' : 'Set access price'}</span> :
        <span> Price: {accessPrice > 1 ? accessPrice + ' tokens' : accessPrice + ' token'} </span>

        //Block for access price
        let accessPriceInputs = (step === 0) &&             
        <div className={this.props.classes.content}>
            <TextField
                autoFocus={true}
                required
                type="number"
                value={accessPrice}
                error={accessPriceError}
                helperText={maxAccessPricePlaceholder}
                onChange={(event) => this.props.dispatch(accessPriceChange(event.target.value, vaultMaxAccessPrice))}
                className={this.props.classes.specialWidth}
                label="Access Price (Talao Token)"
                id="accessPrice"
            />
            <div className={this.props.classes.wrapper}>
                <Button onClick={() => this.props.dispatch(setAccessPrice(accessPrice, this.props.user))} className={!accessPriceError ? this.props.classes.certificatButton : this.props.classes.certificatButtonDisabled} label="login">
                    Next
                </Button>
            </div>
        </div>

        //Bloc for vault form
        let vaultInputs = (step === 1) ?
        <div className={this.props.classes.content}>
            <Grid container spacing={40}>
                <form className={this.props.classes.container} noValidate autoComplete="off">
                    <Grid item lg={2} xs={12}>
                        <img src={(profilPicture) ? profilPicture : (this.props.user.freelancerDatas && this.props.user.freelancerDatas.pictureUrl) ? this.props.user.freelancerDatas.pictureUrl : defaultFreelancerPicture} 
                             onClick={() => this.props.dispatch(addImageClicked(this.fileInput))} 
                             className={this.props.classes.picture}
                             alt="Freelancer" />
                        <input onChange={(e) => this.props.dispatch(addProfilePicture(e.target))}
                               style={{ display: 'none' }} 
                               ref={fileInput => this.fileInput = fileInput} 
                               type="file" accept="image/*" />
                    </Grid>
                    <Grid item lg={3} xs={12}>
                        <TextField
                            required
                            type="text"
                            value={firstName}
                            error={firstNameError || firstNameEmpty}
                            helperText={(!firstNameError && !firstNameEmpty) ? '' : (firstNameError) ? helperTextTooLong : helperTextEmpty}
                            onChange={(event) => this.props.dispatch(setVaultInput('firstName', event.target.value))}
                            className={this.props.classes.textField}
                            label="First name"
                            id="firstName"
                        />
                    </Grid>
                    <Grid item lg={3} xs={12}>
                        <TextField
                            required
                            type="text"
                            value={lastName}
                            error={lastNameError || lastNameEmpty}
                            helperText={(!lastNameError && !lastNameEmpty) ? '' : (lastNameError) ? helperTextTooLong : helperTextEmpty}
                            onChange={(event) => this.props.dispatch(setVaultInput('lastName', event.target.value))}
                            className={this.props.classes.textField}
                            label="Last name"
                            id="lastName"
                        />
                    </Grid>
                    <Grid item lg={4}></Grid>
                    <Grid item lg={2}></Grid>
                    <Grid item lg={3} xs={12}>
                        <TextField
                            required
                            type="text"
                            value={title}
                            error={titleError || titleEmpty}
                            helperText={(!titleError && !titleEmpty) ? '' : (titleError) ? helperTextTooLong : helperTextEmpty}
                            onChange={(event) => this.props.dispatch(setVaultInput('title', event.target.value))}
                            className={this.props.classes.textField}
                            label="Title"
                            id="title"
                        />
                    </Grid>
                    <Grid item lg={7}></Grid>
                    <Grid item lg={2}></Grid>
                    <Grid item lg={8} xs={12}>
                        <TextField
                            type="text"
                            multiline
                            rows="4"
                            value={description}
                            onChange={(event) => this.props.dispatch(setVaultInput('description', event.target.value))}
                            className={this.props.classes.textField}
                            label="Description"
                            id="description"
                        />
                    </Grid>
                    <Grid item lg={2}></Grid>
                    <Grid item lg={2}></Grid>
                    <Grid item lg={3} xs={12}>
                        <TextField
                            required
                            type="email"
                            value={mail}
                            error={mailError}
                            helperText={!mailError ? '' : helperIncorrectMail}
                            onChange={(event) => this.props.dispatch(setVaultInput('mail', event.target.value))}
                            className={this.props.classes.textField}
                            label="Email"
                            id="email"
                        />
                    </Grid>
                    <Grid item lg={7}></Grid>
                    <Grid item lg={2}></Grid>
                    <Grid item lg={3} xs={12}>
                        <TextField
                            required
                            type="tel"
                            value={phone}
                            error={phoneError}
                            helperText={!phoneError ? '' : helperIncorrectPhoneNumber}
                            onChange={(event) => this.props.dispatch(setVaultInput('phone', event.target.value))}
                            className={this.props.classes.textField}
                            label="Phone number"
                            id="phoneNumber"
                        />
                    </Grid>
                    <Grid item lg={7}></Grid>
                    <Grid item lg={2} xs={12}>
                        <Button onClick={() => canSubmit && this.props.dispatch(submitVault(user, accessPrice, firstName, lastName, title, description, phone, mail, pictureToUpload))} disabled={!canSubmit} className={canSubmit ? this.props.classes.certificatButton : this.props.classes.certificatButtonDisabled} label="login">
                            {(this.props.user.freelancerDatas) ? 'Update' : 'Create'}
                        </Button>
                    </Grid>
                </form>
            </Grid>
        </div>
        : null
        return (
            <Card className={this.props.classes.card}>
                <CardContent>
                    {!this.props.user.freelancerDatas && 
                        <div>
                            <div onClick={() => this.props.dispatch(canSwitchStep(0, accessPrice, vaultMaxAccessPrice))} className={this.props.classes.indicator} style={{ backgroundColor: constants.colors["accent2"], color: constants.colors["textAccent2"] }}>
                                <span style={{ fontSize: '25px' }}>1</span>
                            </div>
                            <div className={this.props.classes.timeLine} >
                                <div className={this.props.classes.line} style={{ width: '25px' }}></div>
                                <div onClick={() => this.props.dispatch(canSwitchStep(0, accessPrice, vaultMaxAccessPrice))} className={this.props.classes.timeContainer}>
                                    {stepHeader}
                                </div>
                            </div>
                        </div>
                    }
                    <Collapse in={step === 0} timeout="auto">
                        {accessPriceInputs}
                    </Collapse>
                    <div>
                        <div onClick={() => this.props.dispatch(canSwitchStep(1, accessPrice, vaultMaxAccessPrice, accessPrice))} className={this.props.classes.indicator} style={{ backgroundColor: isAccessPriceSet ? constants.colors["accent2"] : constants.colors["grey"], color: constants.colors["textAccent2"] }}>
                            <span style={{ fontSize: '25px' }}>{this.props.user.freelancerDatas ? 1 : 2}</span>
                        </div>
                        <div className={this.props.classes.timeLine} >
                            <div className={this.props.classes.line} style={{ width: '25px' }}></div>
                            <div onClick={() => this.props.dispatch(canSwitchStep(1, accessPrice, vaultMaxAccessPrice, accessPrice))} className={this.props.classes.timeContainer}>
                                {(this.props.user.freelancerDatas) ? 'Update vault' : 'Create vault'}
                            </div>
                        </div>
                    </div>
                    <Collapse in={step === 1} timeout="auto">
                        {vaultInputs}
                    </Collapse>
                </CardContent>
                {snackbar}
            </Card>
        );
    }
}

export default compose(withStyles(styles), connect(mapStateToProps))(VaultCreation);