import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Grid, TextField } from '@material-ui/core'; //Radio, FormControlLabel

const styles = theme => ({
  /*  textField: {
        margin: '10px 20px',
        width: '-webkit-fill-available',
        color: theme.palette.primary,
    },*/
});

class Skills extends React.Component {

    render() {
        return (
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
                    id={this.props.skill}
                />
            </Grid>    
        );
    }
}

export default Skills;