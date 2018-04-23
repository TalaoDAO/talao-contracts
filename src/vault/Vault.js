import React from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/button/Button';
import faPlus from '@fortawesome/fontawesome-free-solid/faPlus';
import faFolder from '@fortawesome/fontawesome-free-solid/faFolder';
import faCheck from '@fortawesome/fontawesome-free-solid/faCheck';
import './Vault.css';

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
            vaultContract: null,
            canCreateVault: false,
            documents: [],
            view: 'vault',
        }

        this.createFreelanceVault = this.createFreelanceVault.bind(this);
        this.addDocument = this.addDocument.bind(this);
        this.goToAddDocument = this.goToAddDocument.bind(this);
        this.goToVault = this.goToVault.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.state.vaultFactoryContract.methods.FreelanceVault(this.context.web3.selectedAccount).call().then(vaultAdress => {
            if (vaultAdress !== '0x0000000000000000000000000000000000000000') {

                this.createVaultCont(vaultAdress);

            } else {
                this.setState({
                    canCreateVault: true
                })
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
                this.setState({ createVaultButton: false });
            })
            .on('receipt', receipt => {
                alert(receipt);
            })
            .on('error', (error) => { alert(error) });
    }

    addDocument() {
        //send document to ipfs
        alert(this.props.keywords);

        //add value on this call
        var docId = window.web3.utils.fromAscii('doc1');
        var description = window.web3.utils.fromAscii('ceci est ma dscription');
        var keyword = window.web3.utils.fromAscii('Solidity');

        this.state.vaultContract.methods.addDocument(docId, description, keyword).send(
            {
                from: this.context.web3.selectedAccount,
                gas: 4700000,
                gasPrice: 100000000000
            })
            .on('transactionHash', hash => {
                alert(hash);
                this.setState({ createVaultButton: false });
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

    addKeywords() {
        this.state.vaultContract.methods.addKeyword().send(
            {
                from: this.context.web3.selectedAccount,
                gas: 4700000,
                gasPrice: 100000000000
            })
            .on('transactionHash', hash => {
                alert(hash);
                this.setState({ createVaultButton: false });
            })
            .on('error', (error) => { alert(error) });
    }

    goToAddDocument() {
        this.setState({ view: 'add-document' });
    }

    goToVault() {
        this.setState({ view: 'vault' });
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    render() {
        return (
            <div>
                <div className="vault" style={this.state.view === 'vault' ? {} : { display: 'none' }}>
                    <h1>My account</h1>
                    <p>Talent Etherum Address: {this.context.web3.selectedAccount}</p>
                    <p><img className="flash-code" /></p>
                    <div className="box blue m20">
                        <p className="big">
                            <span style={this.state.canCreateVault ? {} : { display: 'none' }}>
                                To start, you must create a vault<br />
                                <Button value="Create Your Vault" icon={faFolder} onClick={this.createFreelanceVault} />
                            </span>
                            <span style={this.state.canCreateVault ? { display: 'none' } : {}}>
                                To continue, we need to verify your identify: <br />
                                please upload your ID card, passport or driver license<br />
                                <Button value="Add your ID document" icon={faPlus} onClick={this.goToAddDocument} />
                            </span>
                            <span style={this.state.documents.length === 0 ? { display: 'none' } : {}}>
                                documents!
                                </span>
                        </p>
                    </div>
                </div>

                <div className="add-document" style={this.state.view === 'add-document' ? {} : { display: 'none' }}>
                    <h1>Add reference</h1>
                    <p>Add a reference to your vault</p>
                    <div className="box yellow m20">
                        <form onSubmit={this.props.onSubmit}>
                            <div>
                                <label htmlFor="description">Description</label>
                            </div>
                            <div>
                                <textarea id="description" name="description" value={this.props.description} onChange={this.props.onChange} />
                            </div>
                            <div>
                                <label htmlFor="keywords">Keywords</label>
                            </div>
                            <div>
                                <textarea id="keywords" name="keywords" value={this.props.keywords} onChange={this.props.onChange} />
                            </div>
                            <div>
                                <label htmlFor="uploadedDocument">Upload your references certification</label>
                            </div>
                            <div>
                                <input type="file" id="uploadedDocument" name="uploadedDocument" value={this.props.uploadedDocument} />
                            </div>
                            <div>
                                <Button value="Cancel" icon={faCheck} onClick={this.goToVault} />
                                <Button value="Validate" icon={faCheck} onClick={this.addDocument} />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

Vault.contextTypes = {
    web3: PropTypes.object
}

export default Vault;