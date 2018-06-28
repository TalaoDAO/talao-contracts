import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { constants } from '../../constants';
import Typography from '@material-ui/core/Typography';
import CompetencyTag from '../competencyTag/CompetencyTag';
import DateService from '../../services/DateService';

const styles = theme => ({
    experienceContainer: {
        marginBottom: '30px',
    },
    timeLine: {
        display: 'inline-block',
    },
    indicator: {
        display: 'inline-block',
        width: '20px',
        height: '20px',
        lineHeight: '20px',
        textAlign: 'center',
        padding: '20px',
        borderRadius: '50%',
    },
    line: {
        display: 'inline-block',
        borderTop: '4px solid ' + theme.palette.grey[300],
        width: '150px',
        paddingBottom: '5px',
    },
    triangleContainer: {
        display: 'inline-block',
        position: 'relative',
        top: '-4px',
    },
    triangle: {
        display: 'inline-block',
        width: 0,
        height: 0,
        borderTop: '3px solid transparent',
        borderBottom: '3px solid transparent',
        borderLeft: '3px solid ' + theme.palette.grey[300],
    },
    timeContainer: {
        display: 'inline-block',
        paddingLeft: '5px',
        fontSize: '14px',
        color: theme.palette.grey[500],
        paddingBottom: '5px',
    },
    dateContainer: {
        color: theme.palette.grey[500],
        marginLeft: '80px',
        marginTop: '-10px',
        fontSize: '14px',
        fontWeight: '100',
    },
    content: {
        display: 'inline-block',
        verticalAlign: 'top',
        marginTop: '15px',
        marginLeft: '30px',
        paddingLeft: '50px',
        borderLeft: '1px solid ' + theme.palette.grey[300],
        width: '80%',
    },
    description: {
        marginTop: '15px',
    },
});

class Experience extends React.Component {

    monthDiff(d1, d2) {
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth() + 1;
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
    }

    render() {
        const competencyTags = this.props.value.competencies.map((competency, index) =>
            (<CompetencyTag value={competency} key={index} />)
        );
        const dateDiff = DateService.dateDiffAsString(this.props.value.from, this.props.value.to);
        const monthDiff = DateService.monthDiff(this.props.value.from, this.props.value.to);

        return (
            <div className={this.props.classes.experienceContainer}>
                <div>
                    <div className={this.props.classes.indicator} style={{ backgroundColor: constants.colors[this.props.lightColor], color: constants.colors[this.props.textColor] }}>
                        &nbsp;
                    </div>
                    <div className={this.props.classes.timeLine} >
                        <div className={this.props.classes.line} style={{width: (monthDiff * 5) + 'px'}}></div>
                        <div className={this.props.classes.triangleContainer}>
                            <div className={this.props.classes.triangle}></div>
                        </div>
                        <div className={this.props.classes.timeContainer}>
                            {dateDiff}
                        </div>
                    </div>
                    <div className={this.props.classes.dateContainer}>
                        {DateService.getMonthYearDate(this.props.value.from)} -
                        {DateService.getMonthYearDate(this.props.value.to)}
                    </div>
                </div>
                <div>
                    <div className={this.props.classes.content}>
                        <Typography variant="headline" gutterBottom>
                            {this.props.value.title}
                        </Typography>
                        {competencyTags}
                        <Typography variant="body1" gutterBottom className={this.props.classes.description}>
                            {this.props.value.description}
                        </Typography>
                    </div>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(Experience);