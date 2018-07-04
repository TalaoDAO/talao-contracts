import React from 'react';
import { withStyles } from '@material-ui/core';
import { constants } from '../../constants';
import { Grid, Radio, FormControl, Input, InputLabel, FormControlLabel, TextField, InputAdornment, Typography } from '@material-ui/core';
import Button from 'material-ui/Button';
import LineStyle from '@material-ui/icons/LineStyle';
import Icon from '@material-ui/core/Icon';
import blue from '@material-ui/core/colors/blue';
import CompetencyTag from '../competencyTag/CompetencyTag';
import Competency from '../../models/Competency';

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
    content: {
        display: 'inline-block',
        verticalAlign: 'top',
        marginTop: '15px',
        marginLeft: '30px',
        marginBottom: '20px',
        paddingLeft: '50px',
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
    },
    formControl: {
        margin: '60px',
    },
    group: {
        margin: '20px 0',
    },
    chip: {
        margin: '20px 10px',
        cursor: 'pointer',
        color: '#fff',
        backgroundColor: blue[500],
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
    },
});

class NewExperience extends React.Component {

    constructor() {
        super();
        this.state = {
            newExperience: false,
            type: 'job',
            competencies: [],
        };
        this.newExp = this.newExp.bind(this);
        this.reader = new FileReader();
    }

    newExp() {
        this.setState({
            newExperience: !this.state.newExperience
        });
    }

    handleChangeType = event => {
        this.setState({ type: event.target.value });
    };

    triggerInputFile = () => this.fileInput.click();

    detectCompetenciesFromCertification(file) {
        let content;
        this.reader.onload = function (event) {
            content = event.target.result;
            var jsonContent = JSON.parse(content);
            Object.keys(jsonContent).forEach(key => {
                if (key.startsWith("jobSkill")) {
                    if (jsonContent[key] !== "") {
                        let number = key.substring(8);
                        let competencyName = jsonContent[key];
                        let rating = jsonContent["jobRating" + number];
                        let competency = new Competency(competencyName, rating * 20);
                        this.setState(prevState => ({
                            competencies: [...prevState.competencies, competency]
                        }))
                    }
                }
            });
            console.log(this.state.competencies);
        }.bind(this);
        this.reader.readAsText(file);
    }

    render() {
        const competencyTags = this.state.competencies.map((competency, index) =>
            (<CompetencyTag value={competency} key={index} />)
        );
        return (
            <div>
                <div>
                    <div onClick={this.newExp} className={this.props.classes.indicator} style={{ backgroundColor: constants.colors["primary"], color: constants.colors["textAccent2"] }}>
                        <span style={{ display: !this.state.newExperience ? 'inline-block' : 'none', fontSize: '30px' }}>+</span>
                    </div>
                    <div onClick={this.newExp} style={{ display: !this.state.newExperience ? 'inline-block' : 'none' }} className={this.props.classes.timeLine} >
                        <div className={this.props.classes.line} style={{ width: (5 * 5) + 'px' }}></div>
                        <div className={this.props.classes.timeContainer}>
                            Click here to add a new experience to your vault
                        </div>
                    </div>
                </div>
                <div className={this.props.classes.content} style={{ display: this.state.newExperience ? 'inline-block' : 'none' }}>
                    <Grid container spacing={40}>
                        <form className={this.props.classes.container} noValidate autoComplete="off">
                            <Grid item>
                                <TextField
                                    id="from"
                                    label="From"
                                    type="date"
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
                                        shrink: true,
                                    }}>
                                </TextField>
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    id="to"
                                    label="To"
                                    type="date"
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
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}></Grid>
                            <Grid item xs={6}>
                                <FormControl className={this.props.classes.textField}>
                                    <InputLabel
                                        required
                                        FormLabelClasses={{
                                            root: this.props.classes.cssLabel,
                                            focused: this.props.classes.cssFocused,
                                        }} htmlFor="custom-css-input">Title</InputLabel>
                                    <Input classes={{ underline: this.props.classes.cssUnderline, }} id="custom-css-input" />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl>
                                    <FormControlLabel control={
                                        <Radio
                                            checked={this.state.type === 'job'}
                                            onChange={this.handleChangeType}
                                            value="job"
                                            name="radio-button-demo"
                                            aria-label="C"
                                            classes={{
                                                root: this.props.classes.root,
                                                checked: this.props.classes.checked,
                                            }}
                                        />} label="Job" />
                                </FormControl>
                                <FormControl>
                                    <FormControlLabel control={
                                        <Radio
                                            checked={this.state.type === 'education'}
                                            onChange={this.handleChangeType}
                                            value="education"
                                            name="radio-button-demo"
                                            aria-label="C"
                                            classes={{
                                                root: this.props.classes.root,
                                                checked: this.props.classes.checked,
                                            }}
                                        />} label="Education" />
                                </FormControl>
                                <FormControl>
                                    <FormControlLabel control={
                                        <Radio
                                            checked={this.state.type === 'certification'}
                                            onChange={this.handleChangeType}
                                            value="certification"
                                            name="radio-button-demo"
                                            aria-label="C"
                                            classes={{
                                                root: this.props.classes.root,
                                                checked: this.props.classes.checked,
                                            }}
                                        />} label="Certification" />
                                </FormControl>
                            </Grid>
                            <Grid item xs={9}>
                                <FormControl className={this.props.classes.textField}>
                                    <InputLabel
                                        FormLabelClasses={{
                                            root: this.props.classes.cssLabel,
                                            focused: this.props.classes.cssFocused,
                                        }} htmlFor="custom-css-input">Description</InputLabel>
                                    <Input multiline rows="4" classes={{ underline: this.props.classes.cssUnderline, }} id="custom-css-input" />
                                </FormControl>
                            </Grid>
                            <Grid item xs={3}></Grid>
                            <Grid item xs={3}>
                                <Button onClick={this.triggerInputFile} className={this.props.classes.certificatButton}>
                                    <LineStyle />
                                    Add certificat
                                </Button>
                                <input onChange={(e) => this.detectCompetenciesFromCertification(e.target.files[0])} style={{ display: 'none' }} ref={fileInput => this.fileInput = fileInput} type="file" accept="application/json" />
                            </Grid>
                            <Grid item xs={10}></Grid>
                            <Grid item xs={8}>
                                <Typography className={this.props.classes.textField} variant="headline" component="p">
                                    Competencies
                                </Typography>
                                <div className={this.props.classes.textField}>
                                    {competencyTags}
                                </div>
                            </Grid>
                            <Grid item xs={4}></Grid>
                            <Grid item xs={2}>
                                <Button className={this.props.classes.certificatButton} type="submit" label="login">
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

export default withStyles(styles)(NewExperience);