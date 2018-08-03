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
import { changeMenuClicked } from '../../actions/menu';

const Loading = require('react-loading-animation');

const mapStateToProps = state => ({  
    currentMenu: state.menuReducer.selectedMenu,
    transaction: state.transactionReducer.transaction
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
    this.props.dispatch(changeMenuClicked(value));
    };
    
    render() {
        const { transaction, currentMenu } = this.props;

        if (!this.props.user || transaction) {
            return (<Loading />);
        }

        return (
            <Grid item className={this.props.classes.bottomNav}>
            <BottomNavigation
              value={currentMenu}
              onChange={this.handleChange}
              showLabels>
              <BottomNavigationAction component={({ ...props }) => <Link to='/homepage' {...props} />} value="/homepage" label="Homepage" icon={<HomeIcon />} />
              <BottomNavigationAction component={({ ...props }) => <Link to='/chronology' {...props} />} style={{ display: this.props.user.freelancerDatas ? '' : 'none' }} value="/chronology" label="Chronology" icon={<ExploreIcon />} />
              <BottomNavigationAction component={({ ...props }) => <Link to='/competencies' {...props} />} style={{ display: this.props.user.freelancerDatas ? '' : 'none' }} value="/competencies" label="Competencies" icon={<StarIcon />} />
              <BottomNavigationAction component={({ ...props }) => <Link to='/register' {...props} />} value="/register" label={this.props.user.freelancerDatas ? 'Update' : 'Register'} icon={<AccountCircle />} />
            </BottomNavigation>
          </Grid>
        );
    }
}

export default compose(withStyles(styles), connect(mapStateToProps))(TabBarMenu);