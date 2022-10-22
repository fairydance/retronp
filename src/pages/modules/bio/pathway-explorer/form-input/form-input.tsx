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
  onRespond: (data: {status: {success: boolean, message: string}, graphs: GraphData[]}, timeElapsed: number) => void;
}

export interface FormInputState {
  targetSmiles: string;
  maxDepth: number;
  maxIteration: number;
  maxRunningTime: number;
  maxPathwayDisplayed: number;
  running: boolean;
  startTime: Date;
  endTime: Date;
}

export default class FormInput extends React.Component<FormInputProps, FormInputState> {
  constructor(props: FormInputProps) {
    super(props);
    this.state = {
      targetSmiles: '',
      maxDepth: 3,
      maxIteration: 1,
      maxRunningTime: 30,
      maxPathwayDisplayed: 5,
      running: false,
      startTime: new Date(),
      endTime: new Date()
    };
    this.tick = this.tick.bind(this);
    this.handleTargetSmilesChange = this.handleTargetSmilesChange.bind(this);
    this.handleMaxDepthChange = this.handleMaxDepthChange.bind(this);
    this.handleMaxIterationChange = this.handleMaxIterationChange.bind(this);
    this.handleMaxRunningTimeChange = this.handleMaxRunningTimeChange.bind(this);
    this.handleMaxPathwayDisplayedChange = this.handleMaxPathwayDisplayedChange.bind(this);
    this.handleInputFormSubmit = this.handleInputFormSubmit.bind(this);
  }

  tick() {
    this.setState({endTime: new Date()});
  }

  handleTargetSmilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({targetSmiles: event.target.value});
  }

  handleMaxDepthChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({maxDepth: parseInt(event.target.value)});
  }

  handleMaxIterationChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({maxIteration: parseInt(event.target.value)});
  }

  handleMaxRunningTimeChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({maxRunningTime: parseInt(event.target.value)});
  }

  handleMaxPathwayDisplayedChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({maxPathwayDisplayed: parseInt(event.target.value)});
  }

  handleInputFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("targetSmiles", this.state.targetSmiles);
    formData.append("maxDepth", this.state.maxDepth.toString());
    formData.append("maxIteration", this.state.maxIteration.toString());
    formData.append("maxRunningTime", this.state.maxRunningTime.toString());
    formData.append("maxPathwayDisplayed", this.state.maxPathwayDisplayed.toString());
    this.setState({running: true, startTime: new Date(), endTime: new Date()});
    const timerID = setInterval(this.tick, 1000);
    this.props.onSubmit();
    fetch('http://162.105.160.202:5000/retronp/api/bio/pathway-predict', {
      method: 'POST',
      body: formData,
    })
    // fetch('/api/pathway-predict', {
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
          <TextField required variant="outlined"
            className="max-depth-text-field"
            type="number"
            label="Max depth"
            name="maxDepth"
            value={this.state.maxDepth}
            onChange={this.handleMaxDepthChange}
            disabled={this.state.running}
          />
          <TextField required variant="outlined"
            className="max-iteration-text-field"
            type="number"
            label="Max iteration"
            name="maxIteration"
            value={this.state.maxIteration}
            onChange={this.handleMaxIterationChange}
            disabled={this.state.running}
          />
          <TextField required variant="outlined"
            className="max-running-time-text-field"
            type="number"
            label="Max running time (min)"
            name="maxRunningTime"
            InputProps={{ inputProps: { min: 0, max: 1440 } }}
            value={this.state.maxRunningTime}
            onChange={this.handleMaxRunningTimeChange}
            disabled={this.state.running}
          />
          <TextField required variant="outlined"
            className="max-pathway-displayed-text-field"
            type="number"
            label="Max pathway displayed"
            name="maxPathwayDisplayed"
            value={this.state.maxPathwayDisplayed}
            onChange={this.handleMaxPathwayDisplayedChange}
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