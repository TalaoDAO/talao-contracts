import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ColorService from '../../services/ColorService';

const styles = theme => ({
    container: {
        display: 'inline-block',
        marginRight: '10px',
        borderRadius: '30px',
        padding: '4px 15px 4px 4px',
        verticalAlign: 'center', 
    },
    confidenceIndex: {
        display: 'inline-block',
        lineHeight: '30px',
        width: '30px',
        borderRadius: '15px',
        textAlign: 'center',
        fontSize: '12px',
    },
    name: {
        display: 'inline-block',
        lineHeight: '20px',
        paddingLeft: '5px',
        textTransform: 'uppercase',
        fontWeight: 100,
        verticalAlign: 'middle',
    }
});

class CompetencyTag extends React.Component {

    render() {
        const backgroundColorString = ColorService.getCompetencyColorName(this.props.value.name, this.props.value.confidenceIndex);
        const backgroundLightColorString = ColorService.getLightColorName(backgroundColorString);
        const textColorString = ColorService.getTextColorName(backgroundColorString);
        return (
            <div className={this.props.classes.container} style={{backgroundColor: ColorService.getColorFromName(backgroundColorString)}}>
                <div className={this.props.classes.confidenceIndex} style={{backgroundColor: ColorService.getColorFromName(backgroundLightColorString)}}>
                    {this.props.value.confidenceIndex}
                </div>
                <div className={this.props.classes.name} style={{color: ColorService.getColorFromName(textColorString)}}>
                    {this.props.value.name}
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(CompetencyTag);