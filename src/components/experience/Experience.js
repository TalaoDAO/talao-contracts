import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { constants } from '../../constants';
import Typography from '@material-ui/core/Typography';
import CompetencyTag from '../competencyTag/CompetencyTag';
import DateService from '../../services/DateService';
import LineStyle from '@material-ui/icons/LineStyle';
import Close from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';
import { Blockcerts } from 'react-blockcerts';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'
import Grid from '@material-ui/core/Grid';
import { removeDocToFreelancer } from '../../actions/experience';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { isMobile } from 'react-device-detect';
import talaoCertificateImage from '../../images/talaoCertificateImage';

const Loading = require('react-loading-animation');
const styles = theme => ({
    experienceContainer: {
        marginBottom: '30px',
    },
    timeLine: {
        display: 'inline-block',
    },
    indicator: {
        display: 'inline-block',
        width: '20px',
        height: '20px',
        lineHeight: '20px',
        textAlign: 'center',
        padding: '20px',
        borderRadius: '50%',
    },
    line: {
        display: 'inline-block',
        borderTop: '6px solid ' + theme.palette.grey[300],
        borderRight: '6px solid transparent',
        width: '150px',
        paddingBottom: '3px',
    },
    timeContainer: {
        display: 'inline-block',
        paddingLeft: '5px',
        fontSize: '15px',
        color: theme.palette.grey[500],
        verticalAlign: 'top',
    },
    dateContainer: {
        color: theme.palette.grey[500],
        marginLeft: '80px',
        marginTop: '-10px',
        fontSize: '14px',
        fontWeight: '100',
    },
    content: {
        display: 'inline-block',
        verticalAlign: 'top',
        marginTop: '15px',
        marginLeft: '30px',
        paddingLeft: '50px',
        borderLeft: '1px solid ' + theme.palette.grey[300],
        width: '80%',
    },
    description: {
        marginTop: '15px',
    },
    certificatButton: {
        margin: '20px 0px',
        backgroundColor: '#3b3838',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#3b3838'
        }
    },
    removeButton: {
        margin: '20px 0px',
        backgroundColor: '#FF3C47',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#FF3C47'
        }
    },
    popup: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        width: '70vw',
        padding: '30px',
        textAlign: 'center',
        background: '#fff',
        borderRadius: '10px',
        boxShadow: '0 20px 75px rgba(0, 0, 0, 0.13)',
        color: '#666',
    },
});

const mapStateToProps = state => ({
    user: state.userReducer.user
  });

class Experience extends React.Component {

    constructor(props) {
        super(props);
        this.state = { showCert: false };
        this.showCertification = this.showCertification.bind(this);
    }
    
    showCertification() {
        this.setState({ showCert: !this.state.showCert });
    }

    removeDocument = () => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className={this.props.classes.popup}>
                        <h1>Remove {this.props.value.title} certificate?</h1>
                        <p>Are you sure you want to remove this certificate?</p>
                        <Button style={{ marginRight: '20px' }} className={this.props.classes.certificatButton} onClick={onClose}>No</Button>
                        <Button className={this.props.classes.removeButton} onClick={() => {
                            this.props.dispatch(removeDocToFreelancer(this.props.user, this.props.value));
                            onClose()
                        }}>Yes</Button>
                    </div>
                )
            }
        })
    }

    render() {
        let competencyTags;
        let dateDiff;
        let monthDiff;

        if (!this.props.user) {
            return (<Loading />);
        } else {
            competencyTags = this.props.value.competencies.map((competency, index) =>
                (<CompetencyTag value={competency} key={index} />)
            );
            dateDiff = DateService.dateDiffAsString(this.props.value.from, this.props.value.to);
            monthDiff = DateService.monthDiff(this.props.value.from, this.props.value.to);
        }
        return (
            <div className={this.props.classes.experienceContainer}>
                <div>
                    <div className={this.props.classes.indicator} style={{ backgroundColor: constants.colors[this.props.lightColor], color: constants.colors[this.props.textColor] }}>
                        &nbsp;
                    </div>
                    <div className={this.props.classes.timeLine} >
                        <div className={this.props.classes.line} style={{ width: (isMobile) ? '28px' : (monthDiff >= 120) ? (120 * 5) + 'px' : (monthDiff * 5) + 'px' }}></div>
                        <div className={this.props.classes.timeContainer}>
                            {dateDiff}
                        </div>
                    </div>
                    <div className={this.props.classes.dateContainer}>
                        {DateService.getMonthYearDate(this.props.value.from)} -{' '}
                        {DateService.getMonthYearDate(this.props.value.to)}
                    </div>
                </div>
                <div>
                    <div className={this.props.classes.content}>
                        <Typography variant="headline" gutterBottom>
                            {this.props.value.title}
                        </Typography>
                        {competencyTags}
                        <Typography variant="body1" gutterBottom className={this.props.classes.description}>
                            {this.props.value.description}
                        </Typography>
                        <Grid item xs={12}>
                            <Button onClick={this.removeDocument} style={{ display: !this.props.user.searchedFreelancers ? 'inline-flex' : 'none' }} className={this.props.classes.removeButton}>
                                <Close />
                                <span>Remove</span>
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button onClick={this.showCertification} className={this.props.classes.certificatButton}>
                                <LineStyle />
                                <span style={{ display: !this.state.showCert ? 'inline-block' : 'none' }}>View certificat</span>
                                <span style={{ display: this.state.showCert ? 'inline-block' : 'none' }}>Hide certificat</span>
                            </Button>
                        </Grid>
                        <div style={{ display: this.state.showCert ? 'block' : 'none' }}>
                            <Blockcerts url={this.props.value.certificat} key={this.props.value.certificat} image={talaoCertificateImage} color='#282828' color_bg='#edecec'/>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default compose(withStyles(styles), connect(mapStateToProps))(Experience);