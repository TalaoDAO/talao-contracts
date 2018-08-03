import React from 'react';
import Card from '@material-ui/core/Card';
import { withStyles, CardContent } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Divider } from '../../../node_modules/material-ui';
//import { changeMenu } from '../../actions/menu';

const ETHERSCANURL = (process.env.NODE_ENV === 'production') ? "https://etherscan.io/tx/" : "https://ropsten.etherscan.io/tx/";

const styles = theme => ({
    card: {
        flexBasis: 'auto',
        marginRight: '20px',
        marginBottom: '20px',
    },
    container: {
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    title: {
        color: theme.palette.text.primary,
        lineHeight: '50px',
        fontSize: '30px',
        display: 'inlin-block',
    },
    center: {
        textAlign: 'center',
    },
    marginDivider: {
        marginTop: '10px'
    }
});

const mapStateToProps = state => ({
    transactionError: state.transactionReducer.transactionError,
    transactionHash: state.transactionReducer.transactionHash, 
    transactionReceipt: state.transactionReducer.transactionReceipt, 
  });

class Transaction extends React.Component {
  /*  componentDidMount() {
        if(!this.props.transactionError && !this.props.transactionHash && !this.props.transactionReceipt) {
            this.props.history.push('Homepage');
            this.props.dispatch(changeMenu('/homepage'));
        }*/
   // }

    render() {
        const { transactionError, transactionHash, transactionReceipt } = this.props;
        return (
            <Grid container className={this.props.classes.container}>
                <Grid item xs={12} lg={12}>
                    <Card className={this.props.classes.card}>
                        <CardContent>
                            {(!transactionHash && !transactionReceipt && !transactionError) && 
                            <div className={this.props.classes.center}>
                                <p className={this.props.classes.title}>Transaction waiting your validation...</p>
                            </div>
                            }
                            {(!transactionReceipt && !transactionError && transactionHash) && 
                            <div className={this.props.classes.center}>
                                <p className={this.props.classes.title}>Transaction pending...</p>
                            </div>
                            }
                            {(!transactionReceipt && !transactionError) && <LinearProgress />}
                            {(transactionHash) && 
                                <div className={this.props.classes.center}>
                                    <p className={this.props.classes.title}>Transaction Hash : </p>
                                    <p>{transactionHash}</p>
                                    <a href={ETHERSCANURL + transactionHash} target="_blank">Follow your transaction on etherscan !</a>
                                </div>
                            }
                            {(transactionReceipt) && 
                                <div>
                                    <Divider className={this.props.classes.marginDivider}/>
                                    <div className={this.props.classes.center}>
                                        <p className={this.props.classes.title}>Transaction receipt</p>
                                        <p color='success'>Status : SUCCESS</p>
                                        <p>Gas used : {transactionReceipt.gasUsed}</p>
                                        <p>Block number : {transactionReceipt.blockNumber}</p>
                                        <p>From : {transactionReceipt.from}</p>
                                        <p>To : {transactionReceipt.to}</p>
                                    </div>
                                </div>
                            }
                            {(transactionError) && 
                                <div className={this.props.classes.center}>
                                    <p className={this.props.classes.title}>Transaction error</p>
                                    <p>{transactionError.message}</p>
                                </div>
                            }
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    }
}

export default compose(withStyles(styles), connect(mapStateToProps))(Transaction);