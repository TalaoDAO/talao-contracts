import React from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import logoTalao from '../../images/logo-talao.png';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { changeMenuClicked } from '../../actions/menu';

const Loading = require('react-loading-animation');

const mapStateToProps = state => ({  
    transactionError: state.transactionReducer.transactionError,
    transactionReceipt: state.transactionReducer.transactionReceipt,
    currentMenu: state.menuReducer.selectedMenu,
    transaction: state.transactionReducer.transaction
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

    render() {
        const { transactionError, transactionReceipt, transaction, currentMenu } = this.props;

        //Loading user from parent AppConnected...
        if (!this.props.user) {
            return (<Loading />)
        }

        //if this is a freelancer
        let showFreelancerMenu = (this.props.user.freelancerDatas && !transaction) &&
            <div>
                <Typography to="/">
                <Link 
                    onClick={() => this.props.dispatch(changeMenuClicked('/competencies'))}
                    className={currentMenu === '/competencies' ? this.props.classes.sidebarItemSelected : this.props.classes.sidebarItem} 
                    to={"/competencies"}
                >
                    Competencies
                </Link>
                </Typography>
                <Typography to="/">
                    <Link 
                        onClick={() => this.props.dispatch(changeMenuClicked('/chronology'))}
                        className={currentMenu === '/chronology' ? this.props.classes.sidebarItemSelected : this.props.classes.sidebarItem} 
                        to={"/chronology"}
                    >
                        Chronology
                    </Link>
                </Typography> 
            </div>  
        
        //if there are transactions
        let showTransactionMenu = (transactionReceipt || transactionError) &&
        <Typography to="/">
            <Link 
                onClick={() => this.props.dispatch(changeMenuClicked('/transaction'))}
                className={currentMenu === '/transaction' ? this.props.classes.sidebarItemSelected : this.props.classes.sidebarItem} 
                to="/transaction"
            >
            Last transaction
            </Link>
        </Typography>

        //if this is a client or a freelancer
        let showCreateVaultMenu = (this.props.user.ethAddress  && !transaction) &&
        <Typography to="/">
            <Link 
                onClick={() => this.props.dispatch(changeMenuClicked('/register'))}
                className={currentMenu === '/register' ? this.props.classes.sidebarItemSelected : this.props.classes.sidebarItem} 
                to="/register"
            >
                {this.props.user.freelancerDatas ? 'Update vault' : 'Create vault'}
            </Link>
        </Typography>

        let showHomePageMenu = (!transaction) &&
        <Typography to="/">
        <Link 
            onClick={() => this.props.dispatch(changeMenuClicked('/homepage'))}
            className={currentMenu === '/homepage' ? this.props.classes.sidebarItemSelected : this.props.classes.sidebarItem} 
            to="/homepage"
        >
            Homepage
        </Link>
        </Typography>

        return (
            <div className={this.props.classes.root}>
                <div>
                    {(transaction) 
                    ?
                        <img src={logoTalao} className={this.props.classes.logo} alt="Talao" />
                    :
                        <Link to="/homepage" onClick={() => this.props.dispatch(changeMenuClicked('/homepage'))} >
                            <img src={logoTalao} className={this.props.classes.logo} alt="Talao" />
                        </Link>
                    }
                </div>
                <div className={this.props.classes.sidebar}>
                    <div>
                        {showTransactionMenu}
                        {showCreateVaultMenu}
                        {showFreelancerMenu}
                        {showHomePageMenu}
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

export default compose(withStyles(styles), connect(mapStateToProps))(Menu);