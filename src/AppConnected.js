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
/*import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import StarIcon from '@material-ui/icons/Star';
import ExploreIcon from '@material-ui/icons/Explore';
import HomeIcon from '@material-ui/icons/Home';*/
import { fetchUser } from './actions/user';
import { connect } from "react-redux";
import React from 'react';
import compose from 'recompose/compose';

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

class AppConnected extends React.Component {

  constructor() {
    super()
    setInterval(this.handleAddressChange, 2000);
  }

  //No redux here to avoir action spamming every 2s
  handleAddressChange = () => {
    window.web3.eth.getAccounts(function (err, accounts) {
      //First connection window.account is sometimes undefined so we check it
      if(accounts[0] !== null && window.account === undefined) {
        window.account = accounts[0];
      }
      //If log off to metamask, we return the wrapper
      else if (accounts[0] === undefined) {
        window.account = undefined;
        this.forceUpdate();
      }
      //In case of account switch, we update the profile with the new account
      else if(accounts[0].toUpperCase() !== window.account.toUpperCase()) {
        window.account = accounts[0];
        this.props.dispatch(fetchUser());
        this.props.history.push({
          pathname: '/'
        });
      }
      if (err) {
        console.log(err);
      }
    }.bind(this));
  }

  //first fetch of the user
  componentDidMount() {
    this.props.dispatch(fetchUser());
  }

  render() {
    const { error, loading, user } = this.props;
    if (error) {
      return <div>Error! {error.message}</div>;
    }
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
                      <Route exact path="/unlockfreelancer" component={UnlockFreelancer}/>
                      <Route path="/competencies/:competencyName" component={Competencies} />
                      <Redirect from="/" to='/homepage' />
                    </Switch>
                  </Grid>
                </Grid>
              </Grid>
              {/*<Hidden mdUp>
                <Grid item className={this.props.classes.bottomNav}>
                  <BottomNavigation
                    value={this.state.menuSelection}
                    onChange={this.handleMenuChange}
                    showLabels>
                    <BottomNavigationAction component={({ ...props }) => <Link to='/competencies' {...props} />} style={{ display: freelancer.freelancerDatas !== null ? '' : 'none' }} value="/competencies" label="Competencies" icon={<StarIcon />} />
                    <BottomNavigationAction component={({ ...props }) => <Link to='/chronology' {...props} />} style={{ display: freelancer.freelancerDatas !== null ? '' : 'none' }} value="/chronology" label="Chronology" icon={<ExploreIcon />} />
                    <BottomNavigationAction component={({ ...props }) => <Link to='/homepage' {...props} />} style={{ display: freelancer.freelancerDatas !== null ? 'none' : '' }} value="/homepage" label="Homepage" icon={<HomeIcon />} />
                  </BottomNavigation>
                </Grid>
              </Hidden>*/}
            </Grid>
          </Grid>
        </MuiThemeProvider>
      </Router>
    );
  }
}

const mapStateToProps = state => ({
  user: state.userReducer.user,
  loading: state.userReducer.loading,
  error: state.userReducer.error
});

export default compose(withStyles(styles), connect(mapStateToProps))(AppConnected);