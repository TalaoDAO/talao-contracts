import React from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/button/Button';
import faBan from '@fortawesome/fontawesome-free-solid/faBan';

class Vault extends React.Component {

    state = {
        vaultFactoryContract: null,
        vaultContract : null,
        createVaultButton: true,
        documents: [],
    }

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
            vaultContract : null,
            createVaultButton: true,
            documents: [],
        }

        //this.setState({vaultFactoryContract:vaultFactoryCont});

        this.createFreelanceVault = this.createFreelanceVault.bind(this);
        this.addDocument = this.addDocument.bind(this);
    }

    componentDidMount() {
        this.state.vaultFactoryContract.methods.FreelanceVault(this.context.web3.selectedAccount).call().then(vaultAdress => {
            if(vaultAdress!=null) {
 
                const vaultContract = new window.web3.eth.Contract(
                    JSON.parse(process.env.REACT_APP_VAULT_ABI),
                    this.state.vaultAddress
                );

                this.setState({
                    vaultContract: vaultContract
                });


            } else {this.setState({
                createVaultButton:false})
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
            this.setState({createVaultButton:false});
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
            this.setState({createVaultButton:false});
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
            this.setState({createVaultButton:false});
        })
        .on('error', (error) => { alert(error) });
    }

    

    render() {
        return (
            <div>
                <h1>My account</h1>
                <p>Talent Etherum Address: {this.context.web3.selectedAccount}</p>
                <div className="box blue">
                    <p className="big">
                        <Button className={this.state.createVaultButton ? 'hidden' : ''} value="Create Your Vault" icon={faBan} onClick={this.createFreelanceVault} />
                        <Button value="Add file to vault" icon={faBan} onClick={this.addDocument} />
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