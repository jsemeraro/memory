import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import Tile from './tile';
import TileComponent from './TileComponent';
import socket from "./socket";

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    // name given from Login -> Host -> Game
    this.name = props.name;
    this.gameCount = 0;
    this.pairs = 0;
    this.lockClicks = false;
    
    this.channel = socket.channel("games:" + this.name, {});
    this.channel.join()
      .receive("ok", this.gotView.bind(this))
      .receive("error", resp => { console.log("Unable to join", resp) });
  }

  // game = {board:{...}, guesses: 1} 
  gotView(game) {
    this.setState(game);
    console.log("New view", this.state.game.board);
  }

  // init() {
  //   const letters = ["A", "A", "B", "B", "C", "C", "D", "D", "E", "E", "F", "F", "G", "G", "H", "H"];

  //   // found how to do maps from: http://www.hackingwithreact.com/read/1/13/rendering-an-array-of-data-with-map-and-jsx
  //   const grid = [[], [], [], []];

  //   let len = 16;

  //   for (let i = 0; i < 4; i++) {
  //     for (let j = 0; j < 4; j++) {
  //       let dec = Math.random() * len;
  //       let num = Math.floor(dec);
  //       grid[i][j] = new Tile(letters[num]);
  //       letters.splice(num, 1);
  //       len--;
  //     }
  //   }
  //   const startingState = { grid: grid, playerClicks: 0, selectedTiles: [] };
  //   return startingState;
  // }

  reset() {
    this.gameCount++;
    this.setState(this.init());
  }

  endGame() {
    this.reset();
    alert("Winner! Score: " + this.state.playerClicks);
    this.pairs = 0;
  }

  // whenClicked(tile, resetTile, tilesMatch, isMatching) {
  //   // ignores clicks during match timeout
  //   if (this.state.selectedTiles.length == 2) {
  //     return;
  //   }
  //   isMatching();
  //   this.setState({ playerClicks: this.state.playerClicks + 1 });
  //   // learned about spread operator from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator
  //   // adding the function calls in the array in order to reset the first and second tiles
  //   this.setState({ selectedTiles: [{ tile: tile, resetting: resetTile, theyMatch: tilesMatch }, ...this.state.selectedTiles] },
  //     // callback
  //     () => {
  //       if (this.state.selectedTiles.length == 2) {
  //         let comparingTiles = (this.state.selectedTiles[0].tile.letter === this.state.selectedTiles[1].tile.letter);

  //         if (comparingTiles) {
  //           this.state.selectedTiles[0].theyMatch();
  //           this.state.selectedTiles[1].theyMatch();
  //           this.setState({ selectedTiles: [] });
  //           this.pairs++;
  //           // check if game ends
  //           if (this.pairs == 8) {
  //             this.endGame();
  //           }
  //         } else {
  //           // learned about setTimeout() here: https://www.w3schools.com/jsref/met_win_settimeout.asp
  //           setTimeout(() => {
  //             this.state.selectedTiles[0].resetting();
  //             this.state.selectedTiles[1].resetting();
  //             this.setState({ selectedTiles: [] });
  //           }, 1000
  //           );
  //         }
  //       }
  //     }
  //   );
  // }

  guessComplete(resp) {
    console.log(resp.game);
    this.setState({game: resp.game});
    this.lockClicks = false;
  }

  tileClickedResp(resp) {
    this.setState({game: resp.game});
    console.log(resp.game);

    if (resp.game.dontGuess) {
      this.lockClicks = false;
    } else {
      setTimeout(() => {
        this.channel.push("guess").receive("ok", this.guessComplete.bind(this));
      }, 2000);
    }
  }
  
  tileClicked(x, y) {
    if (this.lockClicks) {
      return;
    }
    this.channel.push("flip", {coords: [x, y]}).receive("ok", this.tileClickedResp.bind(this));
    this.lockClicks = true;
  }

  render() {
    if (!(this.state && this.state.game && this.state.game.board)) {
      return (<div>Loading...</div>);
    }

    let x = 2;
    let y = 1;
    const rowsArr = [];

    let grid = this.state.game.board;

    for (let i in grid) {
      let val = grid[i]
      const cols = [];
      for (let j in val) {
        let letter = Object.values(grid)[i][j];
        
        // cols.push(<TileComponent key={((this.gameCount * 16) + i).toString()} tile={z} onSelect={this.whenClicked.bind(this)} />);
        cols.push(
          <div className="col-sm-3" onClick={() => this.tileClicked(i,j)} key={((this.gameCount * 16) + x).toString()}>
            <span>{letter}</span>
          </div>
        );
        x++;
      }

      rowsArr.push(
        // <div className="row" key={j.toString()}>
        <div className="row" key={y.toString()}>
          {cols}
        </div>
      );
      y++;
    }

    return (
      <div>
        <Button onClick={this.reset.bind(this)}>Reset</Button>
        {rowsArr}
      </div>
    );
  }
}
