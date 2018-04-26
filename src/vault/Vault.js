import React from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/button/Button';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faPlus from '@fortawesome/fontawesome-free-solid/faPlus';
import faFolder from '@fortawesome/fontawesome-free-solid/faFolder';
import faCheck from '@fortawesome/fontawesome-free-solid/faCheck';
import faTrash from '@fortawesome/fontawesome-free-solid/faTrash';
import faUpload from '@fortawesome/fontawesome-free-solid/faUpload';
import IpfsApi from 'ipfs-api';
import buffer from 'buffer';
import bs58 from 'bs58';
import QrCode from 'qrcode.react';
import './Vault.css';

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
<<<<<<< HEAD
=======

>>>>>>> e94361a532a37b0ba87f6a33e62a6dabffe20fb3
            vaultContract: null,
            vaultEvent: null,
            vaultAddress: '',
            canCreateVault: false,
            documents: [],
            view: 'vault',
            waiting: false,
            description: '',
            keywords: '',
            uploadedDocument: null,
            firstBlock: null
        }

        this.ipfsApi = IpfsApi('localhost', 5001, { protocol: 'http' });

        this.createFreelanceVault = this.createFreelanceVault.bind(this);
        this.addDocument = this.addDocument.bind(this);
        this.goToAddDocument = this.goToAddDocument.bind(this);
        this.goToVault = this.goToVault.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.removeDocument = this.removeDocument.bind(this);
        this.openUpload = this.openUpload.bind(this);
    }

    componentDidMount() {

        //get initbock to manage event
        window.web3.eth.getBlockNumber().then(blockNumber => {
            this.setState({
                firstBlock: blockNumber
            })
        });

        //create an event for Contract creation
        var vaultOldFactoryContract = window.web3old.eth.contract(JSON.parse(process.env.REACT_APP_VAULTFACTORY_ABI));
        var val = vaultOldFactoryContract.at(process.env.REACT_APP_VAULTFACTORY_ADDRESS);

        this.eventVaultCreated = val.VaultCreation();
        this.eventVaultCreated.watch((err, event) => {
            if (err)
                console.log(err);
            else {
                if (event['blockNumber'] > this.state.firstBlock) {
                    this.setState({
                        vaultAddress: event['args']['vaultadddress'],
                        waiting: false
                    });
                }
            }
        });

        this.state.vaultFactoryContract.methods.FreelanceVault(this.context.web3.selectedAccount).call().then(vaultAdress => {
            if (vaultAdress !== '0x0000000000000000000000000000000000000000') {
                this.createVaultCont(vaultAdress);

                this.setState({
                    vaultAddress: vaultAdress
                });

                //init document list
                this.state.vaultContract.getPastEvents('VaultDocAdded', {}, { fromBlock: 0, toBlock: 'latest' }).then(events => {
                    events.forEach((event => {
                        var docId = event['returnValues']['documentId'].toString();
                        //var docId = this.getIpfsHashFromBytes32(event['returnValues']['documentId']);
                        var description = window.web3.utils.hexToAscii(event['returnValues']['description']).replace(/\u0000/g, '');

                        this.state.vaultContract.methods.getDocumentIsAlive(docId).call().then(res => {
                            if (res === true) {
                                //we add only th document alive and not removed
                                this.state.vaultContract.methods.getKeywordsNumber(docId).call().then(number => {
                                   this.pushDocument(number,docId,description);
                                });
                            }
                        });
                    }));
                });

            } else {
                this.setState({
                    canCreateVault: true,
                })
            }
        })
    }

    componentWillUnmount() {
        this.eventVaultCreated.stopWatching( () => {} );
        this.eventDocAdded.stopWatching( () => {} );
        this.eventVaultLog.stopWatching( () => {} );
    }

    pushDocument(number, docId, description)
    {
        var keywords = '';
        var promises = [];
        for (let index = 0; index < number; index++) {

            promises.push(this.state.vaultContract.methods.getKeywordsByIndex(docId, index).call().then(result => {
                keywords = (keywords=='' ? ''  : keywords+'') + window.web3.utils.hexToAscii(result).replace(/\u0000/g, '');
            }));
        }

        Promise.all(promises).then(() => {
            this.state.documents.push({
                description: description,
                keywords: keywords,
                address: this.getIpfsHashFromBytes32(docId)
            });
    
            this.forceUpdate();
        });
    }

    createVaultCont(vaultAdress) {
        const vaultContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_VAULT_ABI),
            vaultAdress
        );

        this.setState({
            vaultContract: vaultContract
        });

        this.contractObjectOldWeb3 = window.web3old.eth.contract(JSON.parse(process.env.REACT_APP_VAULT_ABI));
        var vaultWithOldWeb3 = this.contractObjectOldWeb3.at(vaultAdress);

        this.eventDocAdded = vaultWithOldWeb3.VaultDocAdded();
        this.eventDocAdded.watch((err, event) => {
            if (err)
                console.log(err);
            else {
                if (event['blockNumber'] > this.state.firstBlock) {
                    var docId = event['args']['documentId'];
                    var description = window.web3.utils.hexToAscii(event['args']['description']).replace(/\u0000/g, '')
                    this.state.vaultContract.methods.getKeywordsNumber(docId).call().then(number => {
                        this.pushDocument(number, docId, description);
                        this.goToVault();
                    });
                    
                }
            }
        });

        this.eventVaultLog = vaultWithOldWeb3.VaultLog();
        this.eventVaultLog.watch((err, event) => {
            if (err)
                console.log(err);
            else {
                if (event['blockNumber'] > this.state.firstBlock) {
                    if (event['args']['happened'] == 2) {
                        var index = this.state.documents.findIndex((d, i, o) => d && d.address === this.getIpfsHashFromBytes32(event['args']['documentId']));
                        this.state.documents.splice(index, 1);
                        this.forceUpdate();
                    }
                }
            }
        });
    }

    createFreelanceVault() {
        this.setState({ waiting: true });
        this.state.vaultFactoryContract.methods.CreateVaultContract().send(
            {
                from: this.context.web3.selectedAccount,
                gas: 4700000,
                gasPrice: 100000000000
            })
            .on('error', error => {
                alert("An error has occured when creating your vault (ERR: " + error + ")");
                this.setState({ waiting: false });
                return;
            });
    }

    addDocument() {
        // send document to ipfs
        if (this.state.uploadedDocument === null || this.state.uploadedDocument.length === 0) {
            alert("No document uploaded. Please add a document.");
            return;
        }
        this.setState({ waiting: true });
        this.uploadToIpfs(this.state.uploadedDocument[0]).then(result => {

            var docId = this.getBytes32FromIpfsHash(result[0].path);

            // If it's the first doc it's the identity doc
            if (this.state.documents === null || this.state.documents.length === 0) {
                this.setState({ description: 'Identity document', keywords: 'ID' });
            }

            var description = window.web3.utils.fromAscii(this.state.description);
            var keywords = window.web3.utils.fromAscii(this.state.keywords);

            if (this.state.vaultContract != null) {
                this.state.vaultContract.methods.addDocument(docId, description, keywords).send(
                    {
                        from: this.context.web3.selectedAccount,
                        gas: 4700000,
                        gasPrice: 100000000000
                    }).on('error', error => {
                        alert("An error has occured when adding your document (ERR: " + error + ")");
                        this.goToVault();
                        return;
                    });
            }
        },
            err => alert("An error has occured when uploading your document to ipfs (ERR: " + err + ")")
        );
    }

    uploadToIpfs(documentToUpload) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = () => {
                try {
                    //const ipfsApi = IpfsApi('localhost', 5001);
                    const arrayBuffer = buffer.Buffer(reader.result);
                    this.ipfsApi.files.add(arrayBuffer, (err, result) => { // Upload buffer to IPFS
                        if (err) {
                            reject(err);
                        }
                        resolve(result);
                    });
                }
                catch (e) {
                    reject(e)
                }

            };
            reader.readAsText(documentToUpload);
        });
    }

    removeDocument(address) {
        if (this.state.vaultContract == null) return;
        var docId = this.getBytes32FromIpfsHash(address);
        this.state.vaultContract.methods.removeDocument(docId).send(
            {
                from: this.context.web3.selectedAccount,
                gas: 4700000,
                gasPrice: 100000000000
            }).on('error', error => {
                alert("An error has occured when removing your document (ERR: " + error + ")");
                return;
            });
    }

    addKeywords(docId, keyword) {
        this.state.vaultContract.methods.addKeyword(docId, keyword).send(
            {
                from: this.context.web3.selectedAccount,
                gas: 4700000,
                gasPrice: 100000000000
            })
            .on('error', (error) => {
                alert("An error has occured when adding keywords (ERR: " + error + ")");
            });
    }

    getBytes32FromIpfsHash(ipfsAddress) {
        return "0x" + bs58.decode(ipfsAddress).slice(2).toString('hex')
    }

    getIpfsHashFromBytes32(bytes32Hex) {
        // Add our default ipfs values for first 2 bytes:
        // function:0x12=sha2, size:0x20=256 bits
        // and cut off leading "0x"
        const hashHex = "1220" + bytes32Hex.slice(2)
        const hashBytes = Buffer.from(hashHex, 'hex');
        const hashStr = bs58.encode(hashBytes)
        return hashStr
    }

    goToAddDocument() {
        //document.getElementById("uploadedDocument").value = "";
        this.setState({
            view: 'add-document',
            description: '',
            keywords: '',
            uploadedDocument: null,
            waiting: false
        });
    }

    goToVault() {
        this.setState({
            view: 'vault',
            waiting: false
        });
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
        if (files.length > 0) {
            this.fileDownload.innerHTML = files[0].name;
            const name = target.name;
            this.setState({
                [name]: files
            });
        }
    }

    handleSubmit(event) {
        event.preventDefault();
    }

    openUpload(event) {
        this.uploadElement.click();
    }

    renderDocuments(documents, vaultAddress, view) {
        if (view !== "vault" || vaultAddress == null || vaultAddress === "") return;
        if (documents != null && documents.length > 0)
            return (
                <div className="pb20">
                    <div className="documents-table box yellow" style={this.state.view === 'vault' ? {} : { display: 'none' }}>
                        <h3>My documents</h3>
                        <Button value="Add a reference" icon={faPlus} onClick={this.goToAddDocument} />
                        <table>
                            <thead>
                                <tr>
                                    <th>description</th>
                                    <th>keywords</th>
                                    <th>tag</th>
                                    <th>actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.renderDocumentRows(documents)}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        else {
            return (
                <div className="pb20">
                    <div className="box blue">
                        <p className="big">
                            To continue, we need to verify your identify: <br />
                            please upload your ID card, passport or driver license<br />
                            <Button value="Add your ID document" icon={faPlus} onClick={this.goToAddDocument} />
                        </p>
                    </div>
                </div>
            );
        }
    }

    renderDocumentRows(documents) {
        return (
            documents.filter(d => d != null).map(
                (document, index) =>
                    (
                        <tr key={index}>
                            <td>{document.description}<br /><span className="etherum-address">Doc @: {document.address}</span></td>
                            <td>{document.keywords}</td>
                            <td>{this.renderQrCode(document.address, 20)}</td>
                            <td>
                                <a onClick={() => this.removeDocument(document.address)} style={index === 0 ? { display: 'none' } : {}}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </a>
                            </td>
                        </tr>
                    )
            )
        );
    }

    renderAddDocument(view) {
        if (view !== "add-document") return;

        return (
            <div>
                <h1>Add reference</h1>
                <p>Add a reference to your vault</p>
                <div className="pb20">
                    <div className="box yellow mb20">
                        <form onSubmit={this.handleSubmit} style={!this.state.waiting ? {} : { display: 'none' }}>
                            <div style={this.state.documents === null || this.state.documents.length === 0 ? { display: 'none' } : {}}>
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
                                <div className="pb20">
                                    <label htmlFor="uploadedDocument">Upload your references certification</label>
                                </div>
                            </div>
                            <div style={this.state.documents === null || this.state.documents.length === 0 ? {} : { display: 'none' }}>
                                <div className="pb20">
                                    <label htmlFor="uploadedDocument">upload your ID card, passport or driver license</label>
                                </div>
                            </div>
                            <div className="pb20">
                                <span onClick={this.openUpload} className="upload-button"><FontAwesomeIcon icon={faUpload} />&nbsp;<span ref={span => this.fileDownload = span}>Choose a file...</span></span>
                                <input type="file" ref={input => this.uploadElement = input} id="uploadedDocument" name="uploadedDocument" onChange={this.handleFileChange} style={{width:0}}/>
                            </div>
                            <div>
                                <Button value="Cancel" icon={faCheck} onClick={this.goToVault} />
                                <Button value="Validate" icon={faCheck} onClick={this.addDocument} />
                            </div>
                        </form>
                        <div style={this.state.waiting ? {} : { display: 'none' }}>Waiting for document to be registered...</div>
                    </div>
                </div>
            </div>
        );

    }

    renderVault(address) {
        if (address) {
            return (
                <div>
                    <h3>My vault</h3>
                    <div className="mb20">
                        <div className="etherum-address">Vault @:{this.state.vaultAddress}</div>
                    </div>
                </div>
            );
        }
        else {
            return (
                <div className="box blue">
                    <p className="big" style={this.state.waiting ? {display : 'none'}: {}}>
                        To start, you must create a vault<br />
                        <Button value="Create Your Vault" icon={faFolder} onClick={this.createFreelanceVault} />
                    </p>
                    <p style={this.state.waiting ? {}: {display : 'none'}}>
                        Waiting for vault to be created...
                    </p>
                </div>
            );
        }
    }

    renderQrCode(address, size) {
        if (address) {
            return (
                <div className="pb20">
                    <QrCode value={address} size={size} />
                </div>
            );
        }
    }

    render() {
        return (
            <div>
                <div className="pb20" style={this.state.view === 'vault' ? {} : { display: 'none' }}>
                    <h1>My account</h1>
                    <p className="etherum-address">Account @: {this.context.web3.selectedAccount}</p>
                    {this.renderQrCode(this.context.web3.selectedAccount, 100)}
                    {this.renderVault(this.state.vaultAddress)}
                </div>
                {this.renderAddDocument(this.state.view)}
                {this.renderDocuments(this.state.documents, this.state.vaultAddress, this.state.view)}
            </div>
        )
    }
}

Vault.contextTypes = {
    web3: PropTypes.object
}

export default Vault;