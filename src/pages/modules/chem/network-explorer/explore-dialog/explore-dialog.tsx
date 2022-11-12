import React from "react";
import Draggable from "react-draggable";
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from "@mui/material/IconButton";
import InputAdornment from '@mui/material/InputAdornment';
import Pagination from "@mui/material/Pagination";
import Paper, { PaperProps } from "@mui/material/Paper";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabPanel from '@mui/lab/TabPanel';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import AlarmIcon from '@mui/icons-material/Alarm';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExploreIcon from '@mui/icons-material/Explore';
import InfoIcon from '@mui/icons-material/Info';
import ListIcon from '@mui/icons-material/List';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import RemoveIcon from '@mui/icons-material/Remove';
import {NodeData, GraphData, EdgeData} from "../../../../../utils/base";
import {secondToHHMMSS} from "../../../../../utils/time";
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
  onExploreSubmit: () => void;
  onExploreRespond: (data: {status: {success: boolean, message: string}, graph: GraphData}, timeElapsed: number) => void;
  onAddReaction: (data: {status: {success: boolean, message: string}, graph: GraphData}) => void;
  getAllReactionNodes: (targetNode: NodeData) => NodeData[];
  getAllSubstrateNodes: (reactionNode: NodeData) => NodeData[];
  showReaction: (reactionNode: NodeData) => void;
  hideReaction: (reactionNode: NodeData) => void;
}

export interface ExploreDialogState {
  exploringReaction: boolean;
  startTime: Date;
  endTime: Date;
  history: string[];
  networkUpdateTime: Date;
  ruleTypeForExploration: string;
  addingReaction: boolean;
  reactantSmiles: string;
  reactionLabel: string;
  reactionSmarts: string;
  allReactionNodes: NodeData[];
  partialReactionNodes: NodeData[];
  showedReactionIndex: number;
  ruleTypeForVisualization: string
}

export default class ExploreDialog extends React.Component<ExploreDialogProps, ExploreDialogState> {
  constructor(props: ExploreDialogProps) {
    super(props);
    this.state = {
      exploringReaction: false,
      startTime: new Date(),
      endTime: new Date(),
      history: ["currently-selected"],
      networkUpdateTime: new Date(),
      ruleTypeForExploration: "key",
      addingReaction: false,
      reactantSmiles: '',
      reactionLabel: '',
      reactionSmarts: '',
      allReactionNodes: [],
      partialReactionNodes: [],
      showedReactionIndex: 1,
      ruleTypeForVisualization: "key",
    };
    this.tick = this.tick.bind(this);
    this.handleDialogClose = this.handleDialogClose.bind(this);
    this.handleExploreButtonClick = this.handleExploreButtonClick.bind(this);
    this.handleExploreRuleTypeChange = this.handleExploreRuleTypeChange.bind(this);
    this.handleExploreFormSubmit = this.handleExploreFormSubmit.bind(this);
    this.handleAddReactionButtonClick = this.handleAddReactionButtonClick.bind(this);
    this.handleDeleteReactionButtonClick = this.handleDeleteReactionButtonClick.bind(this);
    this.handleAddReactionInputFormSubmit = this.handleAddReactionInputFormSubmit.bind(this);
    this.handleReactantSmilesChange = this.handleReactantSmilesChange.bind(this);
    this.handleReactionLabelChange = this.handleReactionLabelChange.bind(this);
    this.handleViewAllReactionsButtonClick = this.handleViewAllReactionsButtonClick.bind(this);
    this.handleVisualizeRuleTypeChange = this.handleVisualizeRuleTypeChange.bind(this);
    this.handleGoBackButtonClick = this.handleGoBackButtonClick.bind(this);
    this.handleReactionChange = this.handleReactionChange.bind(this);
    this.handleAddButtonClick = this.handleAddButtonClick.bind(this);
    this.handleRemoveButtonClick = this.handleRemoveButtonClick.bind(this);
  }

  componentDidUpdate(prevProps: ExploreDialogProps) {
    if (prevProps.data.node?.id != this.props.data.node?.id) {
      this.setState({
        exploringReaction: false,
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
    if (!this.state.exploringReaction && !this.state.addingReaction) {
      this.props.onClose();
    }
  }

  handleExploreButtonClick() {
    this.setState(state => ({
      history: [...state.history, "explore"],
    }));
  }

  handleExploreRuleTypeChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ruleTypeForExploration: event.target.value});
  }

  handleExploreFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("targetSmiles", this.props.data.node!.metadata!.smiles!);
    formData.append("ruleType", this.state.ruleTypeForExploration);
    this.setState({exploringReaction: true, startTime: new Date(), endTime: new Date()});
    const timerID = setInterval(this.tick, 1000);
    this.props.onExploreSubmit();
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
      this.props.onExploreRespond(data, Math.floor((this.state.endTime.getTime() - this.state.startTime.getTime()) / 1000));
      this.setState({exploringReaction: false});
      clearInterval(timerID);
    })
    .catch(err => {
      console.error(err);
      this.props.onExploreRespond({status: {success: false, message: "Exploration failed."}, graph: {nodes: [], edges: []}},
        Math.floor((this.state.endTime.getTime() - this.state.startTime.getTime()) / 1000));
      this.setState({exploringReaction: false});
      clearInterval(timerID);
    });
  }

  handleAddReactionButtonClick() {
    this.setState(state => ({
      history: [...state.history, "add-reaction"],
    }));
  }

  handleDeleteReactionButtonClick() {
    this.props.hideReaction(this.props.data.node!);
    this.setState({networkUpdateTime: new Date()});
    this.props.onClose();
  }

  handleAddReactionInputFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("targetSmiles", this.props.data.node!.metadata!.smiles!);
    formData.append("reactantSmiles", this.state.reactantSmiles);
    formData.append("reactionLabel", this.state.reactionLabel);
    formData.append("reactionSmarts", this.state.reactionSmarts);
    this.setState({addingReaction: true});
    fetch('http://162.105.160.202:5000/retronp/api/smiles-to-reaction', {
      method: 'POST',
      body: formData,
    })
    .then(res => res.json())
    .then(data => {
      this.props.onAddReaction(data);
      this.setState({addingReaction: false});
    })
    .catch(err => {
      console.error(err);
      this.props.onAddReaction({status: {success: false, message: "Addition failed."}, graph: {nodes: [], edges: []}});
      this.setState({addingReaction: false});
    });
  }

  handleReactantSmilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({reactantSmiles: event.target.value});
  }

  handleReactionLabelChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({reactionLabel: event.target.value});
  }

  handleReactionSmartsChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({reactionSmarts: event.target.value});
  }

  handleViewAllReactionsButtonClick() {
    let allReactionNodes = this.props.getAllReactionNodes(this.props.data.node!);
    let partialReactionNodes = allReactionNodes.filter(node => node.metadata.ruleType === this.state.ruleTypeForVisualization);
    this.setState(state => ({
      history: [...state.history, "view-all-reactions"],
      allReactionNodes: allReactionNodes,
      partialReactionNodes: partialReactionNodes,
    }));
  }

  handleVisualizeRuleTypeChange(event: React.SyntheticEvent, newRuleType: string) {
    let partialReactionNodes = this.state.allReactionNodes.filter(node => node.metadata.ruleType === newRuleType);
    this.setState({
      ruleTypeForVisualization: newRuleType,
      showedReactionIndex: 1,
      partialReactionNodes: partialReactionNodes,
    });
  }

  handleReactionChange(event: React.ChangeEvent<unknown>, value: number) {
    this.setState({
      showedReactionIndex: value
    });
  }

  handleAddButtonClick() {
    this.props.showReaction(this.state.partialReactionNodes[this.state.showedReactionIndex - 1]);
    this.setState({networkUpdateTime: new Date()});
  }

  handleRemoveButtonClick() {
    this.props.hideReaction(this.state.partialReactionNodes[this.state.showedReactionIndex - 1]);
    this.setState({networkUpdateTime: new Date()});
  }

  handleGoBackButtonClick() {
    this.setState(state => ({
      history: [...state.history.slice(0, -1)]
    }));
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
      if (this.props.data.node.metadata.type === "reaction") {
        mainElement = (
          <>
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
                <img src={this.props.data.node.image} />
                <div style={{width: "100%", wordBreak: "break-all"}}>
                  <b>Reaction ID:</b>&nbsp;{this.props.data.node.metadata.reactionId}
                </div>
                <div style={{width: "100%", wordBreak: "break-all"}}>
                  <b>Label:</b>&nbsp;{this.props.data.node.label}
                </div>
                {this.props.data.node.metadata.score && <div style={{width: "100%", wordBreak: "break-all"}}>
                  <b>Score:</b>&nbsp;{this.props.data.node.metadata.score}
                </div>}
                <div style={{width: "100%", wordBreak: "break-all"}}>
                  <b>SMARTS:</b>&nbsp;{this.props.data.node.metadata.smarts}
                </div>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <IconButton 
                color="primary"
                aria-label="delete"
                onClick={this.handleDeleteReactionButtonClick}
              >
                <DeleteOutlineIcon />
              </IconButton>
              <IconButton 
                color="primary"
                aria-label="check"
                onClick={this.props.onClose}
              >
                <CheckIcon />
              </IconButton>
            </DialogActions>
          </>
        )
      } else if (["target", "intermediate", "substrate"].includes(this.props.data.node.metadata.type)) {
        if (this.state.history[this.state.history.length - 1] === "currently-selected") {
          let exploreButtonElement: JSX.Element;
          let dialogActionsChildrenElement: JSX.Element;
          if (this.props.data.node.metadata.type === "substrate") { // || this.props.data.node.metadata.isExplored
            exploreButtonElement = (
              <IconButton 
                color="primary"
                aria-label="explore"
                onClick={this.handleExploreButtonClick}
                disabled={true}
              >
                <ExploreIcon />
              </IconButton>
            )
          } else {
            exploreButtonElement = (
              <Tooltip title="Explore">
                <IconButton 
                  color="primary"
                  aria-label="explore"
                  onClick={this.handleExploreButtonClick}
                >
                  <ExploreIcon />
                </IconButton>
              </Tooltip>
            )
          }
          dialogActionsChildrenElement = (
            <>
              {exploreButtonElement}
              <Tooltip title="Add a reaction">
                <IconButton 
                  color="primary"
                  aria-label="add a reaction"
                  onClick={this.handleAddReactionButtonClick}
                  disabled={this.state.exploringReaction}
                >
                  <PlaylistAddIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="View all reactions">
                <IconButton 
                  color="primary"
                  aria-label="view all reactions"
                  onClick={this.handleViewAllReactionsButtonClick}
                  disabled={this.state.exploringReaction}
                >
                  <ListIcon />
                </IconButton>
              </Tooltip>
            </>
          )
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
                  {["intermediate", "substrate"].includes(this.props.data.node.metadata.type) &&
                  <div style={{width: "100%", wordBreak: "break-all"}}>
                    <b>Reaction ID:</b>&nbsp;{this.props.data.node.metadata.reactionId}
                  </div>}
                </DialogContentText>
              </DialogContent>
              <DialogActions disableSpacing>
                {dialogActionsChildrenElement}
              </DialogActions>
            </>
          );
        } else if (this.state.history[this.state.history.length - 1] === "explore") {
          let dialogActionsChildrenElement: JSX.Element;
          if (!this.state.exploringReaction) {
            dialogActionsChildrenElement = (
              <>
                <Tooltip title="Go back">
                  <IconButton color="primary" aria-label="go back" onClick={this.handleGoBackButtonClick}>
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
              </>
            )
          } else {
            dialogActionsChildrenElement = (
              <>
                <IconButton 
                  aria-label="alarm"
                >
                  <AlarmIcon />
                </IconButton>
                <div>
                  Time elapsed: {secondToHHMMSS(Math.floor((this.state.endTime.getTime() - this.state.startTime.getTime()) / 1000))}
                </div>
                <CircularProgress size={20}
                  sx={{
                    margin: "0.6rem"
                  }}
                />
              </>
            )
          }
          mainElement = (
            <>
              <DialogTitle style={{cursor: 'move'}} id="draggable-dialog-title">
                Explore
                {closeButton}
              </DialogTitle>
              <DialogContent dividers className="explore-content">
                <DialogContentText
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <form className="explore-form" onSubmit={this.handleExploreFormSubmit}>
                    <FormControl className="rule-type-form-control">
                      <Tooltip title="Rule type" placement="left">
                        <RadioGroup row aria-labelledby="rule-type-radio-buttons-group-label" name="rule-type-radio-buttons-group"
                          value={this.state.ruleTypeForExploration}
                          onChange={this.handleExploreRuleTypeChange}
                        >
                          <FormControlLabel value="key" control={<Radio />} label="Key" disabled={this.state.exploringReaction} />
                          <FormControlLabel value="auxiliary" control={<Radio />} label="Auxiliary" disabled={this.state.exploringReaction} />
                        </RadioGroup>
                      </Tooltip>
                    </FormControl>
                    <Button variant="contained"
                      className="explore-submit-button"
                      type="submit"
                      disabled={this.state.exploringReaction}
                    >
                      Explore
                    </Button>
                  </form>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                {dialogActionsChildrenElement}
              </DialogActions>
            </>
          );
        } else if (this.state.history[this.state.history.length - 1] === "view-all-reactions") {
          let dialogContentTextChildrenElement: JSX.Element;
          if (this.state.partialReactionNodes.length > 0) {
            dialogContentTextChildrenElement = (
              <>
                {this.props.getAllSubstrateNodes(this.state.partialReactionNodes[this.state.showedReactionIndex - 1]).map(node => (
                  // <svg key={node.id} className="molecule-image">
                  //   <image xlinkHref={node.image} x="0" y="0" height="100%" width="100%" />
                  // </svg>
                  <img key={node.id} src={node.image} />
                ))}
                <Stack direction="row" alignItems="center" spacing={2}>
                  <IconButton color="primary" aria-label="remove reaction"
                    disabled={!this.state.partialReactionNodes[this.state.showedReactionIndex - 1].metadata.show}
                    onClick={this.handleRemoveButtonClick}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <IconButton color="primary" aria-label="add reaction"
                    disabled={this.state.partialReactionNodes[this.state.showedReactionIndex - 1].metadata.show}
                    onClick={this.handleAddButtonClick}
                  >
                    <AddIcon />
                  </IconButton>
                </Stack>
                <Pagination color="primary" sx={{marginTop: "1rem"}}
                  count={this.state.partialReactionNodes.length}
                  page={this.state.showedReactionIndex}
                  onChange={this.handleReactionChange}
                />
              </>
            )
          } else {
            dialogContentTextChildrenElement = (
              <>
                <div style={{marginTop: "1rem"}}>
                  No reaction is found.
                </div>
              </>
            )
          }
          mainElement = (
            <>
              <DialogTitle style={{cursor: 'move'}} id="draggable-dialog-title">
                All Reactions
                {closeButton}
              </DialogTitle>
              <DialogContent dividers className="all-reactions-content">
                <DialogContentText
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Box
                    sx={{
                      borderBottom: 1,
                      borderColor: 'divider',
                      width: "100%",
                    }}
                  >
                    <Tabs
                      variant="fullWidth"
                      aria-label="rule type"
                      value={this.state.ruleTypeForVisualization}
                      onChange={this.handleVisualizeRuleTypeChange}
                    >
                      <Tab label="Key" value="key" />
                      <Tab label="Auxiliary" value="auxiliary" />
                      <Tab label="Manual" value="manual" />
                    </Tabs>
                  </Box>
                  {dialogContentTextChildrenElement}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Tooltip title="Go back">
                  <IconButton color="primary" aria-label="go back" onClick={this.handleGoBackButtonClick}>
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
              </DialogActions>
            </>
          );
        } else if (this.state.history[this.state.history.length - 1] === "add-reaction") {
          mainElement = (
            <>
              <DialogTitle style={{cursor: 'move'}} id="draggable-dialog-title">
                Add a Reaction
                {closeButton}
              </DialogTitle>
              <DialogContent dividers className="add-reaction-content">
                <DialogContentText
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <form className="add-reaction-input-form" onSubmit={this.handleAddReactionInputFormSubmit}>
                    <TextField required variant="outlined"
                      className="reactant-smiles-text-field"
                      label="Reactant SMILES(s)"
                      name="reactantSmiles"
                      value={this.state.reactantSmiles}
                      onChange={this.handleReactantSmilesChange}
                      disabled={this.state.addingReaction}
                    />
                    <TextField variant="outlined"
                      className="reaction-label-text-field"
                      label="Reaction label"
                      name="reactionLabel"
                      value={this.state.reactionLabel}
                      onChange={this.handleReactionLabelChange}
                      disabled={this.state.addingReaction}
                    />
                    <TextField variant="outlined"
                      className="reaction-smarts-text-field"
                      label="Reaction SMARTS"
                      name="reactionSmarts"
                      value={this.state.reactionSmarts}
                      onChange={this.handleReactionSmartsChange}
                      disabled={this.state.addingReaction}
                    />
                    <Button variant="contained"
                      className="add-reaction-submit-button"
                      type="submit"
                      disabled={this.state.addingReaction}
                    >
                      Add
                    </Button>
                  </form>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Tooltip title="Go back">
                  <IconButton color="primary" aria-label="go back" onClick={this.handleGoBackButtonClick}>
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
              </DialogActions>
            </>
          );
        } else {
          mainElement = <></>
        }
      } else {
        mainElement = <></>
      }
    } else {
      mainElement = <></>
    }

    return (
      <Dialog id="chem-network-explore-dialog"
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