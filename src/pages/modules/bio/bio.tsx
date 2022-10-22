import React from "react";
import {Link as RouterLink} from "react-router-dom";
import Button from '@mui/material/Button';
import "./bio.scss"

export interface BioProps {}

export interface BioState {}

export default class Bio extends React.Component<BioProps, BioState> {
  constructor(props: BioProps) {
    super(props);
  }

  render(): React.ReactNode {
    return (
      <div className="bio">
        <div className="task-selection">
          <Button component={RouterLink} className="network-explorer-button" variant="contained" to="/modules/bio/network-explorer">Network Explorer</Button>
          <Button component={RouterLink} className="pathway-explorer-button" variant="contained" to="/modules/bio/pathway-explorer">Pathway Explorer</Button>
        </div>
      </div>
    );
  }
}