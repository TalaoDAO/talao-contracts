import React from 'react';
import { Grid, TextField } from '@material-ui/core';
import { connect } from "react-redux";
import { setSkills } from '../../actions/experience';

//map the redux store the the props component
const mapStateToProps = state => ({

  });
class Skills extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        }
        this.handleSkillChange = this.handleSkillChange.bind(this);
    }

    handleSkillChange(newVal) {
        this.setState({value: newVal});
        this.props.dispatch(setSkills({['skill' + this.props.id]: newVal}));
    }

    render() {
        return (
            <Grid item lg={6} xs={12}>
                <TextField
                    required
                    type="text"
                    value={this.state.value}
                    error={this.state.value.length < 1}
                    helperText={'This field can\'t be empty'}
                    onChange={(event) => this.handleSkillChange(event.target.value)}
                    style={{margin: '10px 20px', width: '-webkit-fill-available'}}
                    label={"Skill " + this.props.id}
                />
            </Grid>    
        );
    }
}

export default connect(mapStateToProps)(Skills);