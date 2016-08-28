import React from 'react';

export default class Dot extends React.Component {
  render() {
    return (
      <span style={{"fontSize": "24px", "color": this.props.visible ? "#41abe0" : "#999"}}>●</span>
    )
  }
}
