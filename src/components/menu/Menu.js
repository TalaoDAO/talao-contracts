import React from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import logoTalao from '../../images/logo-talao.png';
import FreelancerService from '../../services/FreelancerService';

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
    menus: {
        position: 'absolute',
        bottom: '20px',
    },
    menuItem: {
        textDecoration: 'none',
        color: theme.palette.text.primary,
        lineHeight: '30px',
    },
    menuItemSelected: {
        textDecoration: 'underline',
        color: theme.palette.text.primary,
        lineHeight: '30px',
    },
});

class Menu extends React.Component {
    constructor(props) {
        super(props);
        this.free = FreelancerService.getFreelancer();
    }

    componentDidMount() {
        this.free.addListener('FreeDataChanged', this.handleEvents, this);  
    }

    componentWillUnmount() {
        this.free.removeListener('FreeDataChanged', this.handleEvents, this);
    }

    handleEvents = () => {
        this.free = FreelancerService.getFreelancer();
        this.forceUpdate();
    };

    render() {
        return (
            <div className={this.props.classes.root}>
                <div>
                    <Link to="/">
                        <img src={logoTalao} className={this.props.classes.logo} alt="Talao" />
                    </Link>
                </div>
                <div className={this.props.classes.sidebar}>
                    <div>
                    <Typography to="/">
                        <Link style={{display: this.free.isFreelancer() && this.free.isVaultCreated ? 'block' : 'none' }} className={this.props.classes.sidebarItem} to="/competencies">Competencies</Link>
                    </Typography>
                    <Typography to="/">
                        <Link style={{display: this.free.isFreelancer() && this.free.isVaultCreated ? 'block' : 'none' }} className={this.props.classes.sidebarItem} to="/chronology">Chronology</Link>
                    </Typography>
                    <Typography to="/">
                        <Link style={{display: this.free.isFreelancer() ? 'none' : 'block' }} className={this.props.classes.sidebarItem} to="/homepage">Homepage</Link>
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