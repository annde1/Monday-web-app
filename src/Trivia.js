import React, { Component } from "react";
import "./Trivia.css";

function ImageComponent(props) {
  return (
    <div>
      <figure className="is-128x128 mt-4 mb-4">
        <img src={props.url} alt={props.alt} width={"300"} height={"300"} />
      </figure>
    </div>
  );
}

class WelcomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.name,
      questions: props.questions,
      cheatmode: props.cheatmode,
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

  handleCheatmode = function (cheatmode) {
    let newState = {
      ...this.state,
      cheatmode: cheatmode,
    };

    this.setState(newState);
  };

  render() {
    return (
      <div className="container box">
        <h1 className="title">Welcome to Trivia!</h1>
        <div>
          <p>
            Hello, please enter below your name and numbers of question you want
            play. This game is played in a series of questions. Only one answer
            is true. Note, that your time for each question is limited. At the
            end of each turn you will be presented your score. Enjoy the game!{" "}
          </p>
        </div>
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
            How many questions:
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
          <div className="control">
            <label htmlFor="cheatmode" className="checkbox">
              <input
                type="checkbox"
                className="checkbox mr-2"
                id="cheatmode"
                name="cheatmode"
                defaultValue={this.state.cheatmode}
                checked={this.state.cheatmode}
                onChange={(evt) => this.handleCheatmode(evt.target.checked)}
              />
              Cheat mode
            </label>
          </div>
        </div>
        <div className="field">
          <input
            className="button is-primary"
            type="submit"
            value="Continue to game"
            onClick={() => {
              this.props.continue(
                this.state.name,
                this.state.questions,
                this.state.cheatmode
              );
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
    this.setState({
      ...this.state,
      seconds: this.props.seconds,
    });
  };

  stop = function () {
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
    return (
      <progress
        className="progress is-primary"
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
      return (
        <div className="box">
          <progress className="progress is-large is-info" max="100">
            60%
          </progress>
        </div>
      );
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
          <React.Fragment>{question.incorrect_answers[i]}</React.Fragment>
        </li>
      );
    }

    const insertCorrect = Math.floor(
      Math.random() * question.incorrect_answers.length
    );

    let cheatmode = "";
    if (this.props.cheatmode) {
      console.log("Cheat mode active");
      cheatmode = " is-light";
    }

    possilbeAnswers.splice(
      insertCorrect,
      0,
      <li
        className={"button" + cheatmode}
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
          <div className="mb-5 mt-5 has-text-centered">
            <p className="heading">{question.category}</p>
            <p className="title is-4">
              Question {this.state.currentQuestion + 1}:
              <span dangerouslySetInnerHTML={{ __html: question.question }} />
            </p>
          </div>

          <div className="is-flex is-justify-content-center	">
            <ul className="buttons has-text-centered">{possilbeAnswers}</ul>
          </div>
        </div>
      </div>
    );
  }
}

function FinishScreen(props) {
  let heroClass = "is-primary";
  let heroTitle = "Good Job!";
  let heroSubtitle = "Trivia night!";

  let winnerImage = "https://cdn-icons-png.flaticon.com/512/3480/3480315.png";
  let winnerAlt = "happy face";

  if (Number(props.score) === Number(props.total)) {
    heroSubtitle = "You got all right!";
    winnerImage = "https://cdn-icons-png.flaticon.com/512/3322/3322105.png";
    winnerAlt = "you won!";
  }

  if (props.score / props.total <= 0.5) {
    heroClass = "is-warning";
    heroTitle = "Try again next time";
    heroSubtitle = "Practice makes you better";
    winnerImage = "https://cdn-icons-png.flaticon.com/512/3782/3782093.png";
    winnerAlt = "confused";
  }

  return (
    <div className="has-text-centered">
      <h1 className="title">Game Over</h1>

      <div className="box">
        <div className="title is-4">
          Score: {props.score} / {props.total}
        </div>
        <div className="has-text-centered">
          <section class={"hero " + heroClass}>
            <div class="hero-body">
              <p class="title">{heroTitle}</p>
              <p class="subtitle">{heroSubtitle}</p>
            </div>
          </section>

          <div>
            <ImageComponent url={winnerImage} alt={winnerAlt} />
          </div>
          <div
            className="button is-primary"
            onClick={() => {
              props.anotherRound();
            }}
          >
            Click me for another round
          </div>
        </div>
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

  startGame = function (newName, newAmountOfQuestions, cheatmode) {
    let newState = {
      ...this.state,
      cheatmode: cheatmode,
      score: 0,
      start: 0,
      gamePhase: "game",
      playerName: newName,
      amountOfQuestions: newAmountOfQuestions,
    };
    this.setState(newState);
  };

  increaseScore = function () {
    let newState = {
      ...this.state,
      score: this.state.score + 1,
    };
    // console.log(newState);
    this.setState(newState);
    // console.log(this.state);
  };

  advanceGameScreen = function (nextScreen) {
    this.setState((state, props) => {
      return {
        ...state,
        gamePhase: nextScreen,
      };
    });
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
          continue={(newName, newQuestions, cheatmode) => {
            console.log(cheatmode);
            this.startGame(newName, newQuestions, cheatmode);
          }}
          cheatmode={this.state.cheatmode}
        />
      );
    } else if (gamePhase === "game") {
      screen = (
        <div className="cotainer">
          <section className="hero is-primary is-small">
            <div className="hero-body">
              <p className="title">Welcome {this.state.playerName}</p>
              <p className="subtitle">your score is {this.state.score}</p>
            </div>
          </section>
          <GameScreen
            amountOfQuestions={this.state.amountOfQuestions}
            increaseScore={() => {
              this.increaseScore();
            }}
            finish={() => {
              this.gotoFinishScreen();
            }}
            cheatmode={this.state.cheatmode}
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
