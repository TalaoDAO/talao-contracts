import React from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import logoTalao from '../../images/logo-talao.png';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { changeMenuClicked } from '../../actions/public/menu';

const mapStateToProps = state => ({
    currentMenu: state.menuReducer.selectedMenu
  });

const styles = theme => ({
    root: {
        marginLeft: '20px',
        height: '100vh',
    },
    logo: {
        marginTop: '20px',
        width: '60%',
    },
    sidebar: {
        float: 'right',
        marginRight: '40px',
        height: '60vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sidebarItem: {
        textDecoration: 'none',
        color: theme.palette.text.primary,
        lineHeight: '50px',
        fontSize: '16px',
        float: 'right',
    },
    sidebarItemSelected: {
        textDecoration: 'underline',
        color: theme.palette.text.primary,
        lineHeight: '50px',
        fontSize: '16px',
        float: 'right',
    },
    menus: {
        position: 'absolute',
        bottom: '20px',
    },
    menuItem: {
        textDecoration: 'none',
        color: theme.palette.text.primary,
        lineHeight: '30px',
    },
    underLogo: {
        marginLeft: '23%',
        marginTop: '10px',
        fontSize: '20px',
    },
    freelancerMenu: {
      marginTop: '20px',
    },
});

class Menu extends React.Component {

    render() {
        const { classes, currentMenu } = this.props;

        //Loading user from parent AppConnected...
        if (!this.props.user) {
            //to avoid having multiple loader at the same time
            return (<div />)
        }

        //if this is a freelancer
        let showFreelancerMenu = ((this.props.user.freelancerDatas || this.props.user.searchedFreelancers) && currentMenu !== '/unlockfreelancer') &&
            <div className={classes.freelancerMenu}>
                <Typography to="/">
                    <Link
                        onClick={() => this.props.dispatch(changeMenuClicked('/chronology', true))}
                        className={currentMenu === '/chronology' ? classes.sidebarItemSelected : classes.sidebarItem}
                        to={!this.props.user.searchedFreelancers ? "/chronology" : "/chronology?" + this.props.user.searchedFreelancers.ethAddress}
                    >
                        Certified resume
                    </Link>
                </Typography>
                <Typography to="/" style={{clear: "both"}}>
                    <Link
                        onClick={() => this.props.dispatch(changeMenuClicked('/competencies', true))}
                        className={currentMenu === '/competencies' ? classes.sidebarItemSelected : classes.sidebarItem}
                        to={!this.props.user.searchedFreelancers ? "/competencies" : "/competencies?" + this.props.user.searchedFreelancers.ethAddress}
                    >
                        Skills Rating
                    </Link>
                </Typography>
                <Typography to="/" style={{clear: "both"}}>
                    <Link to="#" className={classes.sidebarItem} style={{color: "lightgray"}}>
                        Diploma
                    </Link>
                </Typography>
                <Typography to="/" style={{clear: "both"}}>
                    <Link to="#" className={classes.sidebarItem} style={{color: "lightgray"}}>
                        Availability
                    </Link>
                </Typography>
                <Typography to="/" style={{clear: "both"}}>
                    <Link to="#" className={classes.sidebarItem} style={{color: "lightgray"}}>
                        Daily rate
                    </Link>
                </Typography>
            </div>
        let showDashboard = this.props.user.freelancerDatas &&
        <div>
            <Typography to="/" style={{clear: "both"}}>
                <Link
                    onClick={() => this.props.dispatch(changeMenuClicked('/dashboard', true))}
                    className={currentMenu === '/dashboard' ? classes.sidebarItemSelected : classes.sidebarItem}
                    to="/dashboard"
                >
                    Dashboard
                </Link>
            </Typography>
        </div>
        //if this is a client or a freelancer
        let showCreateVaultMenu = (this.props.user.ethAddress && !this.props.user.searchedFreelancers && currentMenu !== '/unlockfreelancer') &&
        <Typography to="/">
            <Link
                onClick={() => this.props.dispatch(changeMenuClicked('/register', true))}
                className={currentMenu === '/register' ? classes.sidebarItemSelected : classes.sidebarItem}
                to="/register"
            >
                {this.props.user.freelancerDatas ? 'Personal Information' : 'Create account'}
            </Link>
        </Typography>

        return (
            <div className={classes.root}>
                <div>
                    <Link to="/homepage" onClick={() => this.props.dispatch(changeMenuClicked('/homepage', true))} >
                        <img src={logoTalao} className={classes.logo} alt="Talao" />
                    </Link>
                    <Typography className={classes.underLogo}>Freelancer<br/>Dapp</Typography>
                </div>
                <div className={classes.sidebar}>
                    <div>
                        <Typography to="/">
                            <Link
                                onClick={() => { this.props.dispatch(changeMenuClicked('/homepage', true))}}
                                className={currentMenu === '/homepage' ? classes.sidebarItemSelected : classes.sidebarItem}
                                to="/homepage"
                            >
                                Home page
                            </Link>
                        </Typography>
                        {showCreateVaultMenu}
                        {showFreelancerMenu}
                        {showDashboard}
                    </div>
                </div>
                <div className={classes.menus}>
                    <Typography>
                        <a
                          className={classes.menuItem}
                          href="https://talao.io/talao-certified-resume-how-does-it-work/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          HOW DOES IT WORK ?
                        </a>
                    </Typography>
                    <Typography>
                        <a
                          className={classes.menuItem}
                          href="https://talao.io/talao-certified-resume-freedom-for-freelancers/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WHAT IS IT ?
                        </a>
                    </Typography>
                    <Typography>
                        <a
                          className={classes.menuItem}
                          href="https://talao.io/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          TALAO.IO
                        </a>
                    </Typography>
                    <Typography>
                        <a
                          className={classes.menuItem}
                          href="#TODO"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          ABOUT
                        </a>
                    </Typography>
                </div>
            </div>
        );
    }
}

export default compose(withStyles(styles), connect(mapStateToProps))(Menu);
