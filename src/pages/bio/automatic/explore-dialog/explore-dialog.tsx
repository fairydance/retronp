import React from "react";
import Draggable from "react-draggable";
import Button from '@mui/material/Button';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from '@mui/material/IconButton';
import Paper, { PaperProps } from "@mui/material/Paper";
import CloseIcon from '@mui/icons-material/Close';
import {NodeData} from "../../../../utils/base";
import "./explore-dialog.scss"

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

export interface ExploreDialogProps {
  data: {node: NodeData | undefined;};
  open: boolean;
  onClose: () => void;
}

export interface ExploreDialogState {}

export default class ExploreDialog extends React.Component<ExploreDialogProps, ExploreDialogState> {
  render(): React.ReactNode {
    return (
      <Dialog
        open={this.props.open}
        aria-labelledby="draggable-dialog-title"
        fullWidth={true}
        onClose={this.props.onClose}
        PaperComponent={PaperComponent}
      >
        <DialogTitle style={{cursor: 'move'}} id="draggable-dialog-title">
          Currently Selected
          <IconButton
            aria-label="close"
            onClick={this.props.onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers className="explore-dialog-content">
          <DialogContentText
            className="node-info"
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <img src={this.props.data.node?.image} />
            <div style={{width: "100%", wordBreak: "break-all"}}>
              <b>SMILES:</b>&nbsp;{this.props.data.node?.metadata?.smiles}
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onClose}>OK</Button>
        </DialogActions>
      </Dialog>
    );
  }
}