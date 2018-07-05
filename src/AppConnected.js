import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { constants } from './constants';
import Profile from './components/profile/Profile';
import Menu from './components/menu/Menu';
import Competencies from './components/competencies/Competencies';
import Chronology from './components/chronology/Chronology';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
<<<<<<< HEAD
import FreelancerService from './services/FreelancerService';
import Freelancer from './models/Freelancer';
=======
>>>>>>> 876613d4346e5813fa2ecfe3dee13c93ca649ac6

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

<<<<<<< HEAD
  constructor(props){
    super(props);

    window.freeLancer = FreelancerService.getFreelancer()
  }

=======
>>>>>>> 876613d4346e5813fa2ecfe3dee13c93ca649ac6
  render() {
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
                        <Profile />
                      </Grid>
                      <Grid item xs={12}>
                        <Switch>
                          <Route exact path="/" component={Chronology} />
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
