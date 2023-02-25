import React from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Drawer from '@mui/material/Drawer';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import targetLegend from "../../assets/images/legends/target.svg"
import intermediateLegend from "../../assets/images/legends/intermediate.svg"
import substrateLegend from "../../assets/images/legends/substrate.svg"
import reactionKeyLegend from "../../assets/images/legends/reaction-key.svg"
import reactionAuxiliaryLegend from "../../assets/images/legends/reaction-auxiliary.svg"
import reactionManualLegend from "../../assets/images/legends/reaction-manual.svg"
import "./explore-drawer.scss"

export interface ExploreDrawerProps {
  width: number;
  open: boolean;
  initData: {layout: any}
  onClose: () => void;
  onLayoutApply: (layout: any) => void;
}

export interface ExploreDrawerState {
  openLegendList: boolean;
  openLayoutControl: boolean;
  context: string;
  layoutHierarchicalEnabled: boolean;
  layoutHierarchicalDirection: "UD" | "DU" | "LR" | "RL";
}

export default class ExploreDrawer extends React.Component<ExploreDrawerProps, ExploreDrawerState> {
  constructor(props: ExploreDrawerProps) {
    super(props);
    this.state = {
      openLegendList: false,
      openLayoutControl: false,
      context: '',
      layoutHierarchicalEnabled: this.props.initData.layout.hierarchical.enabled,
      layoutHierarchicalDirection: this.props.initData.layout.hierarchical.direction,
    };
    this.handleLegendButtonClick = this.handleLegendButtonClick.bind(this);
    this.handleLayoutButtonClick = this.handleLayoutButtonClick.bind(this);
    this.handleLayoutHierarchicalEnabledChange = this.handleLayoutHierarchicalEnabledChange.bind(this);
    this.handleLayoutHierarchicalDirectionChange = this.handleLayoutHierarchicalDirectionChange.bind(this);
  }

  handleLegendButtonClick() {
    this.setState((state, props) => ({openLegendList: !state.openLegendList}));
  }

  handleLayoutButtonClick() {
    this.setState((state, props) => ({openLayoutControl: !state.openLayoutControl}));
  }

  handleLayoutHierarchicalEnabledChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({layoutHierarchicalEnabled: event.target.checked});
    this.props.onLayoutApply({
      hierarchical: {
        enabled: event.target.checked,
        direction: this.state.layoutHierarchicalDirection,
        sortMethod: "directed"
      }
    })
  }

  handleLayoutHierarchicalDirectionChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({layoutHierarchicalDirection: event.target.value as ("UD" | "DU" | "LR" | "RL")})
    this.props.onLayoutApply({
      hierarchical: {
        enabled: this.state.layoutHierarchicalEnabled,
        direction: event.target.value,
        sortMethod: "directed"
      }
    })
  }

  render() {
    return (
      <Box>
      <Drawer
        sx={{
          width: this.props.width,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: this.props.width,
            boxSizing: 'border-box',
          },
        }}
        open={this.props.open}
        onClose={this.props.onClose}
      >
        <Box>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={this.handleLegendButtonClick}
              >
                <ListItemIcon>
                  <FormatListBulletedIcon />
                </ListItemIcon>
                <ListItemText primary="Legend" />
                {this.state.openLegendList ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={this.state.openLegendList} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding sx={{ pl: 4 }}>
                    <ListItemIcon>
                      <img src={targetLegend} style={{width: "1rem"}} />
                    </ListItemIcon>
                    <ListItemText primary="target" />
                  </ListItem>
                  <ListItem disablePadding sx={{ pl: 4 }}>
                    <ListItemIcon>
                      <img src={intermediateLegend} style={{width: "1rem"}} />
                    </ListItemIcon>
                    <ListItemText primary="intermediate" />
                  </ListItem>
                  <ListItem disablePadding sx={{ pl: 4 }}>
                    <ListItemIcon>
                      <img src={substrateLegend} style={{width: "1rem"}} />
                    </ListItemIcon>
                    <ListItemText primary="substrate" />
                  </ListItem>
                  <ListItem disablePadding sx={{ pl: 4 }}>
                    <ListItemIcon>
                      <img src={reactionKeyLegend} style={{width: "1rem"}} />
                    </ListItemIcon>
                    <ListItemText primary="reaction (key)" />
                  </ListItem>
                  <ListItem disablePadding sx={{ pl: 4 }}>
                    <ListItemIcon>
                      <img src={reactionAuxiliaryLegend} style={{width: "1rem"}} />
                    </ListItemIcon>
                    <ListItemText primary="reaction (auxiliary)" />
                  </ListItem>
                  <ListItem disablePadding sx={{ pl: 4 }}>
                    <ListItemIcon>
                      <img src={reactionManualLegend} style={{width: "1rem"}} />
                    </ListItemIcon>
                    <ListItemText primary="reaction (manual)" />
                  </ListItem>
              </List>
            </Collapse>
            <ListItem disablePadding>
              <ListItemButton
                onClick={this.handleLayoutButtonClick}
              >
                <ListItemIcon>
                  <ViewQuiltIcon />
                </ListItemIcon>
                <ListItemText primary="Layout" />
                {this.state.openLayoutControl ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={this.state.openLayoutControl} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding sx={{ pl: 4 }}>
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
                        <FormControlLabel value="LR" control={<Radio />} label="LR" />
                        <FormControlLabel value="DU" control={<Radio />} label="DU" />
                      </RadioGroup>
                    </FormControl>
                  </FormControl>
                </ListItem>
              </List>
            </Collapse>
          </List>
        </Box>
      </Drawer>
    </Box>
    );
  }
};
