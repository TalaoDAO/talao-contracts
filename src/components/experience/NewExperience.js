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
import FreelancerService from '../../services/FreelancerService';
import IpfsApi from 'ipfs-api';
import buffer from 'buffer';

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
            from: '',
            to: '',
            title: '',
            type: '4',
            description: '',
            competencies: [],
            certificat: '',
            confidenceIndex: 80,
            uploadedDocument: '',
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

    newExp() {
        this.setState({
            newExperience: !this.state.newExperience
        });
    }

    triggerInputFile = () => this.fileInput.click();

    detectCompetenciesFromCertification(file) {
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
        console.log(event);
        this.setState({ type: event.target.value });
    };
    handleDescriptionChange = event => {
        this.setState({ description: event.target.value });
    };

    submit() {
        let newExperienceToAdd = new Experience(
            this.state.title,
            this.state.description,
            new Date(this.state.from),
            new Date(this.state.to),
            this.state.competencies,
            this.state.certificat,
            this.state.confidenceIndex,
            this.state.type
        );
        //appel blockchain
        this.addDocument(newExperienceToAdd);
        FreelancerService.getFreelancer().addExperience(newExperienceToAdd);
    }

    addDocument(experience) {

        // send document to ipfs
        if (this.state.uploadedDocument === null || this.state.uploadedDocument.length === 0) {
            alert("No document uploaded. Please add a document.");
            return;
        }
        this.uploadToIpfs(this.state.uploadedDocument).then(result => {
            FreelancerService.getFreelancer().AddDocument(result[0].path, experience);
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
                            <Grid item xs={3}>
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
                            <Grid item xs={6}></Grid>
                            <Grid item xs={6}>
                                <FormControl className={this.props.classes.textField}>
                                    <InputLabel
                                        required
                                        FormLabelClasses={{
                                            root: this.props.classes.cssLabel,
                                            focused: this.props.classes.cssFocused,
                                        }} htmlFor="custom-css-input">Title</InputLabel>
                                    <Input value={this.state.title} onChange={this.handleTitleChange} classes={{ underline: this.props.classes.cssUnderline, }} id="custom-css-input" />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
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
                            <Grid item xs={9}>
                                <FormControl className={this.props.classes.textField}>
                                    <InputLabel
                                        FormLabelClasses={{
                                            root: this.props.classes.cssLabel,
                                            focused: this.props.classes.cssFocused,
                                        }} htmlFor="custom-css-input">Description</InputLabel>
                                    <Input value={this.state.description} onChange={this.handleDescriptionChange} multiline rows="4" classes={{ underline: this.props.classes.cssUnderline, }} id="custom-css-input" />
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
                                <Button onClick={this.submit} className={this.props.classes.certificatButton} label="login">
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