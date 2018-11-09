import React, { Component } from 'react';
import { Grid, TextField } from '@material-ui/core';
import { connect } from "react-redux";
import { setExperienceFormInput } from '../../actions/freelance/experience';
import { TEXT_VALIDATOR_LENGTH } from '../../actions/freelance/createVault';

const mapStateToProps = state => ({
  formData: state.experienceReducer.formData
});
class Skills extends Component {
  isEmpty(text) {
    return text.length <= 0;
  }
  remainingCharacters(text) {
    const remaining = TEXT_VALIDATOR_LENGTH - text.length;
    return 'Remaining characters: ' + remaining;
  }
  render() {
    const { formData, id } = this.props;
    const skill = formData['skill' + id];
    return (
      <Grid item lg={6} xs={12}>
        <TextField
          required
          type="text"
          inputProps={{
            maxLength: 30
          }}
          value={skill}
          error={this.isEmpty(skill)}
          helperText={
            this.isEmpty(skill) ?
              'This field can\'t be empty.'
            :
              this.remainingCharacters(skill)
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
