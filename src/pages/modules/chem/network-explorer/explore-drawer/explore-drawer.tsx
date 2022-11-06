import React from 'react';
import Draggable from 'react-draggable';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper, { PaperProps } from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from "@mui/icons-material/Close";
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import "./explore-drawer.scss"

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

export interface ExploreDrawerProps {
  open: boolean;
  onClose: () => void;
  onLayoutApply: (layout: any) => void;
}

export interface ExploreDrawerState {
  openDialog: boolean;
  context: string;
  layoutHierarchicalEnabled: boolean;
  layoutHierarchicalDirection: "UD" | "DU" | "LR" | "RL";
}

export default class ExploreDrawer extends React.Component<ExploreDrawerProps, ExploreDrawerState> {
  constructor(props: ExploreDrawerProps) {
    super(props);
    this.state = {
      openDialog: false,
      context: '',
      layoutHierarchicalEnabled: false,
      layoutHierarchicalDirection: "UD",
    };
    this.handleLayoutButtonClick = this.handleLayoutButtonClick.bind(this);
    this.handleDialogClose = this.handleDialogClose.bind(this);
    this.handleLayoutHierarchicalEnabledChange = this.handleLayoutHierarchicalEnabledChange.bind(this);
    this.handleLayoutHierarchicalDirectionChange = this.handleLayoutHierarchicalDirectionChange.bind(this);
    this.handleLayoutApplyButtonClick = this.handleLayoutApplyButtonClick.bind(this);
  }

  handleLayoutButtonClick() {
    this.props.onClose();
    this.setState({openDialog: true, context: "layout"});
  }

  handleDialogClose() {
    this.setState({openDialog: false});
  }

  handleLayoutHierarchicalEnabledChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({layoutHierarchicalEnabled: event.target.checked});
  }

  handleLayoutHierarchicalDirectionChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({layoutHierarchicalDirection: event.target.value as ("UD" | "DU" | "LR" | "RL")})
  }

  handleLayoutApplyButtonClick() {
    this.props.onLayoutApply({
      hierarchical: {
        enabled: this.state.layoutHierarchicalEnabled,
        direction: this.state.layoutHierarchicalDirection,
      }
    })
    this.setState({openDialog: false});
  }

  render() {
    let mainElement: JSX.Element;
    if (this.state.context === "layout") {
      mainElement = (
        <>
          <DialogTitle style={{cursor: 'move'}} id="draggable-dialog-title">
            Layout
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
              <FormControl>
                <FormControlLabel
                  control={
                    <Checkbox checked={this.state.layoutHierarchicalEnabled} onChange={this.handleLayoutHierarchicalEnabledChange} />
                  }
                  label="hierarchical"
                />
                <FormControl
                  sx={{
                    marginLeft: "2rem"
                  }}
                  disabled={!this.state.layoutHierarchicalEnabled}
                >
                  <FormLabel id="demo-controlled-radio-buttons-group">direction:</FormLabel>
                  <RadioGroup row
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={this.state.layoutHierarchicalDirection}
                    onChange={this.handleLayoutHierarchicalDirectionChange}
                  >
                    <FormControlLabel value="UD" control={<Radio />} label="UD" />
                    <FormControlLabel value="DU" control={<Radio />} label="DU" />
                    <FormControlLabel value="LR" control={<Radio />} label="LR" />
                    <FormControlLabel value="RL" control={<Radio />} label="RL" />
                  </RadioGroup>
                </FormControl>
              </FormControl>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <IconButton 
              color="primary"
              aria-label="check"
              onClick={this.handleLayoutApplyButtonClick}
            >
              <CheckIcon />
            </IconButton>
          </DialogActions>
        </>
      );
    } else {
      mainElement = (
        <></>
      );
    }
    return (
      <Box>
      <Drawer
        open={this.props.open}
        onClose={this.props.onClose}
      >
        <Box
          sx={{ width: 250 }}
        >
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={this.handleLayoutButtonClick}
              >
                <ListItemIcon>
                  <ViewQuiltIcon />
                </ListItemIcon>
                <ListItemText primary="Layout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Dialog id="chem-network-draw-dialog"
        open={this.state.openDialog}
        aria-labelledby="draggable-dialog-title"
        fullWidth={true}
        onClose={this.handleDialogClose}
        PaperComponent={PaperComponent}
      >
        {mainElement}
      </Dialog>
    </Box>
    );
  }
};
