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
        <div className="col-sm-3" >
          <span>
              {this.state.letter}
          </span>
        </div>
      );
    }

    else {
      return (
        <div className="col-sm-3" onClick={ this.clicked.bind(this) } >
          <span> </span>
        </div>
      );
    }
  }
}
