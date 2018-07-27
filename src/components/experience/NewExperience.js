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
import Experience from '../../models/Experience';
import IpfsApi from 'ipfs-api';
import buffer from 'buffer';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { addDocToFreelancer } from '../../actions/experience';

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
        // borderColor: theme.palette.grey[300],
        // borderWidth: '10px',
        // borderStyle: 'solid',
        // borderRadius: '50px',
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
    },
});

class NewExperience extends React.Component {

    constructor() {
        super();
        this.state = {
            newExperience: false,
            from: '',
            to: '',
            title: '',
            type: '4',
            description: '',
            competencies: [],
            certificat: '',
            confidenceIndex: 80,
            uploadedDocument: '',

            helperTextTooLong: 'Maximum length: 30 characters',
        };
        this.newExp = this.newExp.bind(this);
        this.submit = this.submit.bind(this);
        this.reader = new FileReader();
        this.ipfsApi = IpfsApi(
            process.env.REACT_APP_IPFS_API,
            5001,
            { protocol: 'http' }
        );
    }

    componentDidMount() {
       // this.props.dispatch(createVault());
    }
    newExp() {
        this.setState({
            newExperience: !this.state.newExperience
        });
    }

    triggerInputFile = () => this.fileInput.click();

    detectCompetenciesFromCertification(event) {
        let file = event.files[0];
        event.value = null;
        if (typeof file === 'undefined') return;
        if (this.state.certificat !== '') {
            this.setState({
                competencies: [],
            })
        }
        this.setState({ certificat: file.name });
        let content;
        this.reader.onload = function (event) {
            content = event.target.result;
            var jsonContent = JSON.parse(content);
            this.setState({ uploadedDocument: content });

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
        }.bind(this);
        this.reader.readAsText(file);
    }

    handleFromChange = event => {
        this.setState({ from: event.target.value });
    }
    handleToChange = event => {
        this.setState({ to: event.target.value });
    }
    handleTitleChange = event => {
        this.setState({ title: event.target.value });
    }
    handleTypeChange = event => {
        this.setState({ type: event.target.value });
    };
    handleDescriptionChange = event => {
        this.setState({ description: event.target.value });
    };

    isTextLimitRespected(text) {
        return text.length < 30;
    }

    canSubmit() {
        return (
            this.isTextLimitRespected(this.state.title) &&
            this.state.title.length > 0 &&
            this.state.from.length > 0 &&
            this.state.to.length > 0 &&
            this.state.competencies.length > 0
        );
    }

    submit() {
        if(!this.canSubmit()) return;
        // send document to ipfs
        if (this.state.uploadedDocument === null || this.state.uploadedDocument.length === 0) {
            alert("No document uploaded. Please add a document.");
            return;
        }
        this.uploadToIpfs(this.state.uploadedDocument).then(result => {
            let newExperienceToAdd = new Experience(
                result[0].path,
                this.state.title,
                this.state.description,
                new Date(this.state.from),
                new Date(this.state.to),
                this.state.competencies,
                this.state.certificat,
                this.state.confidenceIndex,
                this.state.type
            );
            this.props.dispatch(addDocToFreelancer(this.props.user, newExperienceToAdd));
            //this.resetState();
        },
            err => alert("An error has occured when uploading your document to ipfs (ERR: " + err + ")")
        );
    }

    uploadToIpfs(documentToUpload) {
        return new Promise((resolve, reject) => {
            try {
                const arrayBuffer = buffer.Buffer(documentToUpload);
                this.ipfsApi.files.add(arrayBuffer, (err, result) => { // Upload buffer to IPFS
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });
            }
            catch (e) {
                reject(e)
            }
        });
    }

   /* resetState() {
        this.setState({
            newExperience: false,
            from: '',
            to: '',
            title: '',
            type: '4',
            description: '',
            competencies: [],
            certificat: '',
            confidenceIndex: 80,
            uploadedDocument: '',
        });
    }*/

