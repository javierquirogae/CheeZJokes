import React, { Component } from "react";
import axios from "axios";
import "./JokeList.css";

class JokeList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jokes: []
    };
  }

  componentDidMount() {
    if (this.state.jokes.length === 0) {
      this.getJokes();
    }
  }

  async getJokes() {
    console.debug("Fetching jokes...");
    const { numJokesToGet } = this.props;
    const { jokes } = this.state;
    let j = [...jokes];
    let seenJokes = new Set();
    try {
      while (j.length < numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        let { status, ...jokeObj } = res.data;

        if (!seenJokes.has(jokeObj.id)) {
          seenJokes.add(jokeObj.id);
          j.push({ ...jokeObj, votes: 0 });
        } else {
          console.debug("Duplicate joke found!");
        }
      }
      console.debug("Jokes fetched:", j);
      this.setState({ jokes: j });
    } catch (e) {
      console.error("Error fetching jokes:", e);
    }
  }

  generateNewJokes() {
    console.debug("Generating new jokes...");
    this.setState({ jokes: [] });
  }

  vote(id, delta) {
    console.debug(`Voting on joke with id ${id}, delta: ${delta}`);
    this.setState((prevState) => ({
      jokes: prevState.jokes.map((j) =>
        j.id === id ? { ...j, votes: j.votes + delta } : j
      )
    }));
  }

  render() {
    const { jokes } = this.state;
    console.debug("Current jokes:", jokes);

    if (jokes.length) {
      let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);
      console.debug("Sorted jokes:", sortedJokes);

      return (
        <div className="JokeList">
          <button className="JokeList-getmore" onClick={() => this.generateNewJokes()}>
            Get New Jokes
          </button>

          {sortedJokes.map((j) => (
            <div className="Joke" key={j.id}>
              <div className="Joke-votes">{j.votes}</div>
              <div className="Joke-text">{j.joke}</div>
              <div className="Joke-buttons">
                <button onClick={() => this.vote(j.id, 1)}>Upvote</button>
                <button onClick={() => this.vote(j.id, -1)}>Downvote</button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <JokeList numJokesToGet={10} />
      </div>
    );
  }
}

export default App;

