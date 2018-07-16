import React from 'react';
import Competency from '../competency/Competency';
import { withStyles } from '@material-ui/core/styles';
import FreelancerService from '../../services/FreelancerService';

const styles = {
    competenciesContainer: {
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    competencyContainer: {
        flexBasis: 'auto',
        width: '350px',
        marginRight: '20px',
        marginBottom: '20px',
    },
    '@media screen and (max-width: 950px)': {
        competencyContainer: {
            flexBasis: '100%',
            marginRight: '0',
        },
    },
    competencyContainerFocused: {
        animationName: 'focusCompetency',
        animationDuration: '.2s',
        animationDelay: '.1s',
        animationFillMode: 'forwards',
    },
    competencyContainerHidden: {
        animationName: 'hideCompetency',
        animationDuration: '.2s',
        animationFillMode: 'forwards',
    },
    '@keyframes hideCompetency': {
        '0%': {
            opacity: 1,
            height: '340px',
            width: '350px',
        },
        '50%': {
            opacity: 0,
            width: '350px',
            height: '340px',
            marginRight: '20px',
            marginBottom: '20px',
        },
        '75%': {
            opacity: 0,
            width: '0',
            height: '0',
            marginRight: '0',
            marginBottom: '0',
        },
        '100%': {
            opacity: 0,
            width: '0',
            height: '0',
            marginRight: '0',
            marginBottom: '0',
        },
    },
    '@keyframes focusCompetency': {
        '0%': {
            width: '350px',
            marginRight: '20px',
            marginBottom: '20px',
        },
        '100%': {
            width: '100%',
            marginRight: '0',
            marginBottom: '0',
        },
    },
};

class Competencies extends React.Component {

    constructor(props) {
        super(props);
        this.free = FreelancerService.getFreelancer();
        if (this.props.location.state != null) {
            this.freelancerAddress = this.props.location.state.address;
        } else if (this.props.location.search !== null && this.props.location.search !== "") {
            var address = this.props.location.search
            this.freelancerAddress = address.substring(1, address.length);
        }

        //A client is searching a freelancer, so we display his Vault
        if(this.freelancerAddress !== null && typeof this.freelancerAddress !== 'undefined')
            this.free.initFreelancer(this.freelancerAddress);

        this.state = {
            competencies: this.free.getCompetencies(),
        };
    }

    componentDidMount() {
        this.free.addListener('ExperienceChanged', this.handleEvents, this);
    }

    componentWillUnmount() {
        this.free.removeListener('ExperienceChanged', this.handleEvents, this);
        this.isCancelled = true;
    }
    

    handleEvents = () => {
        !this.isCancelled && this.setState({
            competencies: this.free.getCompetencies()
        });
        if(!this.isCancelled) this.forceUpdate();
    };

    render() {
        const oneCompetencyFocused = (this.props.match.params.competencyName);
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
            .map((extendedCompetency, index) => {
                const thisCompetencyFocused = extendedCompetency.competency.name === this.props.match.params.competencyName;
                let appliedClasses = [this.props.classes.competencyContainer];
                let layout = 'normal';
                if (thisCompetencyFocused) {
                    layout = 'focused';
                    appliedClasses.push(this.props.classes.competencyContainerFocused);
                }
                else if (oneCompetencyFocused) {
                    layout = 'hidden';
                    appliedClasses.push(this.props.classes.competencyContainerHidden);
                }
                return (
                    <div key={index} className={appliedClasses.join(' ')}>
                        <Competency
                            competency={extendedCompetency.competency}
                            confidenceIndex={extendedCompetency.confidenceIndex}
                            layout={layout}>
                        </Competency>
                    </div>
                );
            });
        return (
            <div className={this.props.classes.competenciesContainer}>
                {competencies}
            </div>
        );
        
    }
}

export default withStyles(styles)(Competencies);