    render() {
        const competencyTags = this.state.competencies.map((competency, index) =>
            (<CompetencyTag value={competency} key={index} />)
        );
        return (
            <div>
                <div>
                    <div onClick={this.newExp} className={this.props.classes.indicator} style={{ backgroundColor: constants.colors["primary"], color: constants.colors["textAccent2"] }}>
                        <span style={{ display: !this.state.newExperience ? 'inline-block' : 'none', fontSize: '30px' }}>+</span>
                        <span style={{ display: this.state.newExperience ? 'inline-block' : 'none', fontSize: '30px' }}>-</span>
                    </div>
                    <div onClick={this.newExp} style={{ display: !this.state.newExperience ? 'inline-block' : 'none' }} className={this.props.classes.timeLine} >
                        <div className={this.props.classes.line} style={{ width: (5 * 5) + 'px' }}></div>
                        <div className={this.props.classes.timeContainer}>
                            Add a new experience
                        </div>
                    </div>
                </div>
                <div className={this.props.classes.content} style={{ display: this.state.newExperience ? 'inline-block' : 'none' }}>
                    <Grid container spacing={40}>
                        <form className={this.props.classes.container} noValidate autoComplete="off">
                            <Grid item lg={3} xs={12}>
                                <TextField
                                    id="from"
                                    label="From"
                                    type="date"
                                    value={this.state.from}
                                    onChange={this.handleFromChange}
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
                            <Grid item lg={3} xs={12}>
                                <TextField
                                    id="to"
                                    label="To"
                                    type="date"
                                    value={this.state.to}
                                    onChange={this.handleToChange}
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
                            <Grid item lg={6}></Grid>
                            <Grid item lg={6} xs={12}>
                                    <TextField
                                        required
                                        type="text"
                                        value={this.state.title}
                                        error={!this.isTextLimitRespected(this.state.title)}
                                        helperText={this.isTextLimitRespected(this.state.title) ? '' : this.state.helperTextTooLong}
                                        onChange={this.handleTitleChange}
                                        className={this.props.classes.textField}
                                        label="Title"
                                        id="title"
                                    />
                            </Grid>
                            <Grid item lg={6} xs={12} className={this.props.classes.textField}>
                                <FormControl>
                                    <FormControlLabel control={
                                        <Radio
                                            checked={this.state.type === '4'}
                                            onChange={this.handleTypeChange}
                                            value="4"
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
                                            checked={this.state.type === '2'}
                                            onChange={this.handleTypeChange}
                                            value="2"
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
                                            checked={this.state.type === '3'}
                                            onChange={this.handleTypeChange}
                                            value="3"
                                            name="radio-button-demo"
                                            aria-label="C"
                                            classes={{
                                                root: this.props.classes.root,
                                                checked: this.props.classes.checked,
                                            }}
                                        />} label="Certification" />
                                </FormControl>
                            </Grid>
                            <Grid item lg={9} xs={12}>
                                <FormControl className={this.props.classes.textField}>
                                    <InputLabel
                                        FormLabelClasses={{
                                            root: this.props.classes.cssLabel,
                                            focused: this.props.classes.cssFocused,
                                        }} htmlFor="custom-css-input">Description</InputLabel>
                                    <Input value={this.state.description} onChange={this.handleDescriptionChange} multiline rows="4" classes={{ underline: this.props.classes.cssUnderline, }} id="custom-css-input" />
                                </FormControl>
                            </Grid>
                            <Grid item lg={3}></Grid>
                            <Grid item lg={3} xs={12}>
                                <Button onClick={this.triggerInputFile} className={this.props.classes.certificatButton}>
                                    <LineStyle />
                                    Add certificat
                                </Button>
                                <input onChange={(e) => this.detectCompetenciesFromCertification(e.target)} style={{ display: 'none' }} ref={fileInput => this.fileInput = fileInput} type="file" accept="application/json" />
                            </Grid>
                            <Grid item lg={10}></Grid>
                            <Grid item lg={8} xs={12}>
                                <Typography className={this.props.classes.textField} variant="headline" component="p">
                                    Competencies
                                </Typography>
                                <div className={this.props.classes.textField}>
                                    {competencyTags}
                                </div>
                            </Grid>
                            <Grid item lg={4}></Grid>
                            <Grid item lg={2} xs={12}>
                                <Button onClick={this.submit} className={this.canSubmit() ? this.props.classes.certificatButton : this.props.classes.certificatButtonDisabled} label="login">
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

export default compose(withStyles(styles), connect())(NewExperience);