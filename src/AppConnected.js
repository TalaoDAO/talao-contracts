import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { constants } from './constants';
import Profile from './components/profile/Profile';
import Menu from './components/menu/Menu';
import VaultCreation from './components/vaultCreation/VaultCreation';
import Homepage from './components/homepage/Homepage';
import Competencies from './components/competencies/Competencies';
import Chronology from './components/chronology/Chronology';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import FreelancerService from './services/FreelancerService';

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

class AppConnected extends React.Component {

  constructor(props) {
    super(props);
    this.free = FreelancerService.getFreelancer();
    this.state = {
      experiences: this.free.experiences
    };
    this.free.initFreelancer(window.account);
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
    this.forceUpdate();
  };

  render() {
    const currentPath = window.location.pathname;
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
                        {!currentPath.includes('homepage') ? <Profile /> : null }
                      </Grid>
                      <Grid item xs={12}>
                        <Switch>
                          <Route exact path="/" component={Homepage} />
                          <Route exact path="/chronology" component={Chronology} />
                          <Route exact path="/register" component={VaultCreation} />
                          <Route exact path="/homepage" component={Homepage} />
                          <Route exact path="/competencies" component={Competencies} />
                          <Route path="/competencies/:competencyName" component={Competencies} />
                        </Switch>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </MuiThemeProvider>
          </div>
      </Router>
    );
  }
}

export default withStyles(styles)(AppConnected);
