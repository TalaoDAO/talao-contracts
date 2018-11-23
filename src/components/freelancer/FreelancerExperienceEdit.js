import React, { Component, Fragment } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Loading from 'react-loading-animation';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { Save } from '@material-ui/icons';

import {
  getBackendExperience,
  setExperienceFormInput
} from '../../actions/freelance/experience';
import { TEXT_VALIDATOR_LENGTH } from '../../actions/freelance/createVault';

const styles = theme => ({
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
})

const mapStateToProps = state => ({
  formData: state.experienceReducer.formData,
  operation: state.experienceReducer.operation,
  loading: state.experienceReducer.loading
});

class FreelancerExperienceEdit extends Component {

  constructor(props) {
    super(props);
    this.state = {
    }
  }

  resetAndClose = () => {
    const { dispatch, onClose } = this.props;
    dispatch({type:'RESET_EXPERIENCE_REDUCER'});
    onClose();
  }

  isEmpty = text => {
    if (text) {
      return text.length === 0;
    }
    return true;
  }

  isBefore = (to, from) => {
    return new Date(to) < new Date(from);
  }

  remainingCharacters = text => {
    const remaining = TEXT_VALIDATOR_LENGTH - text.length;
    return 'Remaining characters: ' + remaining;
  }

  canSubmit = () => {
    return true;
  }

  saveExperience = () => {
    const { onClose } = this.props;
    alert('saved')
    onClose();
  }

  componentDidMount() {
    const { dispatch, id } = this.props;
    dispatch(getBackendExperience(id));
  }

  render() {
    const {
      classes,
      dispatch,
      open,
      onClose,
      operation,
      loading,
      formData
    } = this.props;
    const newOrganizationData = {};
    const skills = {};

    return (
      <Dialog
        aria-labelledby="confirmation-dialog-title"
        open={open}
        onClose={() => this.resetAndClose()}
        maxWidth="md"
      >
        <DialogTitle
          id="confirmation-dialog-title"
        >
          Edit experience
        </DialogTitle>
        <DialogContent>
          {
            operation && operation === 'edit' && !loading && formData ?
              <form
                noValidate
                autoComplete="off"
                className={classes.container}
              >
                <Grid container spacing={32}>
                  <Fragment>
                    <Grid item md={4} xs={12}>
                      <TextField
                        id="from"
                        label="From"
                        type="date"
                        value={formData.date_start}
                        onChange={event => dispatch(setExperienceFormInput('date_start', event.target.value))}
                        required
                        error={this.isEmpty(formData.date_start)}
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
                        fullWidth
                      />
                    </Grid>
                    <Grid item md={4} xs={12}>
                      <TextField
                        id="to"
                        label="To"
                        type="date"
                        value={formData.date_end}
                        error={
                          this.isEmpty(formData.date_end) ||
                          this.isBefore(formData.date_end, formData.date_start)
                        }
                        onChange={event => dispatch(setExperienceFormInput('date_end', event.target.value))}
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
                        fullWidth
                      />
                    </Grid>
                    <Grid item md={4} xs={12}>
                      <TextField
                        required
                        type="number"
                        value={formData.job_duration}
                        error={this.isEmpty(formData.job_duration)}
                        onChange={event => dispatch(setExperienceFormInput('job_duration', event.target.value))}
                        className={classes.textField}
                        label="Total number of days"
                        id="jobDuration"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
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
                            ''
                          :
                            this.remainingCharacters(formData.job_title)
                        }
                        onChange={event => dispatch(setExperienceFormInput('job_title', event.target.value))}
                        label="Title"
                        id="title"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        id="description"
                        label="Description"
                        required
                        error={this.isEmpty(formData.job_description)}
                        value={formData.job_description}
                        onChange={event => dispatch(setExperienceFormInput('job_description', event.target.value))}
                        multiline
                        rowsMax="4"
                        fullWidth
                      />
                    </Grid>
                    {/* <Grid item lg={6} xs={12}>
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
                            onChange={(event) => dispatch(setExperienceFormInput('finalClientCompany', event.target.value)}
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
                          onChange={event => dispatch(setExperienceFormInput('contactFirstName', event.target.value))}
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
                          onChange={(event) => dispatch(setExperienceFormInput('contactLastName', event.target.value)}
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
                          onChange={event => dispatch(setExperienceFormInput('contactJobTitle', event.target.value))}
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
                          // onChange={(event) => this.props.dispatch(setOrganizationFormInput('name', event.target.value))}
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
                          // onChange={(event) => this.props.dispatch(setOrganizationFormInput('responsible_first_name', event.target.value))}
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
                          // onChange={(event) => this.props.dispatch(setOrganizationFormInput('responsible_last_name', event.target.value))}
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
                          // onChange={(event) => this.props.dispatch(setOrganizationFormInput('responsible_job_title', event.target.value))}
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
                          // onChange={(event) => this.props.dispatch(setOrganizationFormInput('email', event.target.value))}
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
                          // onChange={(event) => this.props.dispatch(setOrganizationFormInput('phone', event.target.value))}
                          className={classes.textField}
                          label="Responsible phone"
                          id="companyPhone"
                        />
                      </Grid> */}
                      {/* <Grid item lg={12} xs={12} />
                      {skills}
                      <Grid item lg={12} xs={12}>
                        <Button className={classes.certificatButton} onClick={() => this.handleAddSkills()}>Add skills</Button>
                        <Button className={classes.certificatButton} onClick={() => this.handleRemoveSkills()}>Remove skills</Button>
                      </Grid> */}
                  </Fragment>
                </Grid>
              </form>
            :
              <Loading />
          }
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => this.resetAndClose()}
          >
            Cancel
          </Button>
          <Button
            onClick={() => this.saveExperience()}
            color="primary"
            variant="outlined"
          >
            <Save className={classes.leftIcon} />Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps)
)(FreelancerExperienceEdit);
