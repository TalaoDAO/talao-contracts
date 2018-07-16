import React from 'react';
import Card from '@material-ui/core/Card';
import { withStyles, CardContent } from '@material-ui/core';
import { TextField } from '@material-ui/core';
import Button from 'material-ui/Button';
import Grid from '@material-ui/core/Grid';
import { Link } from 'react-router-dom';

const styles = theme => ({
    certificatButton: {
        margin: '20px',
        backgroundColor: '#3b3838',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#3b3838'
        }
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

class Homepage extends React.Component {
    constructor() {
        super();
        this.state = {
            freelancerAddress: '',
            errorText: '',
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.vaultFactoryContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_VAULTFACTORY_ABI),
            process.env.REACT_APP_VAULTFACTORY_ADDRESS
        );
    }

    handleSubmit = event => {
        if (!window.web3.utils.isAddress(this.state.freelancerAddress)) {
            this.setState({ errorText: 'This is not a valid ethereum address', });
            return;
        }
        this.vaultFactoryContract.methods.FreelanceVault(this.state.freelancerAddress).call().then(vaultAddress => {
            if (vaultAddress !== '0x0000000000000000000000000000000000000000') {
                this.props.history.push({
                    pathname: '/chronology',
                    search: this.state.freelancerAddress,
                    state: { address: this.state.freelancerAddress }
                });
            }
            else {
                this.setState({ errorText: 'This address is not associated to a freelancer account or doesn\'t exist', });
            }
        });
    }

    isError() {
        return (this.state.errorText.length !== 0);
    }

    handleAddressChanged = event => {
        this.setState({ freelancerAddress: event.target.value });
    }

    render() {
        return (
            <Grid container className={this.props.classes.container}>
                <Grid item xs={12} lg={6}>
                    <Card className={this.props.classes.card}>
                        <CardContent>
                            <div className={this.props.classes.center}>
                                <p className={this.props.classes.title}>Looking for a freelancer?<br />Type his address here:</p>
                            </div>
                            <form onSubmit={this.handleSubmit}>
                                <TextField
                                    error={this.isError()}
                                    helperText={this.state.errorText}
                                    value={this.state.freelancerAddress}
                                    onChange={this.handleAddressChanged}
                                    className={this.props.classes.textField}
                                    inputProps={{
                                        style: { textAlign: "center" }
                                    }}
                                />
                                <div className={this.props.classes.center}>
                                    <Button onClick={() => this.handleSubmit()} className={this.props.classes.certificatButton} label="login">
                                        Find my freelancer
                                </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Card className={this.props.classes.card}>
                        <CardContent>
                            <div className={this.props.classes.center}>
                                <p className={this.props.classes.title}>You are a freelancer?<br />Create your vault right now!</p>
                            </div>
                            <div className={this.props.classes.center}>
                                <Button onClick={this.submit} className={this.props.classes.certificatButton} label="login">
                                    <Link style={{ textDecoration: 'none', color: '#fff' }} to="/register">Create my vault</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(Homepage);