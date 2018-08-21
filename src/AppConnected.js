import { withStyles } from '@material-ui/core/styles';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { constants } from './constants';
import Menu from './components/menu/Menu';
import VaultCreation from './components/vaultCreation/VaultCreation';
import Homepage from './components/homepage/Homepage';
import Competencies from './components/competencies/Competencies';
import UnlockFreelancer from './components/unlockFreelancer/UnlockFreelancer';
import Chronology from './components/chronology/Chronology';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { fetchUser, logout, login } from './actions/user';
import { resetTransaction } from './actions/transactions';
import { guardRedirect } from './actions/guard';
import { connect } from "react-redux";
import React from 'react';
import compose from 'recompose/compose';
import TabBarMenu from './components/menu/TabBarMenu';
import queryString from 'query-string'

const Loading = require('react-loading-animation');
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
    bottomNav: {
      width: '100%',
      alignSelf: 'flex-end',
      backgroundImage: 'none',
      backgroundRepeat: 'repeat',
      backgroundAttachment: 'scroll',
      backgroundPosition: '0% 0%',
      position: 'fixed',
      bottom: '0pt',
      left: '0pt',
    },
  });

const mapStateToProps = state => ({
    user: state.userReducer.user,
    ethAddress: state.userReducer.ethAddress,
    loading: state.userReducer.loading,
    resetAccount: state.userReducer.resetAccount,
    useAccount: state.userReducer.useAccount
});

let INIT_ONCE = false;

class AppConnected extends React.Component {

  constructor() {
    super()
    setInterval(this.handleAddressChange, 2000);
  }

  //No redux here to avoid action spamming every 2s
  //Handle the logout / login
  //We have no choice to check like that
  //The library web3-react doesn't supply redux event to handle it
  handleAddressChange = () => {
    window.web3.eth.getAccounts(function (err, accounts) {
      if (accounts[0] === undefined && window.account) {
        window.account = null;
        this.props.dispatch(logout());
      } else if (accounts[0] && !window.account) {
        this.props.dispatch(login(accounts[0]));
      }
    }.bind(this));
  }
  
  //If no ethAddress, we init an empty user
  //This action is trigger each time we first log in
  //If the user has a wallet, this action is erase by the action 'RECEIVE ACCOUNT'
  componentDidMount() {
    if (!this.props.ethAddress && !INIT_ONCE) {
      let parameter = queryString.extract(window.location.search);
      if (parameter && window.web3.utils.isAddress(parameter)) {
        this.props.dispatch(guardRedirect(window.location.pathname + '?' + parameter))
      }
      this.props.dispatch(fetchUser());
      INIT_ONCE = true;
      window.account = null;
    }
  }

  //get the first action 'RECEIVE ACCOUNT' and set this.props.ethAddress
  //each action 'RECEIVE ACCOUNT' OR 'CHANGE_ACCOUNT' trigger this.props.resetAccount and the user is re fetch
  //if the first init isn't done, we init the user
  //this.props.resetAccount handle a change beetween accounts, so we re fetch the new user
  componentDidUpdate() {
    if ((this.props.ethAddress && !INIT_ONCE) || this.props.resetAccount) {
      this.props.dispatch(resetTransaction());
      this.props.dispatch(fetchUser(this.props.ethAddress));
      INIT_ONCE = true;
      window.account = this.props.ethAddress;
    }
  }

  render() {
    const { loading, user} = this.props;
    if (loading) {
      return <Loading />;
    }

    const MyHomePageComponent = (props) => {
      return (
        <Homepage 
          user={user}
          {...props}
        />
      );
    }
    const MyChronologyComponent = (props) => {
      return (
        <Chronology 
          user={user}
          {...props}
        />
      );
    }
    const MyCompetenciesComponent = (props) => {
      return (
        <Competencies
          user={user}
          {...props}
        />
      );
    }
    const MyVaultCreationComponent = (props) => {
      return (
        <VaultCreation
          user={user}
          {...props}
        />
      );
    }
    const MyUnlockFreelancerComponent = (props) => {
      return (
        <UnlockFreelancer
          user={user}
          {...props}
        />
      );
    }

    return (
      <Router>
        <MuiThemeProvider theme={theme}>
          <Grid container className={this.props.classes.root}>
            <Hidden smDown>
              <Grid item xs={2}>
                <Menu user={user}/>
              </Grid>
            </Hidden>
            <Grid container item xs={12} md={10} className={this.props.classes.content}>
              <Grid item xs={12} lg={10}>
                <Grid container spacing={24}>
                  <Grid item xs={12}>
                    <Switch>
                      <Route exact path="/chronology" component={MyChronologyComponent} />
                      <Route exact path="/register" component={MyVaultCreationComponent} />
                      <Route exact path="/homepage" component={MyHomePageComponent} />
                      <Route exact path="/competencies" component={MyCompetenciesComponent} />
                      <Route exact path="/unlockfreelancer" component={MyUnlockFreelancerComponent}/>
                      <Route path="/competencies/:competencyName" component={MyCompetenciesComponent} />
                      <Redirect from="/" to='/homepage' />
                    </Switch>
                  </Grid>
                </Grid>
              </Grid>
              <Hidden mdUp>
                <TabBarMenu user={user} />
              </Hidden>
            </Grid>
          </Grid>
        </MuiThemeProvider>
      </Router>
    );
  }
}

export default compose(withStyles(styles), connect(mapStateToProps))(AppConnected);