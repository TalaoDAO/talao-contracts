import React from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { constants } from '../../constants';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Experiences from '../experiences/Experiences';
import CloseIcon from '@material-ui/icons/Close';
import ColorService from '../../services/ColorService';

const styles = {
    media: {
        height: '160px',
    },
    content: {
        minHeight: '100px',
    },
    competency: {
        textTransform: 'uppercase',
    },
    close: {
        display: 'block',
        float: 'left',
        marginTop: '10px',
        marginLeft: 0,
        color: '#fff',
        transform: 'scale(1.4)',
        '& a:hover, & a:visited': {
            color: '#fff',
        },
    },
    badge: {
        display: 'block',
        float: 'right',
        marginTop: '125px',
        marginRight: '20px',
        padding: '10px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        textAlign: 'center',
        fontSize: '26px',
        transition: 'all 1s ease',
    },
    textBadge: {
        lineHeight: '50px',
    },
    card: {
        transition: 'all .4s ease',
        paddingBottom: '15px',
    },
    cardnormal: {
        '&:hover': {
            boxShadow: '0px 3px 15px 0px rgba(0, 0, 0, 0.2), 0px 6px 6px 0px rgba(0, 0, 0, 0.14), 0px 9px 3px -6px rgba(0, 0, 0, 0.12)',
            cursor: 'pointer',
        },
    },
    cardfocused: {
        '&:hover': {
            cursor: 'default',
        },
    },
    link: {
        textDecoration: 'none',
        color: 'initial',
    },
    competentiesHidden: {
        maxHeight: '0px',
        overflow: 'hidden',
    },
    competentiesShown: {
        marginTop: '50px',
        maxHeight: '0px',
        overflow: 'auto',
        animationName: 'openExperiences',
        animationDelay: '.5s',
        animationDuration: '1s',
        animationFillMode: 'forwards',
    },
    '@keyframes openExperiences': {
        '0%': {
            maxHeight: '0px',
            overflow: 'hidden',
        },
        '99%': {
            maxHeight: '5000px',
        },
        '100%': {
            height: 'auto',
            maxHeight: 'initial',
        },
    },
};

class Competency extends React.Component {

    render() {
        const backgroundColorString = ColorService.getCompetencyColorName(this.props.competency.name, this.props.competency.confidenceIndex);
        const backgroundLightColorString = ColorService.getLightColorName(backgroundColorString);
        const textColorString = "text" + backgroundColorString[0].toUpperCase() + backgroundColorString.substring(1);
        const layoutFocused = this.props.layout === 'focused';
        return (
            <Card className={this.props.classes.card + ' ' + this.props.classes['card' + this.props.layout]}>
                <CardContent className={this.props.classes.close} style={{ display: layoutFocused ? 'initial' : 'none' }}>
                    <Link to='/'>
                        <CloseIcon />
                    </Link>
                </CardContent>
                <Link to={'/competencies/' + this.props.competency.name} className={this.props.classes.link}>
                    <CardContent className={this.props.classes.badge} style={{ backgroundColor: constants.colors[backgroundLightColorString] }}>
                        <Typography variant="headline" className={this.props.classes.textBadge}>
                            {Math.round(this.props.confidenceIndex)}
                        </Typography>
                    </CardContent>
                    <CardMedia
                        className={this.props.classes.media}
                        style={{ backgroundColor: constants.colors[backgroundColorString] }}
                        image="#"
                        title={this.props.competency.name}
                    />
                    <CardContent
                        className={this.props.classes.content}>
                        <Typography gutterBottom variant="headline" component="h2" className={this.props.classes.competency}>
                            {this.props.competency.name}
                        </Typography>
                        <div className={layoutFocused ? this.props.classes.competentiesShown : this.props.classes.competentiesHidden}>
                            <Experiences 
                                value={this.props.competency.experiences} 
                                color={backgroundColorString} 
                                lightColor={backgroundLightColorString}
                                textColor={textColorString} 
                            />
                        </div>
                    </CardContent>
                    <CardActions style={{ display: layoutFocused ? 'none' : 'initial' }}>
                        <Button size="small" color="primary">
                            Details
                        </Button>
                    </CardActions>
                </Link>
            </Card>
        );
    }
}

export default withStyles(styles)(Competency);