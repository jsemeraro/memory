import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';

export default class TileComponent extends React.Component {
  constructor(props) {
    super(props);
    // setting the state to an instance of the tile class
    this.state = props.tile;
    this.onSelect = props.onSelect;
  }

  clicked() {
    this.onSelect(this.state, this.resetTile.bind(this), this.tilesMatch.bind(this), this.isMatching.bind(this));
  }

  isMatching() {
    this.setState({matching: true});
  }

  resetTile() {
    this.setState({matching: false});
  }

  tilesMatch() {
    this.setState({isMatched: true});
    this.setState({matching: false});
  }

  render() {
    if (this.state.isMatched || this.state.matching) {
      return (
        <td class="grid-col" >
          <span>
              {this.state.letter}
          </span>
        </td>
      );
    }

    else {
      return (
        <td class="grid-col" onClick={ this.clicked.bind(this) } >
          <span> </span>
        </td>
      );
    }
  }
}
