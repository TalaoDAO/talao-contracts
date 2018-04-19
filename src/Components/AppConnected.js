import React, { Component } from 'react';
import PropTypes from 'prop-types';

class AppConnected extends React.Component {

    //connexion to 
    constructor(props) {
        super(props);
        //const contract

        const vaultFactory = new window.web3.eth.Contract (
            JSON.parse(process.env.REACT_APP_VAULTFACTORY_ABI),
            process.env.REACT_APP_VAULTFACTORY_ADDRESS
          );


          this.state = {
            vaultFactory: vaultFactory
          }
    }

    componentDidMount() {
        this.state.vaultFactory.methods.getMyToken().call().then(token =>{
            alert(token);
        });

        this.state.vaultFactory.methods.CreateVaultContract().send({from:this.context.web3.selectedAccount}).then(addressVault => {
            alert(addressVault);
        },e => {
            alert(e);
        });
        
    }

    render() {
        return (
            <div>
                <button> Create Your Vault </button>
                <button> Add file to vault </button>
                <p> {this.context.web3.selectedAccount}, {window.web3.defaultAccount}</p>
            </div>
        )
    }
}

AppConnected.contextTypes = {
    web3:PropTypes.object
}

export default AppConnected;