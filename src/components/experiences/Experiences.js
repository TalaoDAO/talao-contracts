import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Experience from '../experience/Experience';

const styles = {

};

class Experiences extends React.Component {

    render() {
        const experiences = this.props.value.map((experience, index) => 
            (<Experience 
                value={experience}
                color={this.props.color}
                lightColor={this.props.lightColor}
                textColor={this.props.textColor} 
                index={index}
                key={index} />)
        );

        return (
            <div>
                {experiences}
            </div>
        );
    }
}

export default withStyles(styles)(Experiences);