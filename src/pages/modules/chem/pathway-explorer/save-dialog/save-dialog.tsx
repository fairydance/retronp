import React from "react";
import Draggable from "react-draggable";
import Button from '@mui/material/Button';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from "@mui/material/IconButton";
import Input from '@mui/material/Input';
import Paper, { PaperProps } from "@mui/material/Paper";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import CloseIcon from "@mui/icons-material/Close";
import {GraphData} from "../../../../../utils/base";
import {download} from "../../../../../utils/download";
import "./save-dialog.scss"

function PaperComponent(props: PaperProps) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

export interface SaveDialogProps {
  data: {graphs: GraphData[]; currentGraphIdx: number;};
  open: boolean;
  inputProps: {min: number; max: number};
  onClose: () => void;
  onSubmit: () => void;
}

export interface SaveDialogState {
  saveMode: string;
  pathwayIndex: number;
  textInputDisabled: boolean;
}

export default class SaveDialog extends React.Component<SaveDialogProps, SaveDialogState> {
  constructor(props: SaveDialogProps) {
    super(props);
    this.state = {
      saveMode: "all",
      pathwayIndex: 1,
      textInputDisabled: true
    };
    this.handleDialogClose = this.handleDialogClose.bind(this);
    this.handleSaveModeChange = this.handleSaveModeChange.bind(this);
    this.handlePathwayIndexChange = this.handlePathwayIndexChange.bind(this);
    this.handleSaveSubmit = this.handleSaveSubmit.bind(this);
  }

  handleDialogClose() {
    this.props.onClose();
  }

  handleSaveModeChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      saveMode: event.target.value,
      textInputDisabled: event.target.value != "other"
    });
  }

  handlePathwayIndexChange(event: React.ChangeEvent<HTMLInputElement>) {
    let index = parseInt(event.target.value);
    if (index < this.props.inputProps.min) {
      index = this.props.inputProps.min;
    } else if (index > this.props.inputProps.max) {
      index = this.props.inputProps.max;
    }
    this.setState({pathwayIndex: index});
  }

  handleSaveSubmit() {
    if (this.state.saveMode === "all") {
      download(JSON.stringify({
        graphs: this.props.data.graphs
      }), "synthesis-pathways_all.json", "text/plain");
    } else if (this.state.saveMode === "current") {
      download(JSON.stringify({
        graph: this.props.data.graphs[this.props.data.currentGraphIdx]
      }), `synthesis-pathway_${this.props.data.currentGraphIdx + 1}.json`, "text/plain");
    } else if (this.state.saveMode === "other") {
      download(JSON.stringify({
        graph: this.props.data.graphs[this.state.pathwayIndex - 1]
      }), `synthesis-pathway_${this.state.pathwayIndex}.json`, "text/plain");
    }
    this.props.onSubmit();
  }

  render(): React.ReactNode {
    let closeButton = (
      <IconButton
        aria-label="close"
        onClick={this.handleDialogClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
    );

    return (
      <Dialog
        open={this.props.open}
        aria-labelledby="draggable-dialog-title"
        fullWidth={true}
        onClose={this.handleDialogClose}
        PaperComponent={PaperComponent}
      >
        <DialogTitle style={{cursor: 'move'}} id="draggable-dialog-title">
          Choose pathway&#40;s&#41;
          {closeButton}
        </DialogTitle>
        <DialogContent dividers
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <FormControl>
            <RadioGroup row
              value={this.state.saveMode}
              onChange={this.handleSaveModeChange}
            >
              <FormControlLabel value="all" control={<Radio />} label="All" />
              <FormControlLabel value="current" control={<Radio />} label="Current" />
              <FormControlLabel value="other" control={<Radio />} label="Other" />
            </RadioGroup>
          </FormControl>
          <Input
            className="pathway-index-input"
            type="number"
            value={this.state.pathwayIndex}
            onChange={this.handlePathwayIndexChange}
            disabled={this.state.textInputDisabled}
            sx={{
              display: this.state.textInputDisabled ? "none" : "flex"
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleSaveSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}