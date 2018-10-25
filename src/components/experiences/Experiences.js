import React, { Component } from 'react';
import Experience from '../experience/Experience';

export default class Experiences extends Component {
  render() {
    const experiences = this.props.value.map((experience, index) =>
    (<Experience
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
