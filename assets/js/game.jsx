import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import Tile from './tile';
import TileComponent from './TileComponent';

export default function run_game(root) {
  ReactDOM.render(<div id="parentDiv"><Game /></div>, root);
}

class Game extends React.Component {
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

  winner() {
    return (
      <div class="modal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Winner!</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <p>You won with a score of: {this.state.playerClicks}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  endGame() {
    this.reset();
    this.pairs = 0;
    this.winner();
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
        <tr className="grid-row" key={j.toString()}>
          {cols}
        </tr>
      );
      j++;
    }

    return (
      <div>
        <span className="row reset-btn"><Button onClick={this.reset.bind(this)}>Reset</Button></span>
        <div class="grid-container">
          <table id="grid">
            <tbody>
              {rowsArr}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
