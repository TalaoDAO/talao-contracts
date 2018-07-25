import React from 'react';
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
import { BrowserRouter as Router, Route, Switch, Redirect, Link } from 'react-router-dom';
import FreelancerService from './services/FreelancerService';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import StarIcon from '@material-ui/icons/Star';
import ExploreIcon from '@material-ui/icons/Explore';
import HomeIcon from '@material-ui/icons/Home';
import Web3Wrapper from './web3wrapper/Web3Wrapper';

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

  constructor(props) {
    super(props);
    this.free = FreelancerService.getFreelancer();
    this.free.initFreelancer(window.account);
    this.state = {
      isWaiting: true,
      connected: true,
    //  previousPath: window.location.path,
      menuSelection: ''
    }
    setInterval(this.handleAddressChange, 2000);
  }

  handleMenuChange = (event, value) => {
    if(this.free.freelancerAddress.toLowerCase() !== window.account.toLowerCase())
      this.free.initFreelancer(window.account);
    if(typeof value === 'undefined') {
      let newValue = '/' + event.target.text.toLowerCase();
      this.setState({ menuSelection : newValue });
    }
    else
      this.setState({ menuSelection: value });
  };

  handleAddressChange = () => {
    window.web3.eth.getAccounts(function (err, accounts) {
      //First connection window.account is sometimes undefined so we check it
      if(accounts[0] !== null && window.account === undefined) {
        window.account = accounts[0];
      }
      //If log off to metamask, we return the wrapper
      else if (accounts[0] === undefined) {
        window.account = undefined;
        this.setState({connected: false});
        this.forceUpdate();
      }
      //In case of account switch, we update the profile with the new account
      else if(accounts[0].toUpperCase() !== window.account.toUpperCase()) {
        window.account = accounts[0];
        this.free.initFreelancer(window.account);
        this.setState({ isWaiting: true });
        this.props.history.push({
          pathname: '/'
        });
      }
      if (err) {
        console.log(err);
      }
    }.bind(this));
  }

  hasPathChanged() {
    return this.state.previousPath !== window.location.pathanme;
  }

  componentWillUpdate() {
    if (this.hasPathChanged()) {
      this.setState({
        previousPath: window.location.pathname
       // menuSelection: this.free.isVaultCreated ? (window.location.pathname !== '/' ? window.location.pathname : '/chronology') : '/homepage'
      });
    }
  }

  componentDidMount() {
    this.free.addListener('ExperienceChanged', this.handleEvents, this);
    this.free.addListener('FreeDataChanged', this.handleEvents, this);
  }

  componentWillUnmount() {
    this.free.removeListener('ExperienceChanged', this.handleEvents, this);
    this.free.removeListener('FreeDataChanged', this.handleEvents, this);
  }

  handleEvents = () => {
    this.free = FreelancerService.getFreelancer();
    this.setState({
      isWaiting: false,
      menuSelection: this.free.isVaultCreated ? (window.location.pathname !== '/' ? window.location.pathname : '/chronology') : '/homepage'
    })
    this.forceUpdate();
  };

  render() {
    const MyHomePageComponent = (props) => {
      return (
        <Homepage 
          freelancer={this.free}
          {...props}
        />
      );
    }
    if (!this.state.connected) return (<Web3Wrapper />);
    if (this.state.isWaiting) return (<Loading />);
    return (
      <Router>
        <MuiThemeProvider theme={theme}>
          <Grid container className={this.props.classes.root}>
            <Hidden smDown>
              <Grid item xs={2}>
                <Menu menuSelection={this.state.menuSelection} updateMenu={this.handleMenuChange} />
              </Grid>
            </Hidden>
            <Grid container item xs={12} md={10} className={this.props.classes.content}>
              <Grid item xs={12} lg={10}>
                <Grid container spacing={24}>
                  <Grid item xs={12}>
                    <Switch>
                      <Route exact path="/chronology" component={Chronology} />
                      <Route exact path="/register" component={VaultCreation} />
                      <Route exact path="/homepage" component={MyHomePageComponent} />
                      <Route exact path="/competencies" component={Competencies} />
                      <Route exact path="/unlockfreelancer" component={UnlockFreelancer}/>
                      <Route path="/competencies/:competencyName" component={Competencies} />
                      <Redirect from="/" to='/homepage' />
                    </Switch>
                  </Grid>
                </Grid>
              </Grid>
              <Hidden mdUp>
                <Grid item className={this.props.classes.bottomNav}>
                  <BottomNavigation
                    value={this.state.menuSelection}
                    onChange={this.handleMenuChange}
                    showLabels>
                    <BottomNavigationAction component={({ ...props }) => <Link to='/competencies' {...props} />} style={{ display: this.free.isFreelancer() || this.free.isVaultCreated ? '' : 'none' }} value="/competencies" label="Competencies" icon={<StarIcon />} />
                    <BottomNavigationAction component={({ ...props }) => <Link to='/chronology' {...props} />} style={{ display: this.free.isFreelancer() || this.free.isVaultCreated ? '' : 'none' }} value="/chronology" label="Chronology" icon={<ExploreIcon />} />
                    <BottomNavigationAction component={({ ...props }) => <Link to='/homepage' {...props} />} style={{ display: this.free.isFreelancer() ? 'none' : '' }} value="/homepage" label="Homepage" icon={<HomeIcon />} />
                  </BottomNavigation>
                </Grid>
              </Hidden>
            </Grid>
          </Grid>
        </MuiThemeProvider>
      </Router>
    );
  }
}

export default withStyles(styles)(AppConnected);
