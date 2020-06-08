import React from "react";
import queryString from "query-string";

import Container from "react-bootstrap/Container";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import ProgressBar from "react-bootstrap/ProgressBar";
import "bootstrap/dist/css/bootstrap.min.css";

interface Props {}

interface State {
  startTime: number | null;
  endTime: number | null;
}

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      startTime: null,
      endTime: null,
    };
  }

  validateAndRefineTimestamp(rawTimestamp: any) {
    if (isNaN(Number(rawTimestamp))) {
      return null;
    }

    return parseInt(rawTimestamp);
  }

  readQueryStrings() {
    const parsed = queryString.parse(window.location.hash);

    if (this.isValidState(parsed)) {
      return {
        startTime: this.validateAndRefineTimestamp(parsed["s"]),
        endTime: this.validateAndRefineTimestamp(parsed["e"]),
      };
    }

    return null;
  }

  isValidState(parsed: queryString.ParsedQuery<string>) {
    return (
      parsed["s"] != null &&
      !isNaN(Number(parsed["s"])) &&
      parsed["e"] != null &&
      !isNaN(Number(parsed["e"]))
    );
  }

  componentDidMount() {
    const maybeState = this.readQueryStrings();
    if (maybeState) {
      this.setState(maybeState);
    }
  }

  calculatePercentageCompleted(startTime: number, endTime: number) {
    const now = Math.min(Date.now(), endTime);
    const completed = (now - startTime) / (endTime - startTime);

    return Math.floor(completed * 10000) / 100;
  }

  handleInput(id: string) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      const maybeNewTimestamp = this.validateAndRefineTimestamp(newValue);

      if (maybeNewTimestamp == null) {
        return;
      }

      const newState = {
        ...this.state,
        [id]: maybeNewTimestamp,
      };

      this.setState(newState);
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
      <div className="App" style={{ margin: "2rem 0" }}>
        <Container>
          <ProgressBar
            style={{ height: "2rem" }}
            label={`${percentageCompleted}%`}
            now={percentageCompleted}
            striped
            variant="success"
          />
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Start</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
              id="startTime"
              onChange={this.handleInput("startTime")}
              placeholder="Epoch timestamp in ms"
              value={this.state.startTime || ""}
            />
          </InputGroup>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>End</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
              id="endTime"
              onChange={this.handleInput("endTime")}
              placeholder="Epoch timestamp in ms"
              value={this.state.endTime || ""}
            />
          </InputGroup>
        </Container>
      </div>
    );
  }
}

export default App;
