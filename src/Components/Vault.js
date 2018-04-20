import React from 'react';
import PropTypes from 'prop-types';

class Vault extends React.Component {

    //connexion to 
    constructor(props) {
        super(props);
        //const contract

        const vaultFactory = new window.web3.eth.Contract (
            JSON.parse(process.env.REACT_APP_VAULTFACTORY_ABI),
            process.env.REACT_APP_VAULTFACTORY_ADDRESS
          );

        // const vault = new window.web3.eth.Contract (
        // JSON.parse(process.env.REACT_APP_VAULT_ABI),
        // process.env.REACT_APP_VAULT_ADDRESS
        // );
        
          this.state = {
            vaultFactory: vaultFactory,
          }

          this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        // this.state.vaultFactory.methods.getMyToken().call().then(token =>{
        //     alert(token);
        // });

        // this.state.vaultFactory.methods.CreateVaultContract().send({from:this.context.web3.selectedAccount}).then(addressVault => {
        //     alert(addressVault);
        // },e => {
        //     alert(e);
        // });
        
    }
    
    submit() {
        this.state.vaultFactory.methods.CreateVaultContract().send(
            {from:this.context.web3.selectedAccount, 
                gas: 4700000, 
                gasPrice:100000000000 })
            .on('transactionHash', hash => {
                alert(hash);
            })
            .on('error',(error) => {alert(error)});

        this.state.vaultFactory.methods.getMyToken()
            .send({from:this.context.web3.selectedAccount,  gas: 4700000,gasPrice:100000000000 })
            .on('transactionHash', (hash)=> {
                console.log(hash);
            })
            .on('receipt', (receipt) => {
                //alert(receipt);
            })
            .on('confirmation', (confirmation) => {
                //alert(confirmation);
            })
            .on('error', (error) => {console.log(error)}); 

        this.state.vaultFactory.methods.getNbVault().call().then(nb => {
            alert(nb);
        });
    }

    render() {
        return (
            <div>
                <button onClick={this.submit} > Create Your Vault </button>
                <button> Add file to vault </button>
                <p> {this.context.web3.selectedAccount}</p>
            </div>
        )
    }
}

Vault.contextTypes = {
    web3:PropTypes.object
}

export default Vault;