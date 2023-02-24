import React from "react";
import Draggable from "react-draggable";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import LoadingButton from "@mui/lab/LoadingButton";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import Paper, { PaperProps } from "@mui/material/Paper";
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from '@mui/icons-material/Remove';
import {NodeData, GraphData} from "../../../../utils/base";
import {secondToHHMMSS} from "../../../../utils/time";
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
  onSubmit: () => void;
  onRespond: (data: {status: {success: boolean, message: string}, graph: GraphData}, timeElapsed: number) => void;
  getAllReactionNodes: (targetNode: NodeData) => NodeData[];
  getAllSubstrateNodes: (reactionNode: NodeData) => NodeData[];
  showReaction: (reactionNode: NodeData) => void;
  hideReaction: (reactionNode: NodeData) => void;
}

export interface ExploreDialogState {
  running: boolean;
  startTime: Date;
  endTime: Date;
  history: string[];
  allReactionNodes: NodeData[];
  showedReactionIndex: number;
  networkUpdateTime: Date;
}

export default class ExploreDialog extends React.Component<ExploreDialogProps, ExploreDialogState> {
  constructor(props: ExploreDialogProps) {
    super(props);
    this.state = {
      running: false,
      startTime: new Date(),
      endTime: new Date(),
      history: ["currently-selected"],
      allReactionNodes: [],
      showedReactionIndex: 1,
      networkUpdateTime: new Date()
    };
    this.tick = this.tick.bind(this);
    this.handleDialogClose = this.handleDialogClose.bind(this);
    this.handleExploreSubmit = this.handleExploreSubmit.bind(this);
    this.handleViewAllReactionsButtonClick = this.handleViewAllReactionsButtonClick.bind(this);
    this.handleGoBackButtonClick = this.handleGoBackButtonClick.bind(this);
    this.handleReactionChange = this.handleReactionChange.bind(this);
    this.handleAddButtonClick = this.handleAddButtonClick.bind(this);
    this.handleRemoveButtonClick = this.handleRemoveButtonClick.bind(this);
  }

  componentDidUpdate(prevProps: ExploreDialogProps) {
    if (prevProps.data.node?.id != this.props.data.node?.id) {
      this.setState({
        running: false,
        startTime: new Date(),
        endTime: new Date(),
        history: ["currently-selected"],
        allReactionNodes: [],
        showedReactionIndex: 1,
      });
    }
  }

  tick() {
    this.setState({endTime: new Date()});
  }

  handleDialogClose() {
    if (!this.state.running) {
      this.props.onClose();
    }
  }

  handleExploreSubmit() {
    const formData = new FormData();
    formData.append("targetSmiles", this.props.data.node!.metadata!.smiles!);
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

  handleViewAllReactionsButtonClick() {
    this.setState(state => ({
      history: [...state.history, "all-reactions"],
      allReactionNodes: this.props.getAllReactionNodes(this.props.data.node!),
    }));
  }

  handleGoBackButtonClick() {
    this.setState(state => ({
      history: [...state.history.slice(0, -1)]
    }));
  }

  handleReactionChange(event: React.ChangeEvent<unknown>, value: number) {
    this.setState({
      showedReactionIndex: value
    });
  }

  handleAddButtonClick() {
    this.props.showReaction(this.state.allReactionNodes[this.state.showedReactionIndex - 1]);
    this.setState({networkUpdateTime: new Date()});
  }

  handleRemoveButtonClick() {
    this.props.hideReaction(this.state.allReactionNodes[this.state.showedReactionIndex - 1]);
    this.setState({networkUpdateTime: new Date()});
  }

  render(): React.ReactNode {
    let mainElement: JSX.Element;
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

    if (this.props.data.node) {
      if (this.state.history[this.state.history.length - 1] === "currently-selected") {
        mainElement = (
          <>
            <DialogTitle style={{cursor: 'move'}} id="draggable-dialog-title">
              Currently Selected
              {closeButton}
            </DialogTitle>
            <DialogContent dividers className="currently-selected-content">
              <DialogContentText
                className="node-info"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <img src={this.props.data.node.image} />
                <div style={{width: "100%", wordBreak: "break-all"}}>
                  <b>SMILES:</b>&nbsp;{this.props.data.node.metadata.smiles}
                </div>
              </DialogContentText>
            </DialogContent>
            <DialogActions disableSpacing>
              {this.state.running &&
                <Button disabled={true}>
                  {`time elapsed: ${secondToHHMMSS(Math.floor((this.state.endTime.getTime() - this.state.startTime.getTime()) / 1000))}`}
                </Button>
              }
              {this.props.data.node.metadata.isExplored ? (
                <DialogActions>
                  <Button
                    onClick={this.handleViewAllReactionsButtonClick}
                  >
                    View all reactions
                  </Button>
                </DialogActions>
              ) : (
                <LoadingButton
                  onClick={this.handleExploreSubmit}
                  loading={this.state.running}
                  disabled={this.props.data.node.metadata.type === "substrate"}
                >
                  Explore
                </LoadingButton>
              )}
              
            </DialogActions>
          </>
        );
      } else if (this.state.history[this.state.history.length - 1] === "all-reactions") {
        mainElement = (
          <>
            <DialogTitle style={{cursor: 'move'}} id="draggable-dialog-title">
              All Reactions
              {closeButton}
            </DialogTitle>
            <DialogContent dividers className="all-reactions-content">
              <DialogContentText
                className="node-info"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Pagination color="primary"
                  className="reaction-chooser"
                  defaultPage={this.state.showedReactionIndex}
                  count={this.state.allReactionNodes.length}
                  onChange={this.handleReactionChange}
                />
                {this.props.getAllSubstrateNodes(this.state.allReactionNodes[this.state.showedReactionIndex - 1]).map(node => (
                  // <svg key={node.id} className="molecule-image">
                  //   <image xlinkHref={node.image} x="0" y="0" height="100%" width="100%" />
                  // </svg>
                  <img key={node.id} src={node.image} />
                ))}
                <Stack direction="row" alignItems="center" spacing={2}>
                  <IconButton color="primary" aria-label="remove reaction"
                    disabled={!this.state.allReactionNodes[this.state.showedReactionIndex - 1].metadata.show}
                    onClick={this.handleRemoveButtonClick}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <IconButton color="primary" aria-label="add reaction"
                    disabled={this.state.allReactionNodes[this.state.showedReactionIndex - 1].metadata.show}
                    onClick={this.handleAddButtonClick}
                  >
                    <AddIcon />
                  </IconButton>
                </Stack>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={this.handleGoBackButtonClick}
              >
                Go back
              </Button>
            </DialogActions>
          </>
        );
      } else {
        mainElement = <></>
      }
    } else {
      mainElement = <></>
    }

    return (
      <Dialog id="explore-dialog"
        open={this.props.open}
        aria-labelledby="draggable-dialog-title"
        fullWidth={true}
        onClose={this.handleDialogClose}
        PaperComponent={PaperComponent}
      >
        {mainElement}
      </Dialog>
    );
  }
}