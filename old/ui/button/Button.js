import React, { Component } from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import './Button.css';

class Button extends Component {
  icon() {
    return (
      <FontAwesomeIcon icon={ this.props.icon } />
    );
  }
  render() {
    return (
      <button
        className={ !(this.props.disabled) ? 'pure-button btn' : 'pure-button pure-button-disabled btn' }
        onClick={ this.props.onClick }
      >
        { !!(this.props.icon) ? <FontAwesomeIcon icon={ this.props.icon } /> : '' } { this.props.value }
      </button>
    );
  }
}

export default Button;
