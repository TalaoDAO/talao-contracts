import React from 'react';
import { withStyles } from '@material-ui/core';
import { constants } from '../../constants';
import { Grid, FormControl, Input, InputLabel, TextField, InputAdornment, Typography } from '@material-ui/core'; //Radio, FormControlLabel
import Button from '@material-ui/core/Button';
import LineStyle from '@material-ui/icons/LineStyle';
import Icon from '@material-ui/core/Icon';
import blue from '@material-ui/core/colors/blue';
import CompetencyTag from '../competencyTag/CompetencyTag';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import Experience from '../../models/Experience';
import { setNewExperienceInput, addDocument, newExperienceClicked, addCertificatClicked, detectCompetenciesFromCertification } from '../../actions/experience';

const styles = theme => ({
    root: {
        color: blue[600],
        '&$checked': {
            color: blue[500],
        },
    },
    checked: {},
    cssLabel: {
        '&$cssFocused': {
            color: blue[500],
        },
    },
    cssFocused: {},
    cssUnderline: {
        '&:after': {
            borderBottomColor: blue[500],
        },
    },
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
        border: '1px solid rgba(0, 0, 0, 0.23)',
    },
    content: {
        display: 'inline-block',
        verticalAlign: 'top',
        marginTop: '0px',
        marginLeft: '30px',
        marginBottom: '20px',
        padding: '20px 0px 20px 25px',
        borderLeft: '1px solid ' + theme.palette.grey[300],
    },
    card: {
        transition: 'all .4s ease',
        paddingBottom: '15px',
    },
    indicator: {
        display: 'inline-block',
        width: '20px',
        height: '20px',
        lineHeight: '20px',
        textAlign: 'center',
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '50%',
        cursor: 'pointer',
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        margin: '10px 20px',
        width: '-webkit-fill-available',
        color: theme.palette.primary,
    },
    textFieldNoExpand: {
        margin: '10px 20px',
        color: theme.palette.primary,
    },
    formControl: {
        margin: '60px',
    },
    timeLine: {
        display: 'inline-block',
        cursor: 'pointer',
    },
    timeContainer: {
        display: 'inline-block',
        paddingLeft: '5px',
        fontSize: '15px',
        verticalAlign: 'top',
    },
    line: {
        display: 'inline-block',
        borderTop: '6px solid ' + theme.palette.grey[300],
        borderRight: '6px solid transparent',
        width: '150px',
        paddingBottom: '3px',
    }
});

//map the redux store the the props component
const mapStateToProps = state => ({
    to: state.experienceReducer.to,
    toEmpty: state.experienceReducer.toEmpty,
    toBeforeFrom: state.experienceReducer.toBeforeFrom,
    from: state.experienceReducer.from,
    fromEmpty: state.experienceReducer.fromEmpty,
    title: state.experienceReducer.title,
    titleError: state.experienceReducer.titleError,
    titleEmpty: state.experienceReducer.titleEmpty,
    type: state.experienceReducer.type,
    description: state.experienceReducer.description,
    helperTextTooLong: state.experienceReducer.helperTextTooLong,
    helperTextEmpty: state.experienceReducer.helperTextEmpty,
    newExperience: state.experienceReducer.newExperience,
    formData: state.experienceReducer.formData,
    competencies: state.experienceReducer.competencies,
    confidenceIndex: state.experienceReducer.confidenceIndex,
    certificat: state.experienceReducer.certificat,
    uploadLoading: state.experienceReducer.uploadLoading,
    showTalaoButton: state.experienceReducer.showTalaoButton
  });

class NewExperience extends React.Component {

