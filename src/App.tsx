import React from "react";
import { Base64 } from "js-base64";

import Alert from "react-bootstrap/Alert";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import InputGroup from "react-bootstrap/InputGroup";
import ProgressBar from "react-bootstrap/ProgressBar";
import Row from "react-bootstrap/Row";
import DatePicker from "react-datepicker";
import Countdown from "./Countdown";
import DatetimeInput from "./DatetimeInput";

import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "./overrides.css";

interface Props {}

interface EncodableState {
  startTime: Date | null;
  endTime: Date | null;
}

type State = EncodableState & {
  now: Date;
  inErrorState: boolean;
};

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const now = new Date();
    const minuteInMs = 60 * 1000;
    this.state = {
      now: now,
      startTime: now,
      endTime: new Date(now.getTime() + minuteInMs),
      inErrorState: false,
    };
  }

  validateState() {
    if (this.state.startTime == null || this.state.endTime == null) {
      return;
    }

    if (this.state.startTime > this.state.endTime) {
      this.setState({
        ...this.state,
        inErrorState: true,
      });
    } else {
      this.setState({
        ...this.state,
        inErrorState: false,
      });
    }
  }

  isLegalState(state: any) {
    const notIllegal =
      state["startTime"] &&
      !isNaN(Date.parse(state["startTime"])) &&
      state["endTime"] &&
      !isNaN(Date.parse(state["endTime"]));
    return notIllegal;
  }

  encodeHashFragment() {
    const state = Object.assign({}, this.state) as State;

    // Strip unnecessary properties
    delete state["now"];
    delete state["inErrorState"];

    const json = JSON.stringify(state);
    window.location.hash = Base64.encode(json);
  }

  decodeHashFragment(): EncodableState | null {
    const hash = window.location.hash;
    const decoded = Base64.decode(hash);
    const state = JSON.parse(decoded);

    if (this.isLegalState(state)) {
      return {
        startTime: new Date(state["startTime"]),
        endTime: new Date(state["endTime"]),
      };
    }

    return null;
  }

  postSetState() {
    this.validateState();
    this.encodeHashFragment();
  }

  tick() {
    // This is trivial enough to skip validateState
    this.setState({
      now: new Date(),
    });
  }

  componentDidMount() {
    let maybeState;
    try {
      maybeState = this.decodeHashFragment();
    } catch {
      // Do nothing
    }
    if (maybeState) {
      this.setState(
        {
          ...this.state,
          ...maybeState,
        },
        this.validateState
      );
    } else {
      this.encodeHashFragment();
    }

    setInterval(() => {
      this.tick();
    }, 1000);
  }

  calculatePercentageCompleted(startTime: Date, endTime: Date) {
    // Force now to be within the start - end range
    // to prevent weird return values (<0 or >100)
    const now = Math.max(
      Math.min(Date.now(), endTime.getTime()),
      startTime.getTime()
    );

    // Prevent infinity return value
    if (endTime === startTime) {
      return 100;
    }

    const completed =
      (now - startTime.getTime()) / (endTime.getTime() - startTime.getTime());
    return Math.min(Math.floor(completed * 10000) / 100, 100);
  }

  handleInput(id: string) {
    return (newTime: Date | null) => {
      const newState = {
        ...this.state,
        [id]: newTime,
      };

      this.setState(newState, this.postSetState);
    };
  }

  render() {
    let percentageCompleted = 0;
    if (this.state.startTime != null && this.state.endTime != null) {
      percentageCompleted = this.calculatePercentageCompleted(
        this.state.startTime,
        this.state.endTime
      );
    }

    return (
      <div className="App" style={{ margin: "2rem" }}>
        <div style={{ margin: "1rem auto", textAlign: "center" }}>
          <h1>quarantime</h1>
          <h2>visually progressive countdown</h2>
        </div>

        <Container>
          <ProgressBar
            style={{ height: "2rem", marginBottom: "3rem" }}
            label={`${percentageCompleted}%`}
            now={percentageCompleted}
            striped
            variant="success"
          />

          {this.state.inErrorState ? (
            <Alert variant="danger">You have entered invalid values</Alert>
          ) : (
            <div style={{ textAlign: "center" }}>
              <h2>
                <Countdown
                  now={this.state.now}
                  startTime={this.state.startTime}
                  endTime={this.state.endTime}
                />
              </h2>
            </div>
          )}
          <Container style={{ margin: "2rem auto" }}>
            <DatetimeInput
              label="Start"
              stateIdentifier="startTime"
              time={this.state.startTime}
              onChange={this.handleInput("startTime")}
            />

            <DatetimeInput
              label="End"
              stateIdentifier="endTime"
              time={this.state.endTime}
              onChange={this.handleInput("endTime")}
            />
          </Container>
        </Container>
      </div>
    );
  }
}

export default App;
