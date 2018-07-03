import React from 'react';
import Experience from '../experience/Experience';
import FreelancerService from '../../services/FreelancerService';
import Card from '@material-ui/core/Card';
import ColorService from '../../services/ColorService';
import { constants } from '../../constants';
import { Grid, withStyles, CardContent, Radio, FormControl, Input, InputLabel, FormControlLabel, TextField, InputAdornment, Typography } from '@material-ui/core';
import Button from 'material-ui/Button';
import LineStyle from '@material-ui/icons/LineStyle';
import Icon from '@material-ui/core/Icon';
import blue from '@material-ui/core/colors/blue';

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
        marginLeft: '20px',
        marginRight: '20px',
        width: '-webkit-fill-available',
    },
    formControl: {
        margin: '60px',
    },
    group: {
        margin: '20px 0',
    },
    chip: {
        margin: '20px',
        cursor: 'pointer',
    },
});

class Chronology extends React.Component {

    constructor() {
        super();
        this.state = {
            experiences: FreelancerService.getFreelancer().experiences,
            newExperience: false,
            type: 'job',
        };
        this.newExp = this.newExp.bind(this);
    }

    newExp() {
        this.setState({
            newExperience: !this.state.newExperience
        });
    }

    handleChangeType = event => {
        this.setState({ type: event.target.value });
    };

    render() {
        const experiences = this.state.experiences
            // Sort descending by date
            .sort((extendedExperienceA, extendedExperienceB) => {
                return extendedExperienceA.from < extendedExperienceB.from;
            })

            // Generate components
            .map((extendedExperience) => {
                const backgroundColorString = ColorService.getCompetencyColorName(extendedExperience, extendedExperience.confidenceIndex);
                const backgroundLightColorString = ColorService.getLightColorName(backgroundColorString);
                const textColorString = "text" + backgroundColorString[0].toUpperCase() + backgroundColorString.substring(1);
                return (
                    <Experience
                        value={extendedExperience}
                        key={extendedExperience.title}
                        color={backgroundColorString}
                        lightColor={backgroundLightColorString}
                        textColor={textColorString}
                    />
                );
            });
        return (
            <Card className={this.props.classes.card}>
                <CardContent>
                    <div onClick={this.newExp} className={this.props.classes.indicator} style={{ backgroundColor: constants.colors["primary"], color: constants.colors["textAccent2"] }}>
                        <span style={{ display: !this.state.newExperience ? 'inline-block' : 'none' }}>+</span>
                    </div>
                    <div className={this.props.classes.content} style={{ display: this.state.newExperience ? 'inline-block' : 'none' }}>
                        <Grid container spacing={40}>
                            <form className={this.props.classes.container} noValidate autoComplete="off">
                                <Grid item>
                                    <TextField
                                        id="from"
                                        label="From"
                                        type="date"
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
                                    <Button className={this.props.classes.certificatButton}>
                                        <LineStyle className={this.props.classes.rightIcon} />
                                        Add certificat
                                    </Button>
                                </Grid>
                                <Grid item xs={10}></Grid>
                                <Grid item xs={3}>
                                    <Typography className={this.props.classes.textField} variant="headline" component="p">
                                        Tags
                                    </Typography>
                                </Grid>
                                <Grid item xs={8}></Grid>
                                <Grid item xs={2}>
                                    <Button className={this.props.classes.certificatButton} type="submit" label="login">
                                        Submit
                                    </Button>
                                </Grid>
                            </form>
                        </Grid>
                    </div>
                    {experiences}
                </CardContent>
            </Card>
        );
    }
}

export default withStyles(styles)(Chronology);