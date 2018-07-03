import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { constants } from './constants';
import Web3Wrapper from './web3wrapper/Web3Wrapper';
import AppConnected from './AppConnected';

const theme = createMuiTheme(constants.theme);

const styles = theme =>
  ({
    root: {
      height: '100vh',
    },
    content: {
      padding: '20px',
      background: theme.palette.background.default,
      overflowY: 'scroll',
    },
    rightMenu: {
      background: theme.palette.background.default,
    },
  });

class App extends React.Component {

  render() {
    return (
      <div>
        <Web3Wrapper />
          {/* <AppConnected />
        </Web3Wrapper> */}
      </div>
    );
  }
}

export default App;
