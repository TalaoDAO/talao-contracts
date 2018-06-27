import React from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import logoTalao from '../../images/logo-talao.png';

const styles = theme => ({
    root: {
        marginLeft: '20px',
        height: '100vh',
    },
    logo: {
        marginTop: '20px',
        width: '60%',
    },
    menus: {
        position: 'absolute',
        bottom: '20px',
    },
    menuItem: {
        textDecoration: 'none',
        color: theme.palette.text.primary,
        lineHeight: '30px',
    }
});

class Menu extends React.Component {
    render() {
        return (
            <div className={this.props.classes.root}>
                <div>
                    <Link to="/">
                        <img src={logoTalao} className={this.props.classes.logo} alt="Talao" />
                    </Link>
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