import React, { Component } from 'react';
import '../ui/form/Form.css';
import './CreateVaultAccessForm.css';

export default class CreateVaultAccessForm extends Component {
  render() {
    return (
      <div className = "CreateVaultAccess-token-form">
        <p>To create your Vault, you must first open your Vault Access. In this operation:</p>
        <ol>
          <li>In the form below, you choose the price in { this.props.tokenSymbol } tokens that clients will have to pay to access your Vault. <strong>The price must be less than { this.props.vaultDeposit } { this.props.tokenSymbol }s.</strong></li>
          <li>When submitting this form and signing the associated transaction, your Vault access price will be set and <strong>{ this.props.vaultDeposit } { this.props.tokenSymbol }s tokens will be transfered from your account to Talao, where they will be kept as your Vault deposit</strong>. You can get back your deposit at any time by closing your Vault access. Clients who bought an access to your Vault will always keep their access.</li>
        </ol>
        <form
          className = "pure-form pure-form-aligned"
          onSubmit = { this.props.onSubmit }>
          <fieldset>
            <div className = "pure-control-group">
              <input
                name = "vaultPrice"
                type = "text"
                className = "pure-input-1"
                placeholder = { 'Price (in ' + this.props.tokenSymbol + ' tokens) clients will pay you to access your Vault' }
                value = { this.props.vaultPrice }
                onChange = { this.props.onChange } />
            </div>
            <div className = "pure-control-group">
              <input
                className = "pure-input-1 pure-button btn"
                type = "submit"
                value = "Set price" />
            </div>
          </fieldset>
        </form>
      </div>
    );
  }
}
