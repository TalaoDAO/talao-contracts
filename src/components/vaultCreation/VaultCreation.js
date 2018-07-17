import React from 'react';
import FreelancerService from '../../services/FreelancerService';
import Card from '@material-ui/core/Card';
import { withStyles, CardContent } from '@material-ui/core';
import { TextField, Grid } from '@material-ui/core';
import Button from 'material-ui/Button';
import { constants } from '../../constants';
import Collapse from '@material-ui/core/Collapse';
import defaultFreelancerPicture from '../../images/freelancer-picture.jpg';
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
});

class VaultCreation extends React.Component {

    constructor() {
        super();
        this.free = FreelancerService.getFreelancer();

        this.state = {
            waiting: false,
            isAccessPriceSet: false,
            step: 0,
            accessPrice: '',
            firstName: '',
            lastName: '',
            title: '',
            description: '',
            mail: '',
            phone: '',
            tokenSymbol: '',
            vaultDeposit: 0,

            helperAccessPriceNotValid: '',
            helperTextTooLong: 'Maximum length: 30 characters',
            helperIncorrectMail: 'This is not a valid email address',
            helperIncorrectPhoneNumber: 'This is not a valid phone number',
        };

        this.nextStep = this.nextStep.bind(this);
        this.submit = this.submit.bind(this);

        this.tokenContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_TALAOTOKEN_ABI),
            process.env.REACT_APP_TALAOTOKEN_ADDRESS
        );

        this.freelancerContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_FREELANCER_ABI),
            process.env.REACT_APP_FREELANCER_ADDRESS
        );

        this.vaultFactoryContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_VAULTFACTORY_ABI),
            process.env.REACT_APP_VAULTFACTORY_ADDRESS
        );
    }

    componentDidMount() {
        // Get token symbol.
        this.tokenContract.methods.symbol().call((err, symbol) => {
            if (err) console.error(err);
            else {
                this.setState({
                    tokenSymbol: symbol
                });
            }
        });

        // Get vault deposit.
        this.tokenContract.methods.vaultDeposit().call((err, vaultDepositWei) => {
            if (err) console.error(err);
            else {
                let vaultDeposit = window.web3.utils.fromWei(vaultDepositWei);
                this.setState({
                    vaultDeposit: vaultDeposit
                });
                this.setState({ helperAccessPriceNotValid: "your price should be between 0 (free) and " + this.state.vaultDeposit.toString() });
            }
        });
    }

    componentWillUnmount() {
        this.isCancelled = true;
    }

    handleEvents = () => {
        this.forceUpdate();
    };

    handleAccessPriceChange = event => {
        this.setState({ accessPrice: event.target.value });
    }

    handleFirstNameChange = event => {
        this.setState({ firstName: event.target.value });
    }

    handleLastNameChange = event => {
        this.setState({ lastName: event.target.value });
    }

    handleTitleChange = event => {
        this.setState({ title: event.target.value });
    }

    handleDescriptionChange = event => {
        this.setState({ description: event.target.value });
    }

    handleMailChange = event => {
        this.setState({ mail: event.target.value });
    }

    handlePhoneChange = event => {
        this.setState({ phone: event.target.value });
    }

    goToStep(number) {
        if (this.state.step === 0 && (!this.isAccessPriceCorrect() || !this.state.isAccessPriceSet)) return;
        this.setState({
            step: number,
        })
    }

    nextStep() {
        if (this.state.step === 0 && !this.isAccessPriceCorrect()) return;

        let tokens_wei = window.web3.utils.toWei(this.state.accessPrice);
        this.tokenContract.methods.createVaultAccess(tokens_wei).send(
            { from: window.account }
        ).on('error', console.error).then(() => {
            this.setState({ isAccessPriceSet: true })
            this.setState({
                step: this.state.step + 1,
            });
        });
    }

    isAccessPriceCorrect() {
        return (
            this.state.accessPrice >= 0
            && this.state.accessPrice <= 10
            && this.state.accessPrice % 1 === 0
            && this.state.accessPrice !== ''
        );
    }

    isTextLimitRespected(text) {
        return text.length < 30;
    }

    isValidMail(mail) {
        var mailRegex = /^(([^<>()[\].,;:\s@"]+(.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+.)+[^<>()[\].,;:\s@"]{2,})$/i;
        return mail.match(mailRegex);
    }

    isValidPhoneNumber(phoneNumber) {
        var phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
        return phoneNumber.match(phoneRegex);
    }

    canSubmit() {
        return (
            this.isValidPhoneNumber(this.state.phone) &&
            this.isValidMail(this.state.mail) &&
            this.isTextLimitRespected(this.state.firstName) &&
            this.isTextLimitRespected(this.state.lastName) &&
            this.isTextLimitRespected(this.state.title) &&
            this.state.firstName.length > 0 &&
            this.state.lastName.length > 0 &&
            this.state.title.length > 0
        );
    }

    submit() {
        if(!this.canSubmit()) return;
        this.setState({ waiting: true });
        //uint256 _price, bytes32 _firstname, bytes32 _lastname, bytes32 _phone, bytes32 _email, bytes32 _title, string _description
        let price = this.state.accessPrice;
        let firstName = window.web3.utils.fromAscii(this.state.firstName);
        let lastname = window.web3.utils.fromAscii(this.state.lastName);
        let phone = window.web3.utils.fromAscii(this.state.phone);
        let email = window.web3.utils.fromAscii(this.state.mail);
        let title = window.web3.utils.fromAscii(this.state.title);
        let desc = this.state.description
        this.vaultFactoryContract.methods.CreateVaultContract(price, firstName, lastname, phone, email, title, desc).send(
            {
                from: window.account
            })
            .on('error', error => {
                alert("An error has occured when creating your vault (ERR: " + error + ")");
                this.setState({ waiting: false });
                return;
            }).then(result => {
                this.free.initFreelancer(window.account);
                this.setState({ waiting: false });
                this.props.history.push('/chronology');
            });
    }


    render() {
        if (this.state.waiting) return (<Loading />);
        return (
            <Card className={this.props.classes.card}>
                <CardContent>
                    <div>
                        <div onClick={() => this.goToStep(0)} className={this.props.classes.indicator} style={{ backgroundColor: constants.colors["accent2"], color: constants.colors["textAccent2"] }}>
                            <span style={{ fontSize: '25px' }}>1</span>
                        </div>
                        <div className={this.props.classes.timeLine} >
                            <div className={this.props.classes.line} style={{ width: '25px' }}></div>
                            <div onClick={() => this.goToStep(0)} className={this.props.classes.timeContainer}>
                                Set access price <span style={{ display: this.state.step > 0 ? 'inline' : 'none' }} > ({this.state.accessPrice} Talao Token) </span>
                            </div>
                        </div>
                    </div>
                    <Collapse in={this.state.step === 0} timeout="auto">
                        <div style={{ display: this.state.step === 0 ? 'inline-block' : 'none' }} className={this.props.classes.content}>
                            <TextField
                                autoFocus={true}
                                required
                                type="number"
                                value={this.state.accessPrice}
                                error={!this.isAccessPriceCorrect()}
                                helperText={this.state.helperAccessPriceNotValid}
                                onChange={this.handleAccessPriceChange.bind(this)}
                                className={this.props.classes.textField}
                                label="Access Price (in Talao Token)"
                                id="accessPrice"
                            />
                            <Button onClick={this.nextStep} className={this.isAccessPriceCorrect() ? this.props.classes.certificatButton : this.props.classes.certificatButtonDisabled} label="login">
                                Next
                            </Button>
                        </div>
                    </Collapse>
                    <div>
                        <div onClick={() => this.goToStep(1)} className={this.props.classes.indicator} style={{ backgroundColor: this.state.isAccessPriceSet ? constants.colors["accent2"] : constants.colors["grey"], color: constants.colors["textAccent2"] }}>
                            <span style={{ fontSize: '25px' }}>2</span>
                        </div>
                        <div className={this.props.classes.timeLine} >
                            <div className={this.props.classes.line} style={{ width: '25px' }}></div>
                            <div onClick={() => this.goToStep(1)} className={this.props.classes.timeContainer}>
                                Create Vault
                            </div>
                        </div>
                    </div>
                    <Collapse in={this.state.step === 1} timeout="auto">
                        <div style={{ display: this.state.step === 1 ? 'inline-block' : 'none' }} className={this.props.classes.content}>
                            <Grid container spacing={40}>
                                <form className={this.props.classes.container} noValidate autoComplete="off">
                                    <Grid item lg={2}>
                                        <img src={defaultFreelancerPicture} className={this.props.classes.picture} alt="Freelancer" />
                                    </Grid>
                                    <Grid item lg={3}>
                                        <TextField
                                            required
                                            type="text"
                                            value={this.state.firstName}
                                            error={!this.isTextLimitRespected(this.state.firstName)}
                                            helperText={this.isTextLimitRespected(this.state.firstName) ? '' : this.state.helperTextTooLong}
                                            onChange={this.handleFirstNameChange}
                                            className={this.props.classes.textField}
                                            label="First name"
                                            id="firstName"
                                        />
                                    </Grid>
                                    <Grid item lg={3}>
                                        <TextField
                                            required
                                            type="text"
                                            value={this.state.lastName}
                                            error={!this.isTextLimitRespected(this.state.lastName)}
                                            helperText={this.isTextLimitRespected(this.state.lastName) ? '' : this.state.helperTextTooLong}
                                            onChange={this.handleLastNameChange}
                                            className={this.props.classes.textField}
                                            label="Last name"
                                            id="lastName"
                                        />
                                    </Grid>
                                    <Grid item lg={4}></Grid>
                                    <Grid item lg={2}></Grid>
                                    <Grid item lg={3}>
                                        <TextField
                                            required
                                            type="text"
                                            value={this.state.title}
                                            error={!this.isTextLimitRespected(this.state.title)}
                                            helperText={this.isTextLimitRespected(this.state.title) ? '' : this.state.helperTextTooLong}
                                            onChange={this.handleTitleChange}
                                            className={this.props.classes.textField}
                                            label="Title"
                                            id="title"
                                        />
                                    </Grid>
                                    <Grid item lg={7}></Grid>
                                    <Grid item lg={2}></Grid>
                                    <Grid item lg={8}>
                                        <TextField
                                            type="text"
                                            multiline
                                            rows="4"
                                            value={this.state.description}
                                            onChange={this.handleDescriptionChange}
                                            className={this.props.classes.textField}
                                            label="Description"
                                            id="description"
                                        />
                                    </Grid>
                                    <Grid item lg={2}></Grid>
                                    <Grid item lg={2}></Grid>
                                    <Grid item lg={3}>
                                        <TextField
                                            required
                                            type="email"
                                            value={this.state.mail}
                                            error={!this.isValidMail(this.state.mail)}
                                            helperText={this.isValidMail(this.state.mail) ? '' : this.state.helperIncorrectMail}
                                            onChange={this.handleMailChange}
                                            className={this.props.classes.textField}
                                            label="Email"
                                            id="email"
                                        />
                                    </Grid>
                                    <Grid item lg={7}></Grid>
                                    <Grid item lg={2}></Grid>
                                    <Grid item lg={3}>
                                        <TextField
                                            required
                                            type="tel"
                                            value={this.state.phone}
                                            error={!this.isValidPhoneNumber(this.state.phone)}
                                            helperText={this.isValidPhoneNumber(this.state.phone) ? '' : this.state.helperIncorrectPhoneNumber}
                                            onChange={this.handlePhoneChange}
                                            className={this.props.classes.textField}
                                            label="Phone number"
                                            id="phoneNumber"
                                        />
                                    </Grid>
                                    <Grid item lg={7}></Grid>
                                    <Grid item lg={2}>
                                        <Button onClick={this.submit} className={this.canSubmit() ? this.props.classes.certificatButton : this.props.classes.certificatButtonDisabled} label="login">
                                            Create
                                        </Button>
                                    </Grid>
                                </form>
                            </Grid>
                        </div>
                    </Collapse>
                </CardContent>
            </Card>
        );
    }
}

export default withStyles(styles)(VaultCreation);