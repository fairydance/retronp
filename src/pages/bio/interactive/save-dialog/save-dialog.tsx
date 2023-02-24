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
import Paper, { PaperProps } from "@mui/material/Paper";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import CloseIcon from "@mui/icons-material/Close";
import {GraphData} from "../../../../utils/base";
import {download} from "../../../../utils/download";
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
  data: {graphData: GraphData};
  open: boolean;
  onClose: () => void;
  handleSubmit: () => void;
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

  handleSaveSubmit() {
    if (this.state.saveMode === "all") {
      download(JSON.stringify({
        graph: this.props.data.graphData
      }), "synthesis-network_all.json", "text/plain");
    } else if (this.state.saveMode === "visible") {
      let showedGraphData: GraphData = {nodes: [], edges: []};
      for (const node of this.props.data.graphData.nodes) {
        if (node.metadata.show) {
          showedGraphData.nodes.push(node);
        }
      }
      for (const edge of this.props.data.graphData.edges) {
        if (edge.metadata.show) {
          showedGraphData.edges.push(edge);
        }
      }
      download(JSON.stringify({
        graph: showedGraphData
      }), "synthesis-network_visible.json", "text/plain");
    }
    this.props.handleSubmit();
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
          Choose network
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
              <FormControlLabel value="visible" control={<Radio />} label="Visible" />
            </RadioGroup>
          </FormControl>
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