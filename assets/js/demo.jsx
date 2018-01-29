import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import Tile from './tile';
import TileComponent from './TileComponent';

export default function run_demo(root) {
  ReactDOM.render(<div id="parentDiv"><Demo /></div>, root);
}

class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.init();
    this.gameCount = 0;
    this.pairs = 0;
  }

  init() {
    const letters = ["A", "A", "B", "B", "C", "C", "D", "D", "E", "E", "F", "F", "G", "G", "H", "H"];

    // found how to do maps from: http://www.hackingwithreact.com/read/1/13/rendering-an-array-of-data-with-map-and-jsx
    const grid = [[], [], [], []];

    let len = 16;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let dec = Math.random() * len;
        let num = Math.floor(dec);
        grid[i][j] = new Tile(letters[num]);
        letters.splice(num, 1);
        len--;
      }
    }
    const startingState = { grid: grid, playerClicks: 0, selectedTiles: [] };
    return startingState;
  }

  reset() {
    this.gameCount++;
    this.setState(this.init());
  }

  endGame() {
    this.reset();
    alert("Winner! Score: " + this.state.playerClicks);
    this.pairs = 0;
  }

  whenClicked(tile, resetTile, tilesMatch, isMatching) {
    // ignores clicks during match timeout
    if (this.state.selectedTiles.length == 2) {
      return;
    }
    isMatching();
    this.setState({ playerClicks: this.state.playerClicks + 1 });
    // learned about spread operator from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator
    // adding the function calls in the array in order to reset the first and second tiles
    this.setState({ selectedTiles: [{ tile: tile, resetting: resetTile, theyMatch: tilesMatch }, ...this.state.selectedTiles] },
      // callback
      () => {
        if (this.state.selectedTiles.length == 2) {
          let comparingTiles = (this.state.selectedTiles[0].tile.letter === this.state.selectedTiles[1].tile.letter);

          if (comparingTiles) {
            this.state.selectedTiles[0].theyMatch();
            this.state.selectedTiles[1].theyMatch();
            this.setState({ selectedTiles: [] });
            this.pairs++;
            // check if game ends
            if (this.pairs == 8) {
              this.endGame();
            }
          } else {
            // learned about setTimeout() here: https://www.w3schools.com/jsref/met_win_settimeout.asp
            setTimeout(() => {
              this.state.selectedTiles[0].resetting();
              this.state.selectedTiles[1].resetting();
              this.setState({ selectedTiles: [] });
            }, 1000
            );
          }
        }
      }
    );
  }

  render() {
    const rowsArr = [];

    let i = 1;
    let j = 1;

    for (let x of this.state.grid) {
      const cols = [];

      for (let z of x) {
        cols.push(<TileComponent key={((this.gameCount * 16) + i).toString()} tile={z} onSelect={this.whenClicked.bind(this)} />);
        i++;
      }

      rowsArr.push(
        <div className="row" key={j.toString()}>
          {cols}
        </div>
      );
      j++;
    }

    return (
      <div>
        <Button onClick={this.reset.bind(this)}>Reset</Button>
        {rowsArr}
      </div>
    );
  }
}
