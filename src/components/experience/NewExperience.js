import React from 'react';
import { withStyles } from '@material-ui/core';
import { constants } from '../../constants';
import { Grid, FormControl, Input, InputLabel, TextField, InputAdornment, Radio, FormControlLabel, MenuItem, Select } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import blue from '@material-ui/core/colors/blue';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import Skills from '../skills/Skills';
import { setExperienceFormInput, newExperienceClicked, getOrganizations, setSkills } from '../../actions/experience';
import { TEXT_VALIDATOR_LENGTH } from '../../actions/createVault';

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
        padding: '15px',
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
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2
    }
});

//map the redux store the the props component
const mapStateToProps = state => ({
    user: state.userReducer.user,
    newExperience: state.experienceReducer.newExperience,
    formData: state.experienceReducer.formData,
    organizations: state.experienceReducer.organizations,
  });

class NewExperience extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            radioValue: 'false',
            alreadyHaveCert: false,
            skills: [{}],
            selectedCompanyName: '',
            selectedCompany: null
        }
        this.handleAddSkills = this.handleAddSkills.bind(this);
        this.handleRemoveSkills = this.handleRemoveSkills.bind(this);
        this.haveCertificate = this.haveCertificate.bind(this);
        this.handleChooseCompany = this.handleChooseCompany.bind(this);
        this.saveExperience = this.saveExperience.bind(this);
    }

    isBefore(to, from) {
        return new Date(to) < new Date(from);
    }

    isOverTextLimit(text) {
        return text.length > TEXT_VALIDATOR_LENGTH;
    }

    isEmpty(text) {
        return text.length <= 0;
    }

    haveCertificate(newVal) {
        this.setState({alreadyHaveCert: (newVal === 'true') ? true : false, 
                       radioValue: newVal});
    }

    handleAddSkills() {
        if (this.state.skills.length < 10) {
            let s = this.state.skills;
            s.push(s.length - 1);
            this.setState({skills: s});
        }
    }

    handleRemoveSkills() {
        if (this.state.skills.length > 1) {
            let s = this.state.skills;
            s.splice(s.length - 1);
            this.setState({skills: s});
            let idToDelete = s.length + 1;
            this.props.dispatch(setSkills({['skill' + idToDelete]: '#del'}));
        }
    }

    handleChooseCompany(newVal) {
        this.setState({selectedCompanyName: newVal});
        this.setState({selectedCompany: this.props.organizations.find(x => x.name === newVal)}, () => {
            this.props.dispatch(setExperienceFormInput('companyId', this.state.selectedCompany.id));
            this.props.dispatch(setExperienceFormInput('contactFirstName', this.state.selectedCompany.responsible_first_name));
            this.props.dispatch(setExperienceFormInput('contactLastName', this.state.selectedCompany.responsible_last_name));
            this.props.dispatch(setExperienceFormInput('contactJobTitle', this.state.selectedCompany.responsible_job_title));
        });
        if (newVal === 'CompanyNotInTheList')
            return;
    }

    saveExperience() {
      /* let experience = {
           job_description: this.props.description,
           job_title: this.props.title,
           date_start: this.props.from,
           date_end: this.props.to,
           freelanceName: this.props.user.freelancerDatas.firstName + ' ' + this.props.user.freelancerDatas.lastName,
           freelanceEthereumAddress: this.props.user.freelancerDatas.ethAddress,
           freelanceEmail: this.props.user.freelancerDatas.email,
           skill1: this.props.skill1,
           skill2: this.props.skill2,
           skill3: this.props.skill3,
           skill4: this.props.skill4,
           skill5: this.props.skill5,
           skill6: this.props.skill6,
           skill7: this.props.skill7,
           skill8: this.props.skill8,
           skill9: this.props.skill9,
           skill10: this.props.skill10,
           status: 1,
           organizationId: this.state.selectedCompany.id
       }
       this.props.dispatch(setExperience(experience, this.props.user));*/
    }

    componentDidMount() {
        this.props.dispatch(getOrganizations());
    }

    render() {
        const { 
            formData,
            newExperience,
            organizations
        } = this.props;

        let skills = this.state.skills.map((skill, index) => {
            return (
                <Skills key={index+1} id={index+1}/>
            );
        });

        let companys = organizations.map(organization => {
            return (
                <MenuItem key={organization.id} value={organization.name}>{organization.name}</MenuItem>
            );
        });

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
                        <Grid item lg={12} xs={12} className={this.props.classes.textField}>
                                <FormControl>
                                    <FormControlLabel control={
                                        <Radio
                                            checked={this.state.radioValue === 'false'}
                                            onChange={() => this.haveCertificate('false')}
                                            value={this.state.radioValue}
                                            name="radio-button-demo"
                                            aria-label="C"
                                            classes={{
                                                root: this.props.classes.root,
                                                checked: this.props.classes.checked
                                            }}
                                        />} label="I don't have a certificate" />
                                </FormControl>
                                <FormControl>
                                    <FormControlLabel control={
                                        <Radio
                                            checked={this.state.radioValue === 'true'}
                                            onChange={() => this.haveCertificate('true')}
                                            value={this.state.radioValue}
                                            name="radio-button-demo"
                                            aria-label="C"
                                            classes={{
                                                root: this.props.classes.root,
                                                checked: this.props.classes.checked
                                            }}
                                        />} label="I have a certificate" />
                                </FormControl>
                            </Grid>
                            <Grid item lg={3} xs={12}>
                                <TextField
                                    id="from"
                                    label="From"
                                    type="date"
                                    value={formData.date_start}
                                    onChange={(event) => this.props.dispatch(setExperienceFormInput('date_start', event.target.value))}
                                    required
                                    error={this.isEmpty(formData.date_start)}
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
                                    value={formData.date_end}
                                    error={this.isEmpty(formData.date_end) || this.isBefore(formData.date_end, formData.date_start)}
                                    onChange={(event) => this.props.dispatch(setExperienceFormInput('date_end', event.target.value))}
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
                                        value={formData.job_title}
                                        error={this.isOverTextLimit(formData.job_title) || this.isEmpty(formData.job_title)}
                                        helperText={(!this.isOverTextLimit(formData.job_title) && !this.isEmpty(formData.job_title)) ? '' : (this.isEmpty(formData.job_title)) ? 'This field is required' : 'Maximum length: 30 characters'}
                                        onChange={(event) => this.props.dispatch(setExperienceFormInput('job_title', event.target.value))}
                                        className={this.props.classes.textField}
                                        label="Title"
                                        id="title"
                                    />
                            </Grid>
                            <Grid item lg={9} xs={12}>
                                <FormControl className={this.props.classes.textField}>
                                    <InputLabel
                                        required
                                        error={this.isEmpty(formData.job_description)}
                                        FormLabelClasses={{
                                            root: this.props.classes.cssLabel,
                                            focused: this.props.classes.cssFocused,
                                        }} htmlFor="custom-css-input">Description</InputLabel>
                                    <Input required
                                           error={this.isEmpty(formData.job_description)}
                                           value={formData.job_description}            
                                           onChange={(event) => this.props.dispatch(setExperienceFormInput('job_description', event.target.value))}
                                           multiline rows="4" classes={{ underline: this.props.classes.cssUnderline, }} id="custom-css-input" />
                                </FormControl>
                            </Grid>
                            <Grid item lg={6} xs={12}>
                                <FormControl className={this.props.classes.textField}>
                                    <InputLabel required error={!this.state.selectedCompanyName} 
                                                shrink={(this.state.selectedCompanyName) ? true : false} 
                                                htmlFor="company-required">Company</InputLabel>
                                    <Select
                                        required
                                        error={!this.state.selectedCompanyName} 
                                        value={(this.state.selectedCompanyName) ? this.state.selectedCompanyName : ''}
                                        onChange={(event) => {this.handleChooseCompany(event.target.value)}}
                                        name="company"
                                        inputProps={{
                                        id: 'company-required',
                                        }}
                                        className={this.props.classes.selectEmpty}
                                    >   
                                        <MenuItem key={0} value={'CompanyNotInTheList'}>{'My company is not in the list'}</MenuItem>                            
                                        { companys }
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item lg={6} xs={12} />
                            <Grid item lg={6} xs={12}>
                                <TextField
                                    required
                                    style={{ display: (this.state.selectedCompany && this.state.selectedCompany.is_partner) ? 'flex' : 'none'}}
                                    type="text"
                                    value={formData.finalClientCompany}
                                    error={this.isEmpty(formData.finalClientCompany)}
                                    helperText={!this.isEmpty(formData.finalClientCompany) ? '' : 'This field is required.'}
                                    onChange={(event) => this.props.dispatch(setExperienceFormInput('finalClientCompany', event.target.value))}
                                    className={this.props.classes.textField}
                                    label="Final client company"
                                    id="finalClientCompany"
                                />
                            </Grid>
                            <Grid item lg={6} xs={12} />
                            <Grid item lg={3} xs={12}>
                                <TextField
                                    required
                                    type="text"
                                    value={formData.contactLastName}
                                    error={this.isEmpty(formData.contactLastName)}
                                    helperText={!this.isEmpty(formData.contactLastName) ? '' : 'This field is required.'}
                                    onChange={(event) => this.props.dispatch(setExperienceFormInput('contactLastName', event.target.value))}
                                    className={this.props.classes.textField}
                                    label="Last name"
                                    id="contactLastName"
                                />
                            </Grid>
                            <Grid item lg={3} xs={12}>
                                <TextField
                                    required
                                    type="text"
                                    value={formData.contactFirstName}
                                    error={this.isEmpty(formData.contactFirstName)}
                                    helperText={!this.isEmpty(formData.contactFirstName) ? '' : 'This field is required.'}
                                    onChange={(event) => this.props.dispatch(setExperienceFormInput('contactFirstName', event.target.value))}
                                    className={this.props.classes.textField}
                                    label="First name"
                                    id="contactFirstName"
                                />
                            </Grid>
                            <Grid item lg={3} xs={12}>
                                <TextField
                                    required
                                    type="text"
                                    value={formData.contactJobTitle}
                                    error={this.isEmpty(formData.contactJobTitle)}
                                    helperText={!this.isEmpty(formData.contactJobTitle) ? '' : 'This field is required.'}
                                    onChange={(event) => this.props.dispatch(setExperienceFormInput('contactJobTitle', event.target.value))}
                                    className={this.props.classes.textField}
                                    label="Job title"
                                    id="contactJobTitle"
                                />
                            </Grid>
                            <Grid item lg={12} xs={12} />
                            <Grid item lg={6} xs={12}>
                                <Button className={this.props.classes.certificatButton} onClick={() => this.handleAddSkills()}>Add skills</Button>
                                <Button className={this.props.classes.certificatButton} onClick={() => this.handleRemoveSkills()}>Remove skills</Button>
                            </Grid>
                            <Grid item lg={6} xs={12} />
                                {skills}
                            <Grid item lg={12} xs={12}>
                                <Button className={this.props.classes.certificatButton} onClick={() => this.saveExperience()}>Save</Button>
                            </Grid>
                        </form>
                    </Grid>
                </div>
            </div>
        );
    }
}

export default compose(withStyles(styles), connect(mapStateToProps))(NewExperience);