import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { constants } from '../../constants';
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

const styles = {
    media: {
        height: '160px',
    },
    content: {
        height: '100px',
    },
    competency: {
        textTransform: 'uppercase',
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
    },
    textBadge: {
        lineHeight: '50px',
    },
    card: {
       '&:hover': {
           boxShadow: '0px 3px 15px 0px rgba(0, 0, 0, 0.2), 0px 6px 6px 0px rgba(0, 0, 0, 0.14), 0px 9px 3px -6px rgba(0, 0, 0, 0.12)',
           cursor: 'pointer',
       },
    },
};

class Competency extends React.Component {

    getCompetencyColor() {
        if (this.props.competency.name === "Education") return "grey";
        if (this.props.confidenceIndex > 80) return "accent1";
        if (this.props.confidenceIndex > 60) return "accent2";
        if (this.props.confidenceIndex > 40) return "accent3";
        return "accent4";
    }

    render() {
        const backgroundColorString = this.getCompetencyColor();
        const backgroundLightColorString = "light" + backgroundColorString[0].toUpperCase() + backgroundColorString.substring(1);
        return (
            <Card className={this.props.classes.card}>
                <CardContent className={this.props.classes.badge} style={{backgroundColor: constants.colors[backgroundLightColorString]}}>
                    <Typography variant="headline" className={this.props.classes.textBadge}>
                        {Math.round(this.props.confidenceIndex)}
                    </Typography>
                </CardContent>
                <CardMedia
                    className={this.props.classes.media}
                    style={{backgroundColor: constants.colors[backgroundColorString]}}
                    image="#"
                    title={this.props.competency.name}
                />
                <CardContent
                    className={this.props.classes.content}>
                    <Typography gutterBottom variant="headline" component="h2" className={this.props.classes.competency}>
                        {this.props.competency.name}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="small" color="primary">
                        Details
              </Button>
                </CardActions>
            </Card>
        );
    }
}

export default withStyles(styles)(Competency);