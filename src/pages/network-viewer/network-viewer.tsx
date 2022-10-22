import React from "react";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import {GraphData} from "../../utils/base";
import FileInput from "./file-input";
import ReactionNetwork from "./reaction-network";
import "./network-viewer.scss";

interface NetworkViewerProps {}

interface NetworkViewerState {
  files: File[];
  fileInputDisabled: boolean;
  fileData: object;
  displayNetwork: boolean;
  graph: GraphData;
}

export default class NetworkViewer extends React.Component<NetworkViewerProps, NetworkViewerState> {
  constructor(props: NetworkViewerProps) {
    super(props);
    this.state = {
      files: [],
      fileInputDisabled: false,
      fileData: {},
      displayNetwork: false,
      graph: {nodes: [], edges: []}
    };
    this.handleFileInputChange = this.handleFileInputChange.bind(this);
    this.handleFileUploadSubmit = this.handleFileUploadSubmit.bind(this);
  }

  handleFileInputChange(files: File[]) {
    this.setState({ files: files });
  }

  handleFileUploadSubmit() {
    this.setState({fileInputDisabled: true});
    const fileReader = new FileReader();
    fileReader.readAsText(this.state.files[0], "UTF-8");
    fileReader.onload = e => {
      this.setState({
        displayNetwork: true,
        graph: JSON.parse(e.target!.result as string).graph
      });
    };
  }

  render() {
    let element: JSX.Element;
    if (this.state.displayNetwork) {
      element = (
        <ReactionNetwork graph={this.state.graph}></ReactionNetwork>
      );
    } else {
      element = (
        <FileInput
          value={this.state.files}
          maxSize={10485760}
          disabled={this.state.fileInputDisabled}
          onChange={this.handleFileInputChange}
          onSubmit={this.handleFileUploadSubmit}
        />
      );
    }

    return (
      <div className="network-viewer">
        {element}
      </div>
    );
  }
}
