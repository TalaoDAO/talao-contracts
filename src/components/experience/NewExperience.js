import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';

import {
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  Icon,
  Input,
  InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  Select,
  TextField,
  withStyles
} from '@material-ui/core';
import { constants } from '../../constants';
import blue from '@material-ui/core/colors/blue';
import PropTypes from 'prop-types';

import {
  setExperienceFormInput,
  setOrganizationFormInput,
  newExperienceClicked,
  fetchExperience
} from '../../actions/freelance/experience';
import { TEXT_VALIDATOR_LENGTH } from '../../actions/freelance/createVault';

import Skills from '../skills/Skills';
import NewExperienceWithCertificate from './NewExperienceWithCertificate';

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
  newOrganizationData: state.experienceReducer.newOrganizationData,
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

  remainingCharacters(text) {
    const remaining = TEXT_VALIDATOR_LENGTH - text.length;
    return 'Remaining characters: ' + remaining;
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
      this.props.dispatch(setExperienceFormInput(['skill' + idToDelete], ''));
    }
  }

  handleChooseCompany(newVal) {
    this.setState({selectedCompanyName: newVal});
    if (newVal === 'CompanyNotInTheList') {
      this.setState({selectedCompany: null});
      this.props.dispatch(setExperienceFormInput('contactFirstName', ''));
      this.props.dispatch(setExperienceFormInput('contactLastName', ''));
      this.props.dispatch(setExperienceFormInput('contactJobTitle', ''));
      this.props.dispatch(setExperienceFormInput('finalClientCompany', ''));
    } else {
      this.props.dispatch({type: 'RESET_ORGANIZATION_REDUCER'});
      this.setState({selectedCompany: this.props.organizations.find(x => x.name === newVal)}, () => {
        this.props.dispatch(setExperienceFormInput('organizationId', this.state.selectedCompany.id));
        this.props.dispatch(setExperienceFormInput('contactFirstName', this.state.selectedCompany.is_partner ? '' : this.state.selectedCompany.responsible_first_name));
        this.props.dispatch(setExperienceFormInput('contactLastName', this.state.selectedCompany.is_partner ? '' : this.state.selectedCompany.responsible_last_name));
        this.props.dispatch(setExperienceFormInput('contactJobTitle', this.state.selectedCompany.is_partner ? '' : this.state.selectedCompany.responsible_job_title));
        this.props.dispatch(setExperienceFormInput('finalClientCompany', ''));
        this.props.dispatch(setExperienceFormInput('partner_text', ''));
      });
    }
  }

  allSkillFill() {
    for(let i = 1; i < this.state.skills.length + 1; i++) {
      if (this.isEmpty(this.props.formData['skill' + i]) || this.isOverTextLimit(this.props.formData['skill' + i])) {
        return false;
      }
    }
    return true;
  }

  canSubmit() {
    return !this.isEmpty(this.props.formData.date_start) &&
    !this.isEmpty(this.props.formData.date_end) &&
    !this.isEmpty(this.props.formData.job_title) &&
    !this.isEmpty(this.props.formData.job_duration) &&
    !this.isOverTextLimit(this.props.formData.job_title) &&
    !this.isEmpty(this.props.formData.job_description) &&
    this.state.selectedCompanyName &&
    this.allSkillFill() &&
    (this.state.selectedCompanyName !== 'CompanyNotInTheList' ?
    !this.isEmpty(this.props.formData.contactLastName) &&
    !this.isEmpty(this.props.formData.contactFirstName) &&
    !this.isEmpty(this.props.formData.contactJobTitle) &&
    (this.state.selectedCompany.is_partner ? !this.isEmpty(this.props.formData.finalClientCompany) : true) :
    !this.isEmpty(this.props.newOrganizationData.name) &&
    !this.isEmpty(this.props.newOrganizationData.responsible_first_name) &&
    !this.isEmpty(this.props.newOrganizationData.responsible_last_name) &&
    !this.isEmpty(this.props.newOrganizationData.responsible_job_title) &&
    !this.isEmpty(this.props.newOrganizationData.email))
  }

  saveExperience() {
    if (this.state.selectedCompany && this.state.selectedCompany.is_partner)
    this.props.dispatch(setExperienceFormInput('partner_text', 'I hereby certify that ' +
    this.props.user.freelancerDatas.firstName + ' ' +
    this.props.user.freelancerDatas.lastName + ' worked with ' +
    this.props.formData.contactFirstName + ' ' + this.props.formData.contactLastName + ', ' +
    this.props.formData.contactJobTitle + ' at '  + this.state.selectedCompanyName));

    if (this.state.selectedCompanyName === 'CompanyNotInTheList') {
      this.props.dispatch(fetchExperience(this.props.formData, this.props.newOrganizationData, this.props.user));
    }
    else {
      this.props.dispatch(fetchExperience(this.props.formData, null, this.props.user));
    }
    this.setState({skills: [{}], selectedCompanyName: '', selectedCompany: null})
  }

  render() {
    const {
      classes,
      formData,
      newExperience,
      organizations,
      newOrganizationData,
      user
    } = this.props;

    const { alreadyHaveCert } = this.state;

    let skills = this.state.skills.map((skill, index) => {
      return ( <Skills key={index+1} id={index+1}/> );
    });

    let companys = (organizations) && organizations.map(organization => {
      return ( <MenuItem key={organization.id} value={organization.name}>{organization.name}</MenuItem> );
    });
    return (
      <div>
        <div>
          <div onClick={() => this.props.dispatch(newExperienceClicked(!newExperience, user))} className={classes.indicator} style={{ backgroundColor: constants.colors["primary"], color: constants.colors["textAccent2"] }}>
            <span style={{ display: !newExperience ? 'inline-block' : 'none', fontSize: '30px' }}>+</span>
            <span style={{ display: newExperience ? 'inline-block' : 'none', fontSize: '30px' }}>-</span>
          </div>
          <div style={{ display: !newExperience ? 'inline-block' : 'none' }} className={classes.timeLine} >
            <div className={classes.line} style={{ width: (5 * 5) + 'px' }}></div>
            <div className={classes.timeContainer}>
              Add a new experience
            </div>
          </div>
        </div>
        <div className={classes.content} style={{ display: newExperience ? 'inline-block' : 'none' }}>
          <Grid container spacing={40}>
            <form className={classes.container} noValidate autoComplete="off">
              <Grid item lg={12} xs={12} className={classes.textField}>
                <FormControl>
                  <FormControlLabel
                    control={
                      <Radio
                        checked={this.state.radioValue === 'false'}
                        onChange={() => this.haveCertificate('false')}
                        value={this.state.radioValue}
                        name="radio-button-demo"
                        aria-label="C"
                        classes={{
                          root: classes.root,
                          checked: classes.checked
                        }}
                      />}
                      label="I don't have a certificate"
                    />
                  </FormControl>
                  <FormControl>
                    <FormControlLabel
                      control={
                        <Radio
                          checked={this.state.radioValue === 'true'}
                          onChange={() => this.haveCertificate('true')}
                          value={this.state.radioValue}
                          name="radio-button-demo"
                          aria-label="C"
                          classes={{
                            root: classes.root,
                            checked: classes.checked
                          }}
                        />
                      }
                      label="I have a certificate"
                    />
                  </FormControl>
              </Grid>
              {
                alreadyHaveCert ?
                  <Grid item xs={12}>
                    <NewExperienceWithCertificate />
                  </Grid>
                :
                  <React.Fragment>
                    <Grid item lg={3} xs={12}>
                      <TextField
                        id="from"
                        label="From"
                        type="date"
                        value={(formData) && formData.date_start}
                        onChange={(event) => this.props.dispatch(setExperienceFormInput('date_start', event.target.value))}
                        required
                        error={this.isEmpty(formData.date_start)}
                        className={classes.textField}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Icon className={classes.icon} color="primary">
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
                        className={classes.textField}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Icon className={classes.icon} color="primary">
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
                    <Grid item lg={3} xs={12}>
                      <TextField
                        required
                        type="number"
                        value={formData.job_duration}
                        error={this.isEmpty(formData.job_duration)}
                        helperText={this.isEmpty(formData.job_duration) ? 'This field is required' : ''}
                        onChange={(event) => this.props.dispatch(setExperienceFormInput('job_duration', event.target.value))}
                        className={classes.textField}
                        label="Total number of days"
                        id="jobDuration"
                      />
                    </Grid>
                    <Grid item lg={12}></Grid>
                    <Grid item lg={6} xs={12}>
                      <TextField
                        required
                        type="text"
                        inputProps={{
                          maxLength: 30
                        }}
                        value={formData.job_title}
                        error={this.isEmpty(formData.job_title)}
                        helperText={
                          this.isEmpty(formData.job_title) ?
                          'This field is required.'
                          :
                          this.remainingCharacters(formData.job_title)
                        }
                        onChange={(event) => this.props.dispatch(setExperienceFormInput('job_title', event.target.value))}
                        className={classes.textField}
                        label="Title"
                        id="title"
                      />
                    </Grid>
                    <Grid item lg={9} xs={12}>
                      <FormControl className={classes.textField}>
                        <InputLabel
                          required
                          error={this.isEmpty(formData.job_description)}
                          FormLabelClasses={{
                            root: classes.cssLabel,
                            focused: classes.cssFocused,
                          }} htmlFor="custom-css-input">
                          Description
                        </InputLabel>
                        <Input
                          required
                          error={this.isEmpty(formData.job_description)}
                          value={formData.job_description}
                          onChange={(event) => this.props.dispatch(setExperienceFormInput('job_description', event.target.value))}
                          multiline
                          rowsMax="4"
                          id="custom-css-input" />
                        </FormControl>
                    </Grid>
                    <Grid item lg={6} xs={12}>
                      <FormControl className={classes.textField}>
                        <InputLabel required error={!this.state.selectedCompanyName}
                          shrink={(this.state.selectedCompanyName) ? true : false}
                          htmlFor="company-required">
                          Company
                        </InputLabel>
                        <Select
                          required
                          error={!this.state.selectedCompanyName}
                          value={(this.state.selectedCompanyName) ? this.state.selectedCompanyName : ''}
                          onChange={(event) => {this.handleChooseCompany(event.target.value)}}
                          name="company"
                          inputProps={{
                            id: 'company-required',
                          }}
                          className={classes.selectEmpty}
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
                          style={{ display: (this.state.selectedCompany &&
                            this.state.selectedCompany.is_partner) ? 'flex' : 'none'}}
                            type="text"
                            value={formData.finalClientCompany}
                            error={this.isEmpty(formData.finalClientCompany)}
                            helperText={!this.isEmpty(formData.finalClientCompany) ? '' : 'This field is required.'}
                            onChange={(event) => this.props.dispatch(setExperienceFormInput('finalClientCompany', event.target.value))}
                            className={classes.textField}
                            label="Final client company"
                            id="finalClientCompany"
                        />
                      </Grid>
                      <Grid item lg={6} xs={12} />
                      <Grid item lg={3} xs={12}>
                        <TextField
                          required
                          style={{ display: this.state.selectedCompanyName !== 'CompanyNotInTheList' ? 'flex' : 'none'}}
                          type="text"
                          value={formData.contactFirstName}
                          error={this.isEmpty(formData.contactFirstName)}
                          helperText={!this.isEmpty(formData.contactFirstName) ? '' : 'This field is required.'}
                          onChange={(event) => this.props.dispatch(setExperienceFormInput('contactFirstName', event.target.value))}
                          className={classes.textField}
                          label="Responsible first name"
                          id="contactFirstName"
                        />
                      </Grid>
                      <Grid item lg={3} xs={12}>
                        <TextField
                          required
                          style={{ display: this.state.selectedCompanyName !== 'CompanyNotInTheList' ? 'flex' : 'none'}}
                          type="text"
                          value={formData.contactLastName}
                          error={this.isEmpty(formData.contactLastName)}
                          helperText={!this.isEmpty(formData.contactLastName) ? '' : 'This field is required.'}
                          onChange={(event) => this.props.dispatch(setExperienceFormInput('contactLastName', event.target.value))}
                          className={classes.textField}
                          label="Responsible last name"
                          id="contactLastName"
                        />
                      </Grid>
                      <Grid item lg={3} xs={12}>
                        <TextField
                          required
                          style={{ display: this.state.selectedCompanyName !== 'CompanyNotInTheList' ? 'flex' : 'none'}}
                          type="text"
                          value={formData.contactJobTitle}
                          error={this.isEmpty(formData.contactJobTitle)}
                          helperText={!this.isEmpty(formData.contactJobTitle) ? '' : 'This field is required.'}
                          onChange={(event) => this.props.dispatch(setExperienceFormInput('contactJobTitle', event.target.value))}
                          className={classes.textField}
                          label="Responsible job title"
                          id="contactJobTitle"
                        />
                      </Grid>
                      <Grid item lg={12} xs={12} />
                      <Grid item lg={6} xs={12}>
                        <TextField
                          required
                          style={{ display: this.state.selectedCompanyName === 'CompanyNotInTheList' ? 'flex' : 'none'}}
                          type="text"
                          value={newOrganizationData.name}
                          error={this.isEmpty(newOrganizationData.name)}
                          helperText={!this.isEmpty(newOrganizationData.name) ? '' : 'This field is required.'}
                          onChange={(event) => this.props.dispatch(setOrganizationFormInput('name', event.target.value))}
                          className={classes.textField}
                          label="Company name"
                          id="companyName"
                        />
                      </Grid>
                      <Grid item lg={6} xs={12}></Grid>
                      <Grid item lg={3} xs={12}>
                        <TextField
                          required
                          style={{ display: this.state.selectedCompanyName === 'CompanyNotInTheList' ? 'flex' : 'none'}}
                          type="text"
                          value={newOrganizationData.responsible_first_name}
                          error={this.isEmpty(newOrganizationData.responsible_first_name)}
                          helperText={!this.isEmpty(newOrganizationData.responsible_first_name) ? '' : 'This field is required.'}
                          onChange={(event) => this.props.dispatch(setOrganizationFormInput('responsible_first_name', event.target.value))}
                          className={classes.textField}
                          label="Responsible first name"
                          id="responsibleFirstName"
                        />
                      </Grid>
                      <Grid item lg={3} xs={12}>
                        <TextField
                          required
                          style={{ display: this.state.selectedCompanyName === 'CompanyNotInTheList' ? 'flex' : 'none'}}
                          type="text"
                          value={newOrganizationData.responsible_last_name}
                          error={this.isEmpty(newOrganizationData.responsible_last_name)}
                          helperText={!this.isEmpty(newOrganizationData.responsible_last_name) ? '' : 'This field is required.'}
                          onChange={(event) => this.props.dispatch(setOrganizationFormInput('responsible_last_name', event.target.value))}
                          className={classes.textField}
                          label="Responsible last name"
                          id="responsibleLastName"
                        />
                      </Grid>
                      <Grid item lg={3} xs={12}>
                        <TextField
                          required
                          style={{ display: this.state.selectedCompanyName === 'CompanyNotInTheList' ? 'flex' : 'none'}}
                          type="text"
                          value={newOrganizationData.responsible_job_title}
                          error={this.isEmpty(newOrganizationData.responsible_job_title)}
                          helperText={!this.isEmpty(newOrganizationData.responsible_job_title) ? '' : 'This field is required.'}
                          onChange={(event) => this.props.dispatch(setOrganizationFormInput('responsible_job_title', event.target.value))}
                          className={classes.textField}
                          label="Responsible job title"
                          id="responsibleJobTitle"
                        />
                      </Grid>
                      <Grid item lg={3} xs={12}></Grid>
                      <Grid item lg={3} xs={12}>
                        <TextField
                          required
                          style={{ display: this.state.selectedCompanyName === 'CompanyNotInTheList' ? 'flex' : 'none'}}
                          type="text"
                          value={newOrganizationData.email}
                          error={this.isEmpty(newOrganizationData.email)}
                          helperText={!this.isEmpty(newOrganizationData.email) ? '' : 'This field is required.'}
                          onChange={(event) => this.props.dispatch(setOrganizationFormInput('email', event.target.value))}
                          className={classes.textField}
                          label="Responsible email"
                          id="companyEmail"
                        />
                      </Grid>
                      <Grid item lg={3} xs={12}>
                        <TextField
                          style={{ display: this.state.selectedCompanyName === 'CompanyNotInTheList' ? 'flex' : 'none'}}
                          type="text"
                          value={newOrganizationData.phone}
                          onChange={(event) => this.props.dispatch(setOrganizationFormInput('phone', event.target.value))}
                          className={classes.textField}
                          label="Responsible phone"
                          id="companyPhone"
                        />
                      </Grid>
                      <Grid item lg={12} xs={12} />
                      {skills}
                      <Grid item lg={12} xs={12}>
                        <Button className={classes.certificatButton} onClick={() => this.handleAddSkills()}>Add skills</Button>
                        <Button className={classes.certificatButton} onClick={() => this.handleRemoveSkills()}>Remove skills</Button>
                      </Grid>
                      <Grid item lg={12} xs={12}>
                        <Button className={this.canSubmit() ? classes.certificatButton : classes.certificatButtonDisabled} onClick={() => this.saveExperience()}>Save</Button>
                      </Grid>
                    </React.Fragment>
                  }
            </form>
          </Grid>
        </div>
      </div>
    );
  }
}

NewExperience.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default compose(
  withStyles(styles),
  connect(mapStateToProps)
)(NewExperience);
