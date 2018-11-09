import React from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import StarIcon from '@material-ui/icons/Star';
import AccountCircle from '@material-ui/icons/AccountCircle'
import ExploreIcon from '@material-ui/icons/Explore';
import HomeIcon from '@material-ui/icons/Home';
import Grid from '@material-ui/core/Grid';
import { changeMenuClicked } from '../../actions/public/menu';
import { removeResearch } from '../../actions/public/user';

const Loading = require('react-loading-animation');

const mapStateToProps = state => ({  
    currentMenu: state.menuReducer.selectedMenu
  });

  const styles = () =>
  ({
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
    }
  });

class TabBarMenu extends React.Component {
    state = {
        value: 0,
      };
    
    handleChange = (event, value) => {
    this.props.dispatch(changeMenuClicked(value, true));
    };
    
    render() {
        const { currentMenu } = this.props;

        if (!this.props.user) {
            return (<Loading />);
        }

        return (
            <Grid item className={this.props.classes.bottomNav}>
            <BottomNavigation
              value={currentMenu}
              onChange={this.handleChange}
              showLabels>
              <BottomNavigationAction component={({ ...props }) => <Link to='/homepage' {...props} />} 
                                                                    value="/homepage" 
                                                                    label="Homepage" 
                                                                    onClick={() => { 
                                                                      let usr = this.props.user; 
                                                                      usr.searchedFreelancers = null; 
                                                                      this.props.dispatch(removeResearch(usr)); 
                                                                     }
                                                                    }
                                                                    icon={<HomeIcon />} />
              <BottomNavigationAction component={({ ...props }) => <Link to="/chronology" {...props} />} 
                                                                    style={{ display: ((this.props.user.freelancerDatas && this.props.user.searchedFreelancers) && currentMenu !== '/unlockfreelancer') ? '' : 'none' }} 
                                                                    value="/chronology2" 
                                                                    label="My vault"
                                                                    onClick={() => { 
                                                                      let usr = this.props.user; 
                                                                      usr.searchedFreelancers = null; 
                                                                      this.props.dispatch(removeResearch(usr)); 
                                                                      this.props.dispatch(changeMenuClicked('/chronology', true));
                                                                      //Nothing change here to redux and we need to forceUpdate to update the menu
                                                                      this.forceUpdate();
                                                                      }
                                                                    }
                                                                    icon={<ExploreIcon />} />
              <BottomNavigationAction component={({ ...props }) => <Link to={!this.props.user.searchedFreelancers ? "/chronology" : "/chronology?" + this.props.user.searchedFreelancers.ethAddress} {...props} />} 
                                                                    style={{ display: ((this.props.user.freelancerDatas || this.props.user.searchedFreelancers) && currentMenu !== '/unlockfreelancer') ? '' : 'none' }} 
                                                                    value="/chronology" 
                                                                    label="Chronology" 
                                                                    icon={<ExploreIcon />} />
              <BottomNavigationAction component={({ ...props }) => <Link to={!this.props.user.searchedFreelancers ? "/competencies" : "/competencies?" + this.props.user.searchedFreelancers.ethAddress} {...props} />} 
                                                                    style={{ display: ((this.props.user.freelancerDatas || this.props.user.searchedFreelancers) && currentMenu !== '/unlockfreelancer') ? '' : 'none' }}  
                                                                    value="/competencies" 
                                                                    label="Competencies" 
                                                                    icon={<StarIcon />} />
              <BottomNavigationAction component={({ ...props }) => <Link to='/register' {...props} />} 
                                                                    value="/register" 
                                                                    style={{ display: ((this.props.user.ethAddress && !this.props.user.searchedFreelancers && currentMenu !== '/unlockfreelancer')) ? '' : 'none' }}  
                                                                    label={this.props.user.freelancerDatas ? 'Update' : 'Register'} 
                                                                    icon={<AccountCircle />} />
            </BottomNavigation>
          </Grid>
        );
    }
}

export default compose(withStyles(styles), connect(mapStateToProps))(TabBarMenu);