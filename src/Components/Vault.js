import React, { Component } from 'react';
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

        const vault = new window.web3.eth.Contract (
        JSON.parse(process.env.REACT_APP_VAULT_ABI),
        process.env.REACT_APP_VAULT_ADDRESS
        );


          this.state = {
            vaultFactory: vaultFactory,
            vault : vault
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
        //event.preventDefault();
        this.state.vaultFactory.methods.CreateVaultContract().send(
            {from:this.context.web3.selectedAccount, 
                gas: 4700000, 
                gasPrice:100000000000 }
        ).then(addressVault => {
            alert(addressVault);
        },e => {
            alert(e);
        });
    }

    render() {
        return (
            <div>
                <button onClick={this.submit} > Create Your Vault </button>
                <button> Add file to vault </button>
                <p> {this.context.web3.selectedAccount}, {window.web3.defaultAccount}</p>
            </div>
        )
    }
}

Vault.contextTypes = {
    web3:PropTypes.object
}

export default Vault;