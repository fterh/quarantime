import React from "react";
import queryString from "query-string";

import Alert from "react-bootstrap/alert";
import Container from "react-bootstrap/Container";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import ProgressBar from "react-bootstrap/ProgressBar";
import "bootstrap/dist/css/bootstrap.min.css";

interface Props {}

interface State {
  startTime: number | null;
  endTime: number | null;
  inErrorState: boolean;
}

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      startTime: null,
      endTime: null,
      inErrorState: false,
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

    if (this.isValidParsedQueryStrings(parsed)) {
      return {
        startTime: this.validateAndRefineTimestamp(parsed["s"]),
        endTime: this.validateAndRefineTimestamp(parsed["e"]),
      };
    }

    return null;
  }

  isValidParsedQueryStrings(parsed: queryString.ParsedQuery<string>) {
    return (
      parsed["s"] != null &&
      !isNaN(Number(parsed["s"])) &&
      parsed["e"] != null &&
      !isNaN(Number(parsed["e"]))
    );
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

  componentDidMount() {
    const maybeState = this.readQueryStrings();
    if (maybeState) {
      this.setState(maybeState, this.validateState);
    }
  }

  calculatePercentageCompleted(startTime: number, endTime: number) {
    // Force now to be within the start - end range
    // to prevent weird return values (<0 or >100)
    const now = Math.max(Math.min(Date.now(), endTime), startTime);

    // Prevent infinity return value
    if (endTime === startTime) {
      return 100;
    }

    const completed = (now - startTime) / (endTime - startTime);
    return Math.min(Math.floor(completed * 10000) / 100, 100);
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

      this.setState(newState, this.validateState);
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
        <Container fluid="md">
          <ProgressBar
            style={{ height: "2rem", marginBottom: "3rem" }}
            label={`${percentageCompleted}%`}
            now={percentageCompleted}
            striped
            variant="success"
          />

          {this.state.inErrorState && (
            <Alert variant="danger">You have entered invalid values</Alert>
          )}

          <InputGroup style={{ marginBottom: "1rem" }}>
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
