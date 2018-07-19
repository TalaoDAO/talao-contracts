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
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import FreelancerService from './services/FreelancerService';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import StarIcon from '@material-ui/icons/Star';
import ExploreIcon from '@material-ui/icons/Explore';
import HomeIcon from '@material-ui/icons/Home';

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
      position: 'absolute',
      alignSelf: 'flex-end',
      margin: '20px -20px -20px -20px',
      width: '100vw',
    },
  });

class AppConnected extends React.Component {

  constructor(props) {
    super(props);
    this.free = FreelancerService.getFreelancer();
    this.free.initFreelancer(window.account);
    this.state = {
      isWaiting: true,
      value: 0,
    }
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };


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
    this.setState({ isWaiting: false })
    this.forceUpdate();
  };

  render() {
    if (this.state.isWaiting) return (<Loading />);
    return (
      <Router>
        <div>
          <MuiThemeProvider theme={theme}>
            <Grid container className={this.props.classes.root}>
              <Hidden smDown>
                <Grid item xs={2}>
                  <Menu />
                </Grid>
              </Hidden>
              <Grid container item xs={12} md={10} className={this.props.classes.content}>
                <Grid item xs={12} lg={10}>
                  <Grid container spacing={24}>
                    <Grid item xs={12}>
                      <Switch>
                        <Route exact path="/" component={this.free.isVaultCreated ? Chronology : Homepage} />
                        <Route exact path="/chronology" component={Chronology} />
                        <Route exact path="/register" component={VaultCreation} />
                        <Route exact path="/homepage" component={Homepage} />
                        <Route exact path="/competencies" component={Competencies} />
                        <Route exact path="/unlockfreelancer" component={UnlockFreelancer} />
                        <Route path="/competencies/:competencyName" component={Competencies} />
                      </Switch>
                    </Grid>
                  </Grid>
                </Grid>
                <Hidden mdUp>
                  <Grid item className={this.props.classes.bottomNav}>
                    <BottomNavigation
                      value={this.state.value}
                      onChange={this.handleChange}
                      showLabels>
                      <BottomNavigationAction label="Competencies" icon={<StarIcon />} />
                      <BottomNavigationAction label="Chronology" icon={<ExploreIcon />} />
                      <BottomNavigationAction label="Homepage" icon={<HomeIcon />} />
                    </BottomNavigation>
                  </Grid>
                </Hidden>
              </Grid>
            </Grid>
          </MuiThemeProvider>
        </div>
      </Router>
    );
  }
}

export default withStyles(styles)(AppConnected);
