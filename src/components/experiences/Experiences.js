import React, { Component } from 'react';
import PublicExperience from '../public/PublicExperience';

export default class Experiences extends Component {
  render() {
    const experiences = this.props.value.map((experience, index) =>
    (<PublicExperience
      experience={experience}
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
