import React from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/button/Button';
import faPlus from '@fortawesome/fontawesome-free-solid/faPlus';
import faFolder from '@fortawesome/fontawesome-free-solid/faFolder';
import faCheck from '@fortawesome/fontawesome-free-solid/faCheck';
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
            view: 'vault',
        }

        //this.setState({vaultFactoryContract:vaultFactoryCont});

        this.createFreelanceVault = this.createFreelanceVault.bind(this);
        this.addDocument = this.addDocument.bind(this);
        this.goToAddDocument = this.goToAddDocument.bind(this);
        this.goToVault = this.goToVault.bind(this);
    }

    componentDidMount() {
        this.state.vaultFactoryContract.methods.FreelanceVault(this.context.web3.selectedAccount).call().then(vaultAdress => {
            if (vaultAdress !== '0x0000000000000000000000000000000000000000') {

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
                this.setState({ canCreateVault: false, view: 'vault' });
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

    goToAddDocument() {
        this.setState({ view: 'add-document' });
    }

    goToVault() {
        this.setState({ view: 'vault' });
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
                        <div>
                            <label htmlFor="description">Description</label>
                        </div>
                        <div>
                            <textarea id="description" />
                        </div>
                        <div>
                            <label htmlFor="keywords">Keywords</label>
                        </div>
                        <div>
                            <textarea id="keywords" />
                        </div>
                        <div>
                            <label htmlFor="document">Upload your references certification</label>
                        </div>
                        <div>
                            <input type="file" id="document" />
                        </div>
                        <div>
                            <Button value="Cancel" icon={faCheck} onClick={this.goToVault} />
                            <Button value="Validate" icon={faCheck} onClick={this.addDocument} />
                        </div>
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