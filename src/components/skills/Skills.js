import React from 'react';
import { Grid, TextField } from '@material-ui/core';
import { connect } from "react-redux";
import { setExperienceFormInput } from '../../actions/experience';

//map the redux store the the props component
const mapStateToProps = state => ({
    formData: state.experienceReducer.formData
  });
class Skills extends React.Component {
    render() {
        const { 
            formData
        } = this.props;
        return (
            <Grid item lg={6} xs={12}>
                <TextField
                    required
                    type="text"
                    value={formData['skill' + this.props.id]}
                    error={formData['skill' + this.props.id].length < 1}
                    helperText={'This field can\'t be empty'}
                    onChange={(event) =>  this.props.dispatch(setExperienceFormInput(['skill' + this.props.id], event.target.value))}
                    style={{margin: '10px 20px', width: '-webkit-fill-available'}}
                    label={"Skill " + this.props.id}
                />
            </Grid>    
        );
    }
}

export default connect(mapStateToProps)(Skills);