import React, { Component } from "react";
import "./Trivia.css";

class WelcomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.name,
      questions: props.questions,
    };
  }

  handleName = function (newName) {
    let newState = {
      ...this.state,
      name: newName,
    };

    this.setState(newState);
  };

  handleQuestions = function (newQuestions) {
    let newState = {
      ...this.state,
      questions: newQuestions,
    };

    this.setState(newState);
  };

  render() {
    return (
      <div>
        <h1>Welcome screen</h1>
        <label htmlFor="name">Player name: </label>
        <input
          id="name"
          name="name"
          defaultValue={this.state.name}
          onChange={(evt) => this.handleName(evt.target.value)}
        />
        <label htmlFor="questions">How many questions: </label>
        <input
          id="questions"
          name="questions"
          defaultValue={this.state.questions}
          onChange={(evt) => this.handleQuestions(evt.target.value)}
        />
        <input
          type="submit"
          value="Continue to game"
          onClick={() => {
            this.props.continue(this.state.name, this.state.questions);
          }}
        />
      </div>
    );
  }
}

class GameTimer extends Component {
  constructor(props) {
    super(props);

    const interval = setInterval(() => {
      this.updateTime();
    }, 1000);
    this.state = {
      seconds: props.seconds,
      interval: interval,
    };
  }

  reset = function () {
    console.log("reset");
    this.setState({
      ...this.state,
      seconds: this.props.seconds,
    });
  };

  stop = function () {
    console.log("stop");
    clearInterval(this.state.interval);
    this.reset();
  };

  updateTime = function () {
    let remainingSeconds = this.state.seconds - 1;
    if (remainingSeconds === 0) {
      this.props.finished(this.state.interval);
      this.reset();
      return;
    }

    this.setState({
      ...this.state,
      seconds: remainingSeconds,
    });
  };

  render() {
    return <pre>{this.state.seconds}</pre>;
  }
}

class GameScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      amountOfQuestions: props.amountOfQuestions,
      questions: [],
      currentQuestion: 0,
      duration: 10,
    };

    fetch(`https://opentdb.com/api.php?amount=${this.state.amountOfQuestions}`)
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        let currentState = {
          ...this.state,
          questions: json["results"],
        };

        this.setState(currentState);
      });
  }

  handleAnswer = function () {
    const newQuestion = this.state.currentQuestion + 1;
    if (newQuestion === this.state.questions.length) {
      console.log("Game should finish");
      this.refs.gameTimer.stop();
      this.props.finish();
      return;
    }

    let newState = {
      ...this.state,
      currentQuestion: newQuestion,
    };

    this.refs.gameTimer.reset();
    this.setState(newState);
  };

  incorrect = function () {
    console.log("Incorrect answer!");
    this.handleAnswer();
  };

  correct = function () {
    console.log("Correct answer!");
    this.props.increaseScore();
    this.handleAnswer();
  };

  render() {
    if (this.state.questions.length === 0) {
      return <div>Waiting to load questions...</div>;
    }

    const question = this.state.questions[this.state.currentQuestion];

    let possilbeAnswers = [];
    for (let i = 0; i < question.incorrect_answers.length; i++) {
      possilbeAnswers = possilbeAnswers.concat(
        <li
          key={i + 1}
          onClick={() => {
            this.incorrect();
          }}
        >
          {question.incorrect_answers[i]}
        </li>
      );
    }

    const insertCorrect = Math.floor(
      Math.random() * question.incorrect_answers.length
    );
    possilbeAnswers.splice(
      insertCorrect,
      0,
      <li
        key={0}
        onClick={() => {
          this.correct();
        }}
      >
        {question.correct_answer} *
      </li>
    );

    return (
      <div>
        <h1>Game screen</h1>
        <div>
          <div>
            Time remainig:
            <GameTimer
              ref="gameTimer"
              seconds={this.state.duration}
              finished={() => {
                this.incorrect();
              }}
            />
          </div>
          <div>
            Question {this.state.currentQuestion + 1}: {question.question}
          </div>
          <ul>{possilbeAnswers}</ul>
        </div>
      </div>
    );
  }
}

function FinishScreen(props) {
  return (
    <div>
      <h1>Finish screen</h1>
      <div
        onClick={() => {
          props.anotherRound();
        }}
      >
        Click me for another round
      </div>
    </div>
  );
}

class TriviaGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gamePhase: "welcome",
      playerName: props.name,
      amountOfQuestions: props.amountOfQuestions,
    };
  }

  startGame = function (newName, newAmountOfQuestions) {
    let newState = {
      ...this.state,
      score: 0,
      start: 0,
      gamePhase: "game",
      playerName: newName,
      amountOfQuestions: newAmountOfQuestions,
    };

    this.setState(newState);
  };

  increaseScore = function () {
    console.log("We should increase the score");
    let newState = {
      ...this.state,
      score: this.state.score + 1,
    };
    this.setState(newState);
  };

  advanceGameScreen = function (nextScreen) {
    let newState = {
      ...this.state,
      gamePhase: nextScreen,
    };

    console.log(this.state);
    console.log(newState);
    this.setState(newState);
  };

  gotoFinishScreen = function () {
    this.advanceGameScreen("finish");
  };

  render() {
    let screen;
    const gamePhase = this.state.gamePhase;
    if (gamePhase === "welcome") {
      screen = (
        <WelcomeScreen
          name={this.state.playerName}
          questions={this.state.amountOfQuestions}
          continue={(newName, newQuestions) => {
            this.startGame(newName, newQuestions);
          }}
        />
      );
    } else if (gamePhase === "game") {
      screen = (
        <div>
          Welcome {this.state.playerName}, your score is {this.state.score}
          <GameScreen
            amountOfQuestions={this.state.amountOfQuestions}
            increaseScore={() => {
              this.increaseScore();
            }}
            finish={() => {
              this.gotoFinishScreen();
            }}
          />
        </div>
      );
    } else if (gamePhase === "finish") {
      screen = (
        <FinishScreen
          anotherRound={() => {
            this.advanceGameScreen("welcome");
          }}
        />
      );
    }

    return <div>{screen}</div>;
  }
}

class App extends Component {
  render() {
    return (
      <div className="Trivia">
        <header className="Trivia-header">
          <TriviaGame name="Kitzy the Cat" amountOfQuestions="5" />
        </header>
      </div>
    );
  }
}

export default App;
