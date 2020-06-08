import React from "react";
import queryString from "query-string";

import Alert from "react-bootstrap/alert";
import Container from "react-bootstrap/Container";
import InputGroup from "react-bootstrap/InputGroup";
import ProgressBar from "react-bootstrap/ProgressBar";
import DatePicker from "react-datepicker";

import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "./overrides.css";

interface Props {}

interface State {
  startTime: Date | null;
  endTime: Date | null;
  inErrorState: boolean;
}

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const now = Date.now();
    const minuteInMs = 60 * 1000;
    this.state = {
      startTime: new Date(now),
      endTime: new Date(now + minuteInMs),
      inErrorState: false,
    };
  }

  validateAndRefineTimestamp(rawTimestamp: any) {
    if (isNaN(Number(rawTimestamp))) {
      return null;
    }

    return new Date(rawTimestamp);
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
            <div style={{ display: "flex", margin: "auto" }}>
              <InputGroup.Prepend>
                <InputGroup.Text>Start time</InputGroup.Text>
              </InputGroup.Prepend>
              <DatePicker
                selected={this.state.startTime}
                onChange={this.handleInput("startTime")}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={1}
                timeCaption="time"
                dateFormat="MMMM d, yyyy h:mm aa"
              />
            </div>
          </InputGroup>
          <InputGroup>
            <div style={{ display: "flex", margin: "auto" }}>
              <InputGroup.Prepend>
                <InputGroup.Text>End time</InputGroup.Text>
              </InputGroup.Prepend>
              <DatePicker
                selected={this.state.endTime}
                onChange={this.handleInput("endTime")}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={1}
                timeCaption="time"
                dateFormat="MMMM d, yyyy h:mm aa"
              />
            </div>
          </InputGroup>
        </Container>
      </div>
    );
  }
}

export default App;
