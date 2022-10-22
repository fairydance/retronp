import React from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import {GraphData} from "../../../../../utils/base";
import {secondToHHMMSS} from "../../../../../utils/time";
import "./form-input.scss";

export interface FormInputProps {
  onSubmit: () => void;
  onRespond: (data: {status: {success: boolean, message: string}, graph: GraphData}, timeElapsed: number) => void;
}

export interface FormInputState {
  targetSmiles: string;
  running: boolean;
  startTime: Date;
  endTime: Date;
}

export default class FormInput extends React.Component<FormInputProps, FormInputState> {
  constructor(props: FormInputProps) {
    super(props);
    this.state = {
      targetSmiles: '',
      running: false,
      startTime: new Date(),
      endTime: new Date()
    };
    this.tick = this.tick.bind(this);
    this.handleTargetSmilesChange = this.handleTargetSmilesChange.bind(this);
    this.handleInputFormSubmit = this.handleInputFormSubmit.bind(this);
  }

  tick() {
    this.setState({endTime: new Date()});
  }

  handleTargetSmilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({targetSmiles: event.target.value});
  }

  handleInputFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("targetSmiles", this.state.targetSmiles);
    this.setState({running: true, startTime: new Date(), endTime: new Date()});
    const timerID = setInterval(this.tick, 1000);
    this.props.onSubmit();
    fetch('http://162.105.160.202:5000/retronp/api/bio/network-predict', {
      method: 'POST',
      body: formData,
    })
    // fetch('/api/network-predict', {
    //   method: 'POST',
    //   body: formData,
    // })
    .then(res => res.json())
    .then(data => {
      this.props.onRespond(data, Math.floor((this.state.endTime.getTime() - this.state.startTime.getTime()) / 1000));
      this.setState({running: false});
      clearInterval(timerID);
    })
    .catch(err => console.error(err));
  }

  render() {
    let mainElement: JSX.Element;

    if (this.state.running) {
      const timeElapsedString = secondToHHMMSS(Math.floor((this.state.endTime.getTime() - this.state.startTime.getTime()) / 1000));
      mainElement = (
        <div className="task-progress">
          <LinearProgress />
          <Box className="progress-statement"
            sx={{
              color: "primary.main",
            }}
          >
            <h1>Running</h1>
            <p>time elapsed: {timeElapsedString}</p>
          </Box>
        </div>
      )
    } else {
      mainElement = (
        <form className="input-form" onSubmit={this.handleInputFormSubmit}>
          <TextField required variant="outlined"
            className="target-smiles-text-field"
            label="Target SMILES"
            name="targetSmiles"
            value={this.state.targetSmiles}
            onChange={this.handleTargetSmilesChange}
            disabled={this.state.running}
          />
          <Button variant="contained"
            className="submit-button"
            type="submit"
            disabled={this.state.running}
          >
            Submit
          </Button>
        </form>
      );
    }

    return (
      <div className="form-input">
        {mainElement}
      </div>
    );
  }
}