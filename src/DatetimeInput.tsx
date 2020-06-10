import React from "react";

import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import DatePicker from "react-datepicker";

interface DatetimeInputProps {
  label: string;
  stateIdentifier: string;

  time: Date | null;
  onChange: (date: Date | null) => void;
}

export default (props: DatetimeInputProps) => {
  return (
    <Row className="justify-content-center">
      <Col xs="auto">
        <InputGroup style={{ display: "block", marginBottom: "1rem" }}>
          <Row className="justify-content-center">
            <p style={{ margin: 0 }}>{props.label}</p>
          </Row>
          <Row className="justify-content-center">
            <div style={{ margin: "2px" }}>
              <DatePicker
                selected={props.time}
                onChange={props.onChange}
                dateFormat="MMMM d, yyyy"
              />
            </div>
            <div style={{ margin: "2px" }}>
              <DatePicker
                showTimeSelect
                showTimeSelectOnly
                selected={props.time}
                onChange={props.onChange}
                dateFormat="h:mm aa"
              />
            </div>
          </Row>
        </InputGroup>
      </Col>
    </Row>
  );
};
