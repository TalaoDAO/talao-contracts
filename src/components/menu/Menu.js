import React from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import logoTalao from '../../images/logo-talao.png';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { changeMenuClicked } from '../../actions/menu';
import { removeResearch } from '../../actions/user';

const mapStateToProps = state => ({  
    transactionError: state.transactionReducer.transactionError,
    transactionReceipt: state.transactionReducer.transactionReceipt,
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
        const { currentMenu } = this.props;

        //Loading user from parent AppConnected...
        if (!this.props.user) {
            //to avoid having multiple loader at the same time
            return (<div />)
        }

        //if this is a freelancer
        let showFreelancerMenu = ((this.props.user.freelancerDatas || this.props.user.searchedFreelancers) && currentMenu !== '/unlockfreelancer') &&
            <div>
                <Typography to="/">
                <Link 
                    onClick={() => this.props.dispatch(changeMenuClicked('/competencies', true))}
                    className={currentMenu === '/competencies' ? this.props.classes.sidebarItemSelected : this.props.classes.sidebarItem} 
                    to={!this.props.user.searchedFreelancers ? "/competencies" : "/competencies?" + this.props.user.searchedFreelancers.ethAddress}
                >
                    Competencies
                </Link>
                </Typography>
                <Typography to="/">
                    <Link 
                        onClick={() => this.props.dispatch(changeMenuClicked('/chronology', true))}
                        className={currentMenu === '/chronology' ? this.props.classes.sidebarItemSelected : this.props.classes.sidebarItem} 
                        to={!this.props.user.searchedFreelancers ? "/chronology" : "/chronology?" + this.props.user.searchedFreelancers.ethAddress}
                    >
                        Chronology
                    </Link>
                </Typography> 
            </div>  

        //if this is a client or a freelancer
        let showCreateVaultMenu = (this.props.user.ethAddress && !this.props.user.searchedFreelancers && currentMenu !== '/unlockfreelancer') &&
        <Typography to="/">
            <Link 
                onClick={() => this.props.dispatch(changeMenuClicked('/register', true))}
                className={currentMenu === '/register' ? this.props.classes.sidebarItemSelected : this.props.classes.sidebarItem} 
                to="/register"
            >
                {this.props.user.freelancerDatas ? 'Update vault' : 'Create vault'}
            </Link>
        </Typography>

        let showMyVaultMenu = ((this.props.user.freelancerDatas && this.props.user.searchedFreelancers) && currentMenu !== '/unlockfreelancer') && 
        <Typography to="/">
            <Link 
                onClick={() => { let usr = this.props.user; 
                                usr.searchedFreelancers = null; 
                                this.props.dispatch(removeResearch(usr)); 
                                this.props.dispatch(changeMenuClicked('/chronology', true));
                                //Nothing change here to redux and we need to forceUpdate to update the menu
                                this.forceUpdate();
                                }
                }
                className={this.props.classes.sidebarItem} 
                to="/chronology"
            >
                My vault
            </Link>
        </Typography>

        return (
            <div className={this.props.classes.root}>
                <div>
                    <Link to="/homepage" onClick={() => this.props.dispatch(changeMenuClicked('/homepage', true))} >
                        <img src={logoTalao} className={this.props.classes.logo} alt="Talao" />
                    </Link>
                </div>
                <div className={this.props.classes.sidebar}>
                    <div>
                        {showCreateVaultMenu}
                        {showMyVaultMenu}
                        {showFreelancerMenu}
                        <Typography to="/">
                        <Link 
                            onClick={() => { let usr = this.props.user; 
                                             usr.searchedFreelancers = null; 
                                             this.props.dispatch(removeResearch(usr)); 
                                             this.props.dispatch(changeMenuClicked('/homepage', true));
                                            }
                                    }
                            className={currentMenu === '/homepage' ? this.props.classes.sidebarItemSelected : this.props.classes.sidebarItem} 
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

export default compose(withStyles(styles), connect(mapStateToProps))(Menu);