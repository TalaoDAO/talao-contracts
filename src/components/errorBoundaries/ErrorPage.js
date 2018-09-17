import React from 'react';
import Card from '@material-ui/core/Card';
import { withStyles, CardContent } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
    certificatButton: {
        margin: '20px',
        backgroundColor: '#3b3838',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#3b3838'
        }
    },
    certificatButtonDisabled: {
        margin: '20px',
        color: 'rgba(0, 0, 0, 0.26)',
        backgroundColor: '#f2f2f2',
        cursor: 'default',
        pointerEvents: 'none',
        border: '1px solid rgba(0, 0, 0, 0.23)'
    },
    card: {
        flexBasis: 'auto',
        margin: '20px'
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
    }
});

class ErrorPage extends React.Component {

    constructor(props) {
        super(props);
        this.handleClickToHomepage.bind(this);
    }

    handleClickToHomepage() {
        this.props.history.push('/homepage');
    }

    render() {
        return (
            <Grid container className={this.props.classes.container}>
                <Grid item xs={12} lg={12}>
                    <Card className={this.props.classes.card}>
                        <CardContent>
                            <div className={this.props.classes.center}>
                                <p className={this.props.classes.title}>An unhandled exception occurred</p>
                            </div>
                            <div>
                                <p>{this.props.error.message}</p>
                            </div>
                            <div>
                                <p>{this.props.error.stack}</p>
                            </div>
                            <div>
                                <p>{this.props.componentStack}</p>
                            </div>
                            <div className={this.props.classes.center}>
                                <Button onClick={() => this.props.handleClickToHomepage()} className={this.props.classes.certificatButton} label="homepage">
                                    Back to homepage
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(ErrorPage);