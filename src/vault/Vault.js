import React from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/button/Button';
import faBan from '@fortawesome/fontawesome-free-solid/faBan';

class Vault extends React.Component {

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

        this.createFreelanceVault = this.createFreelanceVault.bind(this);
        this.addDocument = this.addDocument.bind(this);
    }

    componentDidMount() {
        this.state.vaultFactoryContract.methods.FreelanceVault(this.context.web3.selectedAccount).call().then(vaultAdress => {
            if(vaultAdress!=='0x0000000000000000000000000000000000000000') {
 
                this.createVaultCont(vaultAdress);

            } else {this.setState({
                createVaultButton:false})
            }
        })  
    }

    createVaultCont(vaultAdress) {
        const vaultContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_VAULT_ABI),
            vaultAdress
        );

        this.setState({
            vaultContract: vaultContract
        });

        //subscribe to event wich 
        this.state.vaultContract.events.VaultLog((error, event) => {
            alert(event);
            this.state.documents.push(event);
        });
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
        .on('receipt', receipt => {
            alert(receipt);
        })
        .on('error', (error) => { alert(error) });
    }
    
    addDocument() {
        //send document to ipfs

        //add value on this call
        var docId = window.web3.utils.fromAscii('doc1');
        var description = window.web3.utils.fromAscii('ceci est ma dscription');
        var keyword = window.web3.utils.fromAscii('Solidity');

        this.state.vaultContract.methods.addDocument(docId,description,keyword).send(
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

    addKeywords() {
        this.state.vaultContract.methods.addKeyword().send(
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