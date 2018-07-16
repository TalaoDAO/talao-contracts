import React from 'react';
import FreelancerService from '../../services/FreelancerService';
import Card from '@material-ui/core/Card';
import { withStyles, CardContent, MuiThemeProvider, createMuiTheme } from '@material-ui/core';
import { TextField, Grid, FormControl, Input, InputLabel } from '@material-ui/core';
import Button from 'material-ui/Button';
import { constants } from '../../constants';
import Collapse from '@material-ui/core/Collapse';
import defaultFreelancerPicture from '../../images/freelancer-picture.jpg';

const theme = createMuiTheme({
    palette: {
        primary: constants.theme.palette.accent3,
    },
});

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
            step: 0,
            accessPrice: '',
            firstName: '',
            lastName: '',
            title: '',
            description: '',
            mail: '',
            phone: '',
            tokenSymbol:'',
            vaultDeposit:0,
            helper:''
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
        // this.free.addListener('ExperienceChanged', this.handleEvents, this);
        // this.free.addListener('FreeDataChanged', this.handleEvents, this);

        // Get token symbol.
        this.tokenContract.methods.symbol().call( (err, symbol) => {
        if (err) console.error (err);
        else {
          this.setState({
            tokenSymbol: symbol
          });
        }
      });

      // Get vault deposit.
      this.tokenContract.methods.vaultDeposit().call( (err, vaultDepositWei) => {
        if (err) console.error (err);
        else {
            let vaultDeposit = window.web3.utils.fromWei(vaultDepositWei);
            this.setState({
                vaultDeposit: vaultDeposit
            });

            this.setState({helper : "your price should be between 0 (free) and "  + this.state.vaultDeposit.toString() });
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
        if (this.state.step === 0 && !this.isAccessPriceCorrect()) return;
        this.setState({
            step: number,
        })
    }

    nextStep() {
        if (this.state.step === 0 && !this.isAccessPriceCorrect()) return;
        this.setState({
            step: this.state.step + 1,
        });

        let tokens_wei = window.web3.utils.toWei(this.state.accessPrice);
        this.tokenContract.methods.createVaultAccess(tokens_wei).send(
            {from: window.account}
        ).on('error', console.error);
    }

    isAccessPriceCorrect() {
        return (
            this.state.accessPrice >= 0
            && this.state.accessPrice <= 10
            && this.state.accessPrice % 1 === 0
            && this.state.accessPrice !== ''
        );
    }

    submit() {
        //TODO create Vault
        this.setState({ waiting: true });
        //uint256 _price, bytes32 _firstname, bytes32 _lastname, bytes32 _phone, bytes32 _email, bytes32 _title, string _description
        let price = this.state.accessPrice;
        let firstName = window.web3.utils.fromAscii(this.state.firstName);
        let lastname = window.web3.utils.fromAscii(this.state.lastName);
        let phone = window.web3.utils.fromAscii(this.state.phone);
        let email = window.web3.utils.fromAscii(this.state.mail);
        let title = window.web3.utils.fromAscii(this.state.title);
        let desc = this.state.description
        this.vaultFactoryContract.methods.CreateVaultContract(price,firstName,lastname,phone,email, title,desc).send(
        {
            from: window.account
        })
        .on('error', error => {
            alert("An error has occured when creating your vault (ERR: " + error + ")");
            this.setState({ waiting: false });
            return;
        }).then(result => {
            this.setState({ waiting: false });
            console.log(result);
        });
    }


    render() {
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
                            <MuiThemeProvider theme={theme}>
                                <TextField
                                    autoFocus="true"
                                    required
                                    type="number"
                                    value={this.state.accessPrice}
                                    error={!this.isAccessPriceCorrect()}
                                    helperText={this.state.helper}
                                    onChange={this.handleAccessPriceChange.bind(this)}
                                    className={this.props.classes.textField}
                                    label="Access Price (in Talao Token)"
                                    id="accessPrice"
                                />
                            </MuiThemeProvider>
                            <Button onClick={this.nextStep} className={this.isAccessPriceCorrect() ? this.props.classes.certificatButton : this.props.classes.certificatButtonDisabled} label="login">
                                Next
                            </Button>
                        </div>
                    </Collapse>
                    <div>
                        <div onClick={() => this.goToStep(1)} className={this.props.classes.indicator} style={{ backgroundColor: this.isAccessPriceCorrect() ? constants.colors["accent2"] : constants.colors["grey"], color: constants.colors["textAccent2"] }}>
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
                                    <Grid item xs={2}>
                                        <img src={defaultFreelancerPicture} className={this.props.classes.picture} alt="Freelancer" />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <FormControl className={this.props.classes.textField}>
                                            <InputLabel
                                                required
                                                FormLabelClasses={{
                                                    root: this.props.classes.cssLabel,
                                                    focused: this.props.classes.cssFocused,
                                                }} htmlFor="custom-css-input">First name</InputLabel>
                                            <Input value={this.state.firstName} onChange={this.handleFirstNameChange} classes={{ underline: this.props.classes.cssUnderline, }} id="custom-css-input" />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <FormControl className={this.props.classes.textField}>
                                            <InputLabel
                                                required
                                                FormLabelClasses={{
                                                    root: this.props.classes.cssLabel,
                                                    focused: this.props.classes.cssFocused,
                                                }} htmlFor="custom-css-input">Last name</InputLabel>
                                            <Input value={this.state.lastName} onChange={this.handleLastNameChange} classes={{ underline: this.props.classes.cssUnderline, }} id="custom-css-input" />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={4}></Grid>
                                    <Grid item xs={2}></Grid>
                                    <Grid item xs={3}>
                                        <FormControl className={this.props.classes.textField}>
                                            <InputLabel
                                                required
                                                FormLabelClasses={{
                                                    root: this.props.classes.cssLabel,
                                                    focused: this.props.classes.cssFocused,
                                                }} htmlFor="custom-css-input">Title</InputLabel>
                                            <Input value={this.state.title} onChange={this.handleTitleChange} classes={{ underline: this.props.classes.cssUnderline, }} id="custom-css-input" />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={7}></Grid>
                                    <Grid item xs={2}></Grid>
                                    <Grid item xs={8}>
                                        <FormControl className={this.props.classes.textField}>
                                            <InputLabel
                                                FormLabelClasses={{
                                                    root: this.props.classes.cssLabel,
                                                    focused: this.props.classes.cssFocused,
                                                }} htmlFor="custom-css-input">Description</InputLabel>
                                            <Input value={this.state.description} onChange={this.handleDescriptionChange} multiline rows="4" classes={{ underline: this.props.classes.cssUnderline, }} id="custom-css-input" />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={2}></Grid>
                                    <Grid item xs={2}></Grid>
                                    <Grid item xs={3}>
                                        <FormControl className={this.props.classes.textField}>
                                            <InputLabel
                                                required
                                                FormLabelClasses={{
                                                    root: this.props.classes.cssLabel,
                                                    focused: this.props.classes.cssFocused,
                                                }} htmlFor="custom-css-input">Email</InputLabel>
                                            <Input value={this.state.mail} onChange={this.handleMailChange} classes={{ underline: this.props.classes.cssUnderline, }} id="custom-css-input" />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={7}></Grid>
                                    <Grid item xs={2}></Grid>
                                    <Grid item xs={3}>
                                        <FormControl className={this.props.classes.textField}>
                                            <InputLabel
                                                required
                                                FormLabelClasses={{
                                                    root: this.props.classes.cssLabel,
                                                    focused: this.props.classes.cssFocused,
                                                }} htmlFor="custom-css-input">Phone number</InputLabel>
                                            <Input value={this.state.phone} onChange={this.handlePhoneChange} classes={{ underline: this.props.classes.cssUnderline, }} id="custom-css-input" />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={7}></Grid>
                                    <Grid item xs={2}>
                                        <Button onClick={this.submit} className={this.props.classes.certificatButton} label="login">
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