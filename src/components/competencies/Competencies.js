import React from 'react';
import Competency from '../competency/Competency';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import FreelancerService from '../../services/FreelancerService';

const styles = {
    card: {
        maxWidth: 345
      },
      media: {
        height: 0,
        paddingTop: "56.25%" // 16:9
      },
};

class Competencies extends React.Component {

    constructor() {
        super();
        this.state = {
            competencies: FreelancerService.getFreelancer().getCompetencies(),
        };
    }

    render() {
        const competencies = this.state.competencies

        // Compute confidence index of each competency
        .map((competency) => ({
            competency: competency,
            confidenceIndex: competency.getConfidenceIndex(),
        }))

        // Sort descending by confidence index and let the education at the end
        .sort((extendedCompetencyA, extendedCompetencyB) => {
            if (extendedCompetencyA.competency.name === "Education") return true;
            if (extendedCompetencyB.competency.name === "Education") return false;
            return extendedCompetencyA.confidenceIndex < extendedCompetencyB.confidenceIndex;
        })

        // Generate components
        .map((extendedCompetency, index) => 
            <Grid item xs={12} sm={6} lg={4} key={index}>
                <Competency competency={extendedCompetency.competency} confidenceIndex={extendedCompetency.confidenceIndex}></Competency>
            </Grid>
        );

        return (
            <Grid container spacing={24}>
                {competencies}
            </Grid>
        );
    }
}

export default withStyles(styles)(Competencies);