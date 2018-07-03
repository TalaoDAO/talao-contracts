import React from 'react';
import Web3Wrapper from './web3wrapper/Web3Wrapper';
import AppConnected from './AppConnected';

class App extends React.Component {

  render() {
    return (
      <div>
        <Web3Wrapper>
          <AppConnected />
        </Web3Wrapper>
      </div>
    );
  }
}

export default App;
