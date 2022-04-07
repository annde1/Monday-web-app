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
      <div className="container box">
        <h1 className="title">Welcome to Trivia!</h1>
        <div className="field">
          <label htmlFor="name" className="label">
            Player name:{" "}
          </label>
          <div className="control">
            <input
              className="input"
              id="name"
              name="name"
              defaultValue={this.state.name}
              onChange={(evt) => this.handleName(evt.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="questions" className="label">
            How many questions:{" "}
          </label>
          <div className="control">
            <input
              className="input"
              id="questions"
              name="questions"
              defaultValue={this.state.questions}
              onChange={(evt) => this.handleQuestions(evt.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <input
            className="button is-primary"
            type="submit"
            value="Continue to game"
            onClick={() => {
              this.props.continue(this.state.name, this.state.questions);
            }}
          />
        </div>
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
    let timeRemaining = 1 - this.state.seconds / this.props.seconds;

    return (
      <progress
        class="progress is-primary"
        value={this.state.seconds}
        max={this.props.seconds}
      >
        {this.state.seconds}
      </progress>
    );
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
          className="button"
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
        className="button is-light"
        key={0}
        onClick={() => {
          this.correct();
        }}
      >
        {question.correct_answer}
      </li>
    );

    return (
      <div className="box">
        <div className="container">
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
            <h4 className="subtitle is-4">
              {question.category}
              <span className="tag">{question.difficulty}</span>
            </h4>
          </div>
          <div>
            Question {this.state.currentQuestion + 1}: {question.question}
          </div>
          <ul className="buttons">{possilbeAnswers}</ul>
        </div>
      </div>
    );
  }
}

function FinishScreen(props) {
  let message = "Good Job!";
  if (props.score / props.total <= 0.5) {
    message = "Try again next time";
  }

  return (
    <div>
      <h1>Finish screen</h1>
      <div>
        Score: {props.score} / {props.total}
      </div>
      <div>{message}</div>
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
        <div className="cotainer">
          <h1 className="title">Welcome {this.state.playerName}</h1>
          <h2 className="title is-4">your score is {this.state.score}</h2>
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
          score={this.state.score}
          total={this.state.amountOfQuestions}
          anotherRound={() => {
            this.advanceGameScreen("welcome");
          }}
        />
      );
    }

    return <div className="container">{screen}</div>;
  }
}

class App extends Component {
  render() {
    return (
      <div className="Trivia container">
        <TriviaGame name="Kitzy the Cat" amountOfQuestions="5" />
      </div>
    );
  }
}

export default App;
