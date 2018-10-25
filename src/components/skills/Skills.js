import React, { Component } from 'react';
import { Grid, TextField } from '@material-ui/core';
import { connect } from "react-redux";
import { setExperienceFormInput } from '../../actions/experience';
import { TEXT_VALIDATOR_LENGTH } from '../../actions/createVault';

//map the redux store the the props component
const mapStateToProps = state => ({
  formData: state.experienceReducer.formData
});
class Skills extends React.Component {
  isOverTextLimit(text) {
    return (text.length > TEXT_VALIDATOR_LENGTH);
  }
  isEmpty(text) {
    return text.length <= 0;
  }
  render() {
    const { formData, id } = this.props;
    const skill = formData['skill' + id];
    return (
      <Grid item lg={6} xs={12}>
        <TextField
          required
          type="text"
          value={skill}
          error={this.isEmpty(skill) || this.isOverTextLimit(skill)}
          helperText={
            this.isEmpty(skill) ?
              'This field can\'t be empty.'
            : this.isOverTextLimit(skill) ?
              'This field can\'t have more than 30 characters.'
            : ''
          }
          onChange={(event) =>  this.props.dispatch(setExperienceFormInput(['skill' + this.props.id], event.target.value))}
          style={{margin: '10px 20px', width: '-webkit-fill-available'}}
          label={"Skill " + this.props.id}
        />
      </Grid>
    );
  }
}

export default connect(mapStateToProps)(Skills);
