import React from 'react';
import { withStyles } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import { Grid, CardContent, Button, FormControl, Input, InputLabel, TextField, InputAdornment, FormHelperText } from '@material-ui/core'; //Radio, FormControlLabel
import Skills from '../skills/Skills';
import Icon from '@material-ui/core/Icon';
import blue from '@material-ui/core/colors/blue';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

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
    selectEmpty: {
        marginTop: theme.spacing.unit * 2
    }
});

//map the redux store the the props component
const mapStateToProps = state => ({

  });

class Certificat extends React.Component {
    constructor(props) {
        super(props);
        this.state = { skills: []};
        this.handleNbrSkillsChange = this.handleNbrSkillsChange.bind(this);
    }

    handleNbrSkillsChange() {
        if (this.state.skills.length < 10) {
            let s = this.state.skills;
            s.push(new Skills());
            this.setState({skills: s});
        }
    }

    render() {
        this.state.skills.map((skill) => {
            return (
                <Experience
                    user={freelancer}
                />
            );
        });
        return (
            <Grid container spacing={24}>
                <Grid item xs={12}>
                    <Card className={this.props.classes.card}>
                        <CardContent>
                            <div className={this.props.classes.content}>
                                <Grid container spacing={40}>
                                    <form className={this.props.classes.container} noValidate autoComplete="off">
                                        <Grid item lg={3} xs={12}>
                                            <TextField
                                                id="from"
                                                label="From"
                                                type="date"
                                                //value={from}
                                                //onChange={(event) => this.props.dispatch(setNewExperienceInput('from', to, event.target.value))}
                                                required
                                                //error={fromEmpty}
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
                                                //value={to}
                                                //error={toEmpty || toBeforeFrom}
                                                //onChange={(event) => this.props.dispatch(setNewExperienceInput('to', event.target.value, from))}
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
                                                    //value={title}
                                                    //error={titleError || titleEmpty}
                                                    //helperText={(!titleError && !titleEmpty) ? '' : (titleError) ? helperTextTooLong : helperTextEmpty}
                                                // onChange={(event) => this.props.dispatch(setNewExperienceInput('title', event.target.value))}
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
                                                <Input //value={description} 
                                                    //onChange={(event) => this.props.dispatch(setNewExperienceInput('description', event.target.value))}
                                                    multiline rows="4" classes={{ underline: this.props.classes.cssUnderline, }} id="custom-css-input" />
                                            </FormControl>
                                        </Grid>
                                        <Grid item lg={6} xs={12}>
                                            <FormControl required className={this.props.classes.textField}>
                                                <InputLabel htmlFor="age-required">Age</InputLabel>
                                                <Select
                                                    //value={this.state.age}
                                                // onChange={this.handleChange}
                                                    name="age"
                                                    inputProps={{
                                                    id: 'age-required',
                                                    }}
                                                   // className={this.props.classes.selectEmpty}
                                                >
                                                    <MenuItem value="">
                                                    <em>None</em>
                                                    </MenuItem>
                                                    <MenuItem value={10}>Ten</MenuItem>
                                                    <MenuItem value={20}>Twenty</MenuItem>
                                                    <MenuItem value={30}>Thirty</MenuItem>
                                                </Select>
                                                <FormHelperText>Required</FormHelperText>
                                            </FormControl>
                                        </Grid>
                                        <Grid item lg={2} xs={12}>
                                            <FormControl required className={this.props.classes.textField}>
                                                <Button className={this.props.classes.certificatButton} onClick={() =>this.handleNbrSkillsChange()}>Add skills</Button>
                                            </FormControl>
                                        </Grid>
                                        <Grid item lg={2} xs={12}>
                                        </Grid>
                                    </form>
                                </Grid>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>      
            </Grid>
        );
    }
}

export default compose(withStyles(styles), connect(mapStateToProps))(Certificat);