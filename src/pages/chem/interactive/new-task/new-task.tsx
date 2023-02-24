import React from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import LinearProgress from '@mui/material/LinearProgress';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import {GraphData} from "../../../../utils/base";
import {secondToHHMMSS} from "../../../../utils/time";
import "./new-task.scss";

export interface FormInputProps {
  onSubmit: () => void;
  onRespond: (data: {status: {success: boolean, message: string}, graph: GraphData}, timeElapsed: number) => void;
}

export interface FormInputState {
  targetSmiles: string;
  ruleType: string;
  running: boolean;
  startTime: Date;
  endTime: Date;
}

export default class FormInput extends React.Component<FormInputProps, FormInputState> {
  constructor(props: FormInputProps) {
    super(props);
    this.state = {
      targetSmiles: '',
      ruleType: "key",
      running: false,
      startTime: new Date(),
      endTime: new Date()
    };
    this.tick = this.tick.bind(this);
    this.handleTargetSmilesChange = this.handleTargetSmilesChange.bind(this);
    this.handleRuleTypeChange = this.handleRuleTypeChange.bind(this);
    this.handleInputFormSubmit = this.handleInputFormSubmit.bind(this);
  }

  tick() {
    this.setState({endTime: new Date()});
  }

  handleTargetSmilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({targetSmiles: event.target.value});
  }

  handleRuleTypeChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ruleType: event.target.value});
  }

  handleInputFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("targetSmiles", this.state.targetSmiles);
    formData.append("ruleType", this.state.ruleType);
    this.setState({running: true, startTime: new Date(), endTime: new Date()});
    const timerID = setInterval(this.tick, 1000);
    this.props.onSubmit();
    fetch('http://162.105.160.202:5000/retronp/api/chem/network-predict', {
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
    .catch(err => {
      console.error(err);
      this.props.onRespond({status: {success: false, message: "Exploration failed."}, graph: {nodes: [], edges: []}},
        Math.floor((this.state.endTime.getTime() - this.state.startTime.getTime()) / 1000));
      this.setState({running: false});
      clearInterval(timerID);
    });
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
          <FormControl className="rule-type-form-control">
            {/* <FormLabel id="rule-type-radio-buttons-group-label">Rule type</FormLabel> */}
            <Tooltip title="Rule type" placement="left">
              <RadioGroup row aria-labelledby="rule-type-radio-buttons-group-label" name="rule-type-radio-buttons-group"
                value={this.state.ruleType}
                onChange={this.handleRuleTypeChange}
              >
                <FormControlLabel value="key" control={<Radio />} label="Key" disabled={this.state.running} />
                <FormControlLabel value="auxiliary" control={<Radio />} label="Auxiliary" disabled={this.state.running} />
              </RadioGroup>
            </Tooltip>
          </FormControl>
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
      <div className="chem-interactive-retrosynthesis-new-task">
        {mainElement}
      </div>
    );
  }
}