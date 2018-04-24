import React from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/button/Button';
import Table from '../ui/table/Table';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faPlus from '@fortawesome/fontawesome-free-solid/faPlus';
import faFolder from '@fortawesome/fontawesome-free-solid/faFolder';
import faCheck from '@fortawesome/fontawesome-free-solid/faCheck';
import faTrash from '@fortawesome/fontawesome-free-solid/faTrash';
import './Vault.css';
import IpfsApi from 'ipfs-api';
import buffer from 'buffer';

class Vault extends React.Component {

    constructor(props) {
        super(props);

        // const contract
        const vaultFactoryCont = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_VAULTFACTORY_ABI),
            process.env.REACT_APP_VAULTFACTORY_ADDRESS
        );

        this.state = {
            vaultFactoryContract: vaultFactoryCont,
            vaultContract: null,
            canCreateVault: false,
            documents: [{
                description: 'test',
                keywords: 'key words',
                address: '300a36aa-76d8-2435-efa6-f99d181792a3'
            }],
            view: 'vault',
            description: '',
            keywords: '',
            uploadedDocument: null,
        }

        //this.ipfsApi = IpfsApi('localhost', 5001, {protocol: 'http'});

        this.createFreelanceVault = this.createFreelanceVault.bind(this);
        this.addDocument = this.addDocument.bind(this);
        this.goToAddDocument = this.goToAddDocument.bind(this);
        this.goToVault = this.goToVault.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.removeDocument = this.removeDocument.bind(this);
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
            // .on('transactionHash', hash => {
            //     alert("Your vault has been created (TX: " + hash + ")");
            //     this.setState({ createVaultButton: false });
            // })
            .on('receipt', receipt => {
                alert("Your vault has been created (TX: " + receipt.transactionHash + ")");
                // alert(receipt);
            })
            .on('error', (error) => {
                alert("An error has occured when creating your vault (ERR: " + error + ")");
            });
    }

    addDocument() {

        //send document to ipfs
        this.uploadToIpfs(null).then(result => {

            //add value on this call
            var docId = window.web3.utils.fromAscii(result);
            var description = window.web3.utils.fromAscii(this.state.description);
            var keywords = window.web3.utils.fromAscii(this.state.keywords);

            this.state.vaultContract.methods.addDocument(docId, description, keywords).send(
                {
                    from: this.context.web3.selectedAccount,
                    gas: 4700000,
                    gasPrice: 100000000000
                })
                // .on('transactionHash', hash => {
                //     alert("Your document has been downloaded (TX: " + hash + ")");
                //     this.setState({ createVaultButton: false });
                // })
                .on('receipt', receipt => {
                    alert("Your document has been downloaded (TX: " + receipt.transactionHash + ")");
                    this.setState({ createVaultButton: false });
                })
                .on('error', (error) => {
                    alert("An error has occured when storing your document (ERR: " + error + ")");
                });
        },
            err => alert("An error has occured when uploading your document to ipfs (ERR: " + err + ")")
        );
    }

    uploadToIpfs(documentToUpload) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = () => {
                try {
<<<<<<< HEAD
                    //var arrayBuffer = this.ipfsApi.Buffer.from(reader.result);
                    //alert(arrayBuffer);
                    const ipfsApi = IpfsApi('localhost', 5001);
                    const arrayBuffer = buffer.Buffer(reader.result);
                    //alert(arrayBuffer);
                    //this.ipfsApi.files.add(arrayBuffer, (err, result) => { // Upload buffer to IPFS
                    ipfsApi.files.add(arrayBuffer, (err, result) => { // Upload buffer to IPFS
                        if (err) {
                            alert('inside' + err);
                            reject(err);
                        }
                        resolve(result);
                    });
                } 
=======
                    resolve(reader.result);
                }
>>>>>>> 4b3225de00c200127ae3e6ff19d7f5bf3723d6fb
                catch (e) {
                    reject(e)
                    alert(e);
                }
                
            };
            reader.readAsText(document.getElementById("uploadedDocument").files[0]);
        });
    }

    removeDocument() {
        // this.state.vaultContract.methods.removeDocument().send(
        //     {
        //         from: this.context.web3.selectedAccount,
        //         gas: 4700000,
        //         gasPrice: 100000000000
        //     })
        //     .on('transactionHash', hash => {
        //         alert("Your document has been removed (TX: " + hash + ")");
        //         this.setState({ canCreateVault: false });
        //     })
        //     .on('error', (error) => {
        //         alert("An error has occured when removing your document (ERR: " + error + ")");
        //     });
    }

    addKeywords() {
        this.state.vaultContract.methods.addKeyword().send(
            {
                from: this.context.web3.selectedAccount,
                gas: 4700000,
                gasPrice: 100000000000
            })
            .on('transactionHash', hash => {
                alert("Your keywords has been added (TX: " + hash + ")");
                this.setState({ createVaultButton: false });
            })
            .on('error', (error) => {
                alert("An error has occured when adding keywords (ERR: " + error + ")");
            });
    }

    goToAddDocument() {
        this.setState({ view: 'add-document' });
    }

    goToVault() {
        this.setState({ view: 'vault' });
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    handleFileChange(event) {
        const target = event.target;
        const files = target.files;
        const name = target.name;
        this.setState({
            [name]: files
        });
    }

    handleSubmit(event) {
        event.preventDefault();
    }

    renderDocuments(documents) {
        if (documents != null && documents.length > 0)
            return (
                <div className="documents-table box" style={this.state.view === 'vault' ? {} : { display: 'none' }}>
                    <table>
                        <caption>Current documents</caption>
                        <thead>
                            <tr>
                                <th>description</th>
                                <th>keywords</th>
                                <th>address</th>
                                <th>tag</th>
                                <th>actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.renderDocumentRows(documents)}
                        </tbody>
                    </table>
                </div>
            );
    }

    renderDocumentRows(documents) {
        return (
            documents.filter(d => d != null).map(
                (document, index) =>
                    (
                        <tr key={index}>
                            <td>{document.description}</td>
                            <td>{document.keywords}</td>
                            <td>{document.address}</td>
                            <td><img className="flash-code-small" /></td>
                            <td>
                                <a onClick={this.removeDocument()}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </a>
                            </td>
                        </tr>
                    )
            )
        );
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
                        </p>
                    </div>
                </div>

                <div className="add-document" style={this.state.view === 'add-document' ? {} : { display: 'none' }}>
                    <h1>Add reference</h1>
                    <p>Add a reference to your vault</p>
                    <div className="box yellow m20">
                        <form onSubmit={this.handleSubmit}>
                            <div>
                                <label htmlFor="description">Description</label>
                            </div>
                            <div>
                                <textarea id="description" name="description" value={this.state.description} onChange={this.handleChange} />
                            </div>
                            <div>
                                <label htmlFor="keywords">Keywords</label>
                            </div>
                            <div>
                                <textarea id="keywords" name="keywords" value={this.state.keywords} onChange={this.handleChange} />
                            </div>
                            <div>
                                <label htmlFor="uploadedDocument">Upload your references certification</label>
                            </div>
                            <div>
                                {/* onChange={this.handleFileChange} */}
                                <input type="file" id="uploadedDocument" name="uploadedDocument" />
                            </div>
                            <div>
                                <Button value="Cancel" icon={faCheck} onClick={this.goToVault} />
                                <Button value="Validate" icon={faCheck} onClick={this.addDocument} />
                            </div>
                        </form>
                    </div>
                </div>

                {this.renderDocuments(this.state.documents)}

            </div>
        )
    }
}

Vault.contextTypes = {
    web3: PropTypes.object
}

export default Vault;