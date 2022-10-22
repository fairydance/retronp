import React from "react";
import {Link as RouterLink} from "react-router-dom";
import Button from '@mui/material/Button';
import "./chem.scss"

export interface ChemProps {}

export interface ChemState {}

export default class Chem extends React.Component<ChemProps, ChemState> {
  constructor(props: ChemProps) {
    super(props);
  }

  render(): React.ReactNode {
    return (
      <div className="chem">
        <div className="task-selection">
          <Button component={RouterLink} className="network-explorer-button" variant="contained" to="/modules/chem/network-explorer">Network Explorer</Button>
          <Button component={RouterLink} className="pathway-explorer-button" variant="contained" to="/modules/chem/pathway-explorer">Pathway Explorer</Button>
        </div>
      </div>
    );
  }
}