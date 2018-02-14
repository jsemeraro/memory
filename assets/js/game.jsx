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

  resetResp(resp) {
    this.setState(resp);
  }

  reset() {
    this.channel.push("reset").receive("ok", this.resetResp.bind(this));
  }

  endGame() {
    alert("Winner! Score: " + this.state.game.guesses);
  }

  guessComplete(resp) {
    console.log(resp.game);
    this.setState({game: resp.game}, () => {
      this.lockClicks = false;
      if (this.state.game.pairs == 8) {
        this.endGame();
      }
    });
  }

  tileClickedResp(resp) {
    this.setState({game: resp.game}, () => {
      if (resp.game.dontGuess) {
        this.lockClicks = false;
      } else {
        setTimeout(() => {
          this.channel.push("guess").receive("ok", this.guessComplete.bind(this));
        }, 1000);
      }
    });
  }
  
  tileClicked(x, y) {
    console.log(this.lockClicks);
    if (this.lockClicks) {
      return;
    } else {
      this.channel.push("flip", {coords: [x, y]}).receive("ok", this.tileClickedResp.bind(this));
      this.lockClicks = true;
    }
  }

  render() {
    if (!(this.state && this.state.game && this.state.game.board)) {
      return (<div>Loading...</div>);
    }

    let key = 0;
    let x = 2;
    let y = 1;
    const rowsArr = [];

    let grid = this.state.game.board;

    for (let i in grid) {
      let val = grid[i]
      const cols = [];
      for (let j in val) {
        let letter = Object.values(grid)[i][j];
        
        key += 1;
        cols.push(
          <div className="col-sm-3" onClick={() => this.tileClicked(i,j)} key={key.toString()}>
            <span>{letter}</span>
          </div>
        );
        x++;
      }

      rowsArr.push(
        <div className="row">
          {cols}
        </div>
      );
      y++;
    }

    return (
      <div>
        <div className="row mb-4">
          <Button className="col-md-6" onClick={this.reset.bind(this)}>Reset</Button>
          <span className="col-md-6 text-center">Guesses: {this.state.game.guesses}</span>
        </div>
        {rowsArr}
      </div>
    );
  }
}