import React from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/button/Button';
import faBan from '@fortawesome/fontawesome-free-solid/faBan';
import './Vault.css';

class Vault extends React.Component {

    //connexion to 
    constructor(props) {
        super(props);
        //const contract
        const vaultFactoryCont = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_VAULTFACTORY_ABI),
            process.env.REACT_APP_VAULTFACTORY_ADDRESS
        );

        this.state = {
            vaultFactoryContract: vaultFactoryCont,
            vaultContract: null,
            canCreateVault: false,
            documents: [],
        }

        //this.setState({vaultFactoryContract:vaultFactoryCont});

        this.createFreelanceVault = this.createFreelanceVault.bind(this);
        this.addDocument = this.addDocument.bind(this);
    }

    componentDidMount() {
        this.state.vaultFactoryContract.methods.FreelanceVault(this.context.web3.selectedAccount).call().then(vaultAdress => {
            if (vaultAdress != '0x0000000000000000000000000000000000000000') {

                const vaultContract = new window.web3.eth.Contract(
                    JSON.parse(process.env.REACT_APP_VAULT_ABI),
                    this.state.vaultAddress
                );

                this.setState({
                    vaultContract: vaultContract
                });


            } else {
                this.setState({
                    canCreateVault: true
                })
            }
        })
    }

    createFreelanceVault() {
        this.state.vaultFactoryContract.methods.CreateVaultContract().send(
            {
                from: this.context.web3.selectedAccount,
                gas: 4700000,
                gasPrice: 100000000000
            })
            .on('transactionHash', hash => {
                alert(hash);
                this.setState({ canCreateVault: false });
            })
            .on('error', (error) => { alert(error) });
    }

    addDocument() {
        //add value on this call
        this.state.vaultContract.methods.addDocument().send(
            {
                from: this.context.web3.selectedAccount,
                gas: 4700000,
                gasPrice: 100000000000
            })
            .on('transactionHash', hash => {
                alert(hash);
                this.setState({ canCreateVault: false });
            })
            .on('error', (error) => { alert(error) });
    }

    removeDocument() {
        this.state.vaultContract.methods.removeDocument().send(
            {
                from: this.context.web3.selectedAccount,
                gas: 4700000,
                gasPrice: 100000000000
            })
            .on('transactionHash', hash => {
                alert(hash);
                this.setState({ canCreateVault: false });
            })
            .on('error', (error) => { alert(error) });
    }



    render() {
        return (
            <div className="vault">
                <h1>My account</h1>
                <p>Talent Etherum Address: {this.context.web3.selectedAccount}</p>
                <p><img className="flash-code" /></p>
                <div className="box blue m20">
                    <p className="big">
                        <span style={this.state.canCreateVault ? {} : { display: 'none' }}>
                            <Button value="Create Your Vault" icon={faBan} onClick={this.createFreelanceVault} />
                        </span>
                        <span style={this.state.canCreateVault ? { display: 'none' } : {}}>
                            <Button value="Add file to vault" icon={faBan} onClick={this.addDocument} />
                        </span>
                    </p>
                </div>
            </div>
        )
    }
}

Vault.contextTypes = {
    web3: PropTypes.object
}

export default Vault;