    render() {

        const { 
            to,
            toEmpty,
            toBeforeFrom,
            from, 
            fromEmpty,
            type,
            title, 
            description, 
            titleError, 
            titleEmpty,
            helperTextTooLong,
            helperTextEmpty,
            newExperience,
            certificat,
            confidenceIndex,
            competencies,
            formData,
            uploadLoading,     
            showTalaoButton
        } = this.props;

        const competencyTags = competencies.map((competency, index) =>
            (<CompetencyTag value={competency} key={index} />)
        );
        let showTalaoButt = showTalaoButton &&
        <Button className={this.props.classes.certificatButton}>
            I did not receive this certificate from Talao
        </Button>
        return (
            <div>
                <div>
                <div onClick={() => this.props.dispatch(newExperienceClicked(!newExperience))} className={this.props.classes.indicator} style={{ backgroundColor: constants.colors["primary"], color: constants.colors["textAccent2"] }}>
                        <span style={{ display: !newExperience ? 'inline-block' : 'none', fontSize: '30px' }}>+</span>
                        <span style={{ display: newExperience ? 'inline-block' : 'none', fontSize: '30px' }}>-</span>
                    </div>
                    <div style={{ display: !newExperience ? 'inline-block' : 'none' }} className={this.props.classes.timeLine} >
                        <div className={this.props.classes.line} style={{ width: (5 * 5) + 'px' }}></div>
                        <div className={this.props.classes.timeContainer}>
                            Add a new experience
                        </div>
                    </div>
                </div>
                <div className={this.props.classes.content} style={{ display: newExperience ? 'inline-block' : 'none' }}>
                    <Grid container spacing={40}>
                        <form className={this.props.classes.container} noValidate autoComplete="off">
                            <Grid item lg={3} xs={12}>
                                <TextField
                                    id="from"
                                    label="From"
                                    type="date"
                                    value={from}
                                    onChange={(event) => this.props.dispatch(setNewExperienceInput('from', to, event.target.value))}
                                    required
                                    error={fromEmpty}
                                    className={this.props.classes.textField}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Icon className={this.props.classes.icon} color="primary">
                                                    calendar_today
                                                    </Icon>
                                            </InputAdornment>
                                        ),
                                    }}
                                    InputLabelProps={{
                                        shrink: true
                                    }}>
                                </TextField>
                            </Grid>
                            <Grid item lg={3} xs={12}>
                                <TextField
                                    id="to"
                                    label="To"
                                    type="date"
                                    value={to}
                                    error={toEmpty || toBeforeFrom}
                                    onChange={(event) => this.props.dispatch(setNewExperienceInput('to', event.target.value, from))}
                                    required
                                    className={this.props.classes.textField}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Icon className={this.props.classes.icon} color="primary">
                                                    calendar_today
                                                    </Icon>
                                            </InputAdornment>
                                        ),
                                    }}
                                    InputLabelProps={{
                                        shrink: true
                                    }}
                                />
                            </Grid>
                            <Grid item lg={6}></Grid>
                            <Grid item lg={6} xs={12}>
                                    <TextField
                                        required
                                        type="text"
                                        value={title}
                                        error={titleError || titleEmpty}
                                        helperText={(!titleError && !titleEmpty) ? '' : (titleError) ? helperTextTooLong : helperTextEmpty}
                                        onChange={(event) => this.props.dispatch(setNewExperienceInput('title', event.target.value))}
                                        className={this.props.classes.textField}
                                        label="Title"
                                        id="title"
                                    />
                            </Grid>
                            <Grid item lg={9} xs={12}>
                                <FormControl className={this.props.classes.textField}>
                                    <InputLabel
                                        FormLabelClasses={{
                                            root: this.props.classes.cssLabel,
                                            focused: this.props.classes.cssFocused,
                                        }} htmlFor="custom-css-input">Description</InputLabel>
                                    <Input value={description} 
                                           onChange={(event) => this.props.dispatch(setNewExperienceInput('description', event.target.value))}
                                           multiline rows="4" classes={{ underline: this.props.classes.cssUnderline, }} id="custom-css-input" />
                                </FormControl>
                            </Grid>
                            <Grid item lg={3}></Grid>
                            <Grid item lg={6} xs={12}>
                                <Button onClick={() => this.props.dispatch(addCertificatClicked(this.fileInput))} className={this.props.classes.certificatButton}>
                                    <LineStyle />
                                    Add the certificate issued by my customer
                                </Button>
                                <input onChange={(e) => this.props.dispatch(detectCompetenciesFromCertification(e.target))} 
                                       style={{ display: 'none' }} 
                                       ref={fileInput => this.fileInput = fileInput} 
                                       type="file" accept="application/json" />
                            </Grid>
                            <Grid item lg={3}></Grid>
                            <Grid container direction="row" justify="flex-start" alignItems="center">
                                <Typography className={this.props.classes.textFieldNoExpand} variant="headline" component="p">
                                    Competencies
                                </Typography>
                                {showTalaoButt}
                            </Grid>
                            <Grid item lg={8} xs={12}>
                                <div className={this.props.classes.textField}>
                                    {competencyTags}
                                </div>
                            </Grid>
                            <Grid item lg={4}></Grid>
                            <Grid item lg={2} xs={12}>
                                <Button onClick={() => this.props.dispatch(
                                addDocument(formData,
                                this.props.user,
                                new Experience(
                                    '',
                                    title,
                                    description,
                                    new Date(from),
                                    new Date(to),
                                    competencies,
                                    certificat,
                                    confidenceIndex,
                                    type,
                                    competencies[0].jobDuration)))}  
                                    className={competencies.length > 0 && !toBeforeFrom && !titleEmpty && !titleError && !toEmpty && !fromEmpty && !uploadLoading ? this.props.classes.certificatButton : this.props.classes.certificatButtonDisabled} label="login">
                                    Submit
                                </Button>
                            </Grid>
                        </form>
                    </Grid>
                </div>
            </div>
        );
    }
}

export default compose(withStyles(styles), connect(mapStateToProps))(NewExperience);