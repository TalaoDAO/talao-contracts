import React from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/button/Button';
import faBan from '@fortawesome/fontawesome-free-solid/faBan';

class Vault extends React.Component {

    //connexion to 
    constructor(props) {
        super(props);
        //const contract
        const vaultFactory = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_VAULTFACTORY_ABI),
            process.env.REACT_APP_VAULTFACTORY_ADDRESS
        );

        this.state = {
            vaultFactory: vaultFactory,
        }

        this.submit = this.submit.bind(this);
    }

    componentDidMount() {

    }

    submit() {
        this.state.vaultFactory.methods.CreateVaultContract().send(
            {
                from: this.context.web3.selectedAccount,
                gas: 4700000,
                gasPrice: 100000000000
            })
            .on('transactionHash', hash => {
                alert(hash);
            })
            .on('error', (error) => { alert(error) });

<<<<<<< HEAD:src/Components/Vault.js
        // this.state.vaultFactory.methods.getMyToken()
        //     .send({from:this.context.web3.selectedAccount,  gas: 4700000,gasPrice:100000000000 })
        //     .on('transactionHash', (hash)=> {
        //         console.log(hash);
        //     })
        //     .on('receipt', (receipt) => {
        //         //alert(receipt);
        //     })
        //     .on('confirmation', (confirmation) => {
        //         //alert(confirmation);
        //     })
        //     .on('error', (error) => {console.log(error)}); 
=======
        this.state.vaultFactory.methods.getMyToken()
            .send({ from: this.context.web3.selectedAccount, gas: 4700000, gasPrice: 100000000000 })
            .on('transactionHash', (hash) => {
                console.log(hash);
            })
            .on('receipt', (receipt) => {
                //alert(receipt);
            })
            .on('confirmation', (confirmation) => {
                //alert(confirmation);
            })
            .on('error', (error) => { console.log(error) });
>>>>>>> 9700ff070aebaaf88ec1fc5fd8362f3de9468185:src/vault/Vault.js

        // this.state.vaultFactory.methods.getNbVault().call().then(nb => {
        //     alert(nb);
        // });
    }

    render() {
        return (
            <div>
                <h1>My account</h1>
                <p>Talent Etherum Address: {this.context.web3.selectedAccount}</p>
                <div className="box blue">
                    <p className="big">
                        <Button value="Create Your Vault" icon={faBan} onClick={this.submit} />
                        <Button value="Add file to vault" icon={faBan} />
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