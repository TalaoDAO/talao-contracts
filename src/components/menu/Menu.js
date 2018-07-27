import React from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import logoTalao from '../../images/logo-talao.png';

const Loading = require('react-loading-animation');

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
        height: '50vh',
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
});

class Menu extends React.Component {

    //No redux here for now...
    constructor() {
        super();
        this.state = { currentMenu: window.location.pathname }
        this.handleMenuChange = this.handleMenuChange.bind(this);
    }

    handleMenuChange(location) {
        this.setState({currentMenu: location})
    }

    render() {
        //Loading user from parent AppConnected...
        if (!this.props.user) {
            return (<Loading />)
        }

        let showFreelancerMenu = (this.props.user.freelancerDatas) ?
            <div>
                <Typography to="/">
                <Link 
                    onClick={() => this.handleMenuChange('/competencies')}
                    className={this.state.currentMenu === '/competencies' ? this.props.classes.sidebarItemSelected : this.props.classes.sidebarItem} 
                    to={"/competencies?" + this.props.user.ethAddress}
                >
                    Competencies
                </Link>
                </Typography>
                <Typography to="/">
                    <Link 
                        onClick={() => this.handleMenuChange('/chronology')}
                        className={this.state.currentMenu === '/chronology' ? this.props.classes.sidebarItemSelected : this.props.classes.sidebarItem} 
                        to={"/chronology?" + this.props.user.ethAddress}
                    >
                        Chronology
                    </Link>
                </Typography> 
            </div>  : null      
        return (
            <div className={this.props.classes.root}>
                <div>
                    <Link to="/homepage" onClick={() => this.handleMenuChange('/homepage')} >
                        <img src={logoTalao} className={this.props.classes.logo} alt="Talao" />
                    </Link>
                </div>
                <div className={this.props.classes.sidebar}>
                    <div>
                    <Typography to="/">
                        <Link 
                            onClick={() => this.handleMenuChange('/register')}
                            className={this.state.currentMenu === '/register' ? this.props.classes.sidebarItemSelected : this.props.classes.sidebarItem} 
                            to="/register"
                        >
                            {this.props.user.freelancerDatas ? 'Update vault' : 'Create vault'}
                        </Link>
                    </Typography>
                    {showFreelancerMenu}
                    <Typography to="/">
                        <Link 
                            onClick={() => this.handleMenuChange('/homepage')}
                            className={this.state.currentMenu === '/homepage' ? this.props.classes.sidebarItemSelected : this.props.classes.sidebarItem} 
                            to="/homepage"
                        >
                            Homepage
                        </Link>
                    </Typography>
                    </div>
                </div>
                <div className={this.props.classes.menus}>
                    <Typography>
                        <a className={this.props.classes.menuItem} href="#TODO">TALAO DAO</a>
                    </Typography>
                    <Typography>
                        <a className={this.props.classes.menuItem} href="#TODO">ABOUT</a>
                    </Typography>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(Menu);