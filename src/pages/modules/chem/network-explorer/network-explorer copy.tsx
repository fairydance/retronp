import React from "react";
import MuiAlert, { AlertProps, AlertColor } from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CreateIcon from "@mui/icons-material/Create";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import SaveIcon from "@mui/icons-material/Save";
import {Network as VisNetwork, Options as VisOptions, IdType as VisIdType} from "vis-network";
import {DataSet as VisDataSet} from "vis-data";
import {NodeData, EdgeData, GraphData, VisData} from "../../../../utils/base";
import {secondToHHMMSS} from "../../../../utils/time";
import FileInput from "../../../../shared/file-input";
import FormInput from "./new-task"
import ExploreDialog from "./currently-selected-dialog"
import SaveDialog from "./save-dialog"
import "./network-explorer.scss"
import { display } from "@mui/system";

interface Action {
  name: string;
  icon: JSX.Element;
  onClick: React.MouseEventHandler | undefined;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export interface NetworkExplorerProps {}

export interface NetworkExplorerState {
  currentAction: string;
  hideSpeedDial: boolean;
  openSnackbar: boolean;
  alertSeverity: AlertColor;
  snackbarMessage: string;
  openExploreDialog: boolean;
  openSaveDialog: boolean;
}

export default class NetworkExplorer extends React.Component<NetworkExplorerProps, NetworkExplorerState> {
  actions: Action[];
  graphData: GraphData;
  visViewerRef: React.RefObject<HTMLInputElement>;
  visData: VisData;
  visOptions!: VisOptions;
  visNetwork: VisNetwork | undefined;
  private clickTime: Date;
  private doubleClickTime: Date;
  private doubleClickThreshold: number;
  private selectedNode: NodeData | undefined;

  constructor(props: NetworkExplorerProps) {
    super(props);
    this.graphData = {nodes: [], edges: []};
    this.visViewerRef = React.createRef();
    this.visData = {
      nodes: new VisDataSet<any>([]),
      edges: new VisDataSet<any>([])
    };
    this.visOptions = {height: '0', clickToUse: true};
    this.clickTime = new Date();
    this.doubleClickTime = new Date();
    this.doubleClickThreshold = 50;
    this.state = {
      currentAction: "New",
      hideSpeedDial: false,
      openSnackbar: false,
      alertSeverity: "info",
      snackbarMessage: "",
      openExploreDialog: false,
      openSaveDialog: false
    };
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleFormInputSubmit = this.handleFormInputSubmit.bind(this);
    this.handleFormInputRespond = this.handleFormInputRespond.bind(this);
    this.handleFileInputSubmit = this.handleFileInputSubmit.bind(this);
    this.handleExploreDialogClose = this.handleExploreDialogClose.bind(this);
    this.handleNextExploreSubmit = this.handleNextExploreSubmit.bind(this);
    this.handleNextExploreRespond = this.handleNextExploreRespond.bind(this);
    this.handleSaveDialogClose = this.handleSaveDialogClose.bind(this);
    this.handleNetworkSave = this.handleNetworkSave.bind(this);
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
    this.handleNewActionClick = this.handleNewActionClick.bind(this);
    this.handleExploreActionClick = this.handleExploreActionClick.bind(this);
    this.handleOpenActionClick = this.handleOpenActionClick.bind(this);
    this.handleSaveActionClick = this.handleSaveActionClick.bind(this);
    this.actions = [
      {name: "Save", icon: <SaveIcon />, onClick: this.handleSaveActionClick},
      {name: "Explore", icon: <AccountTreeIcon />, onClick: this.handleExploreActionClick},
      {name: "Open", icon: <FileOpenIcon />, onClick: this.handleOpenActionClick},
      {name: "New", icon: <CreateIcon />, onClick: this.handleNewActionClick},
    ];
  }

  componentDidMount() {
    this.initEmptyVisNetwork();
    window.addEventListener("resize", this.handleWindowResize);
  }

  componentDidUpdate() {
    if (this.state.currentAction === "Explore") {
      this.visOptions.height = `${this.visViewerRef.current!.offsetHeight}px`;
      this.visNetwork!.setOptions(this.visOptions);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  initEmptyVisNetwork() {
    this.visOptions = {height: '0', clickToUse: true};
    this.visNetwork = new VisNetwork(this.visViewerRef.current!, {}, this.visOptions);
    this.visNetwork.on("click", (params: any) => {
      this.clickTime = new Date();
      if (this.clickTime.getTime() - this.doubleClickTime.getTime() > this.doubleClickThreshold) {
        setTimeout(() => {
          if (this.clickTime.getTime() - this.doubleClickTime.getTime() > this.doubleClickThreshold) {
            console.log("vis-network click event");
            if (params["nodes"].length > 0) {
              this.selectedNode = this.visData.nodes.get(params["nodes"])[0];
              if (["target", "intermediate", "substrate"].includes(this.selectedNode!.metadata.type)) {
                // this.getAllReactionNodes(selectedNode.id, ruleType);
                console.log(this.selectedNode!.id);
                this.setState({openExploreDialog: true});
              }
            }
          }
        }, this.doubleClickThreshold)
      }
    });
    this.visNetwork.on("doubleClick", (params: any) => {
      this.doubleClickTime = new Date();
      console.log("vis-network double click event");
      if (params["nodes"].length > 0) {
        this.selectedNode = this.visData.nodes.get(params["nodes"])[0];
        if (this.selectedNode!.metadata.type === "substrate") {
          this.setState({openExploreDialog: true});
        }
      }
    });
  }

  loadVisData() {
    let targetNode: NodeData = this.graphData.nodes.find(node => node.metadata.type === "target")!;
    let reactionNodes: NodeData[] = [];
    let reactionEdges: {targetSide: EdgeData[], substrateSide: EdgeData[]} = {targetSide: [], substrateSide: []};
    let substrateNodes: NodeData[] = [];
    reactionEdges.targetSide.push(...this.graphData.edges.filter(edge => edge.to === targetNode.id)!);
    if (reactionEdges.targetSide.length > 5) {
      reactionEdges.targetSide = reactionEdges.targetSide.slice(0, 5);
    }
    for (const edge of reactionEdges.targetSide) {
      reactionNodes.push(...this.graphData.nodes.filter(node => node.id === edge.from)!);
    }
    for (const node of reactionNodes) {
      reactionEdges.substrateSide.push(...this.graphData.edges.filter(edge => edge.to === node.id)!);
    }
    for (const edge of reactionEdges.substrateSide) {
      substrateNodes.push(...this.graphData.nodes.filter(node => node.id === edge.from)!);
    }
    let nodes = new VisDataSet<any>([targetNode, ...reactionNodes, ...substrateNodes]);
    let edges = new VisDataSet<any>([...reactionEdges.targetSide, ...reactionEdges.substrateSide]);
    this.visData = {
      nodes: nodes,
      edges: edges,
    };
    this.visNetwork!.setData(this.visData);
  }

  updateVisData(graphData: GraphData) {
    const targetNodeId = graphData.nodes.find(node => node.metadata.type === "target")!.id;
    let modifyNodeId = (nodeId: string): string => ((nodeId === targetNodeId) ? this.selectedNode!.id : this.selectedNode!.id + '.' + nodeId);
    for (let node of graphData.nodes) {
      node.id = modifyNodeId(node.id);
      if (node.metadata.type != "target") {
        this.graphData.nodes.push(node);
      }
    }
    for (let edge of graphData.edges) {
      edge.id = modifyNodeId(edge.from) + "->" + modifyNodeId(edge.to);
      edge.from = modifyNodeId(edge.from);
      edge.to = modifyNodeId(edge.to);
      this.graphData.edges.push(edge);
    }
    this.selectedNode!.metadata.isExplored = true;
    this.selectedNode!.color = {'border': "#ff9800", 'highlight': {'border': "#ff9800"}};
    let reactionNodes: NodeData[] = [];
    let reactionEdges: {targetSide: EdgeData[], substrateSide: EdgeData[]} = {targetSide: [], substrateSide: []};
    let substrateNodes: NodeData[] = [];
    reactionEdges.targetSide.push(...this.graphData.edges.filter(edge => edge.to === this.selectedNode!.id)!);
    if (reactionEdges.targetSide.length > 5) {
      reactionEdges.targetSide = reactionEdges.targetSide.slice(0, 5);
    }
    for (const edge of reactionEdges.targetSide) {
      reactionNodes.push(...this.graphData.nodes.filter(node => node.id === edge.from)!);
    }
    for (const node of reactionNodes) {
      reactionEdges.substrateSide.push(...this.graphData.edges.filter(edge => edge.to === node.id)!);
    }
    for (const edge of reactionEdges.substrateSide) {
      substrateNodes.push(...this.graphData.nodes.filter(node => node.id === edge.from)!);
    }
    console.log('i', this.selectedNode!.id);
    for (const node of reactionNodes) {
      console.log('r', node.id);
    }
    for (const node of substrateNodes) {
      console.log('s', node.id);
    }
    this.visData.nodes.update(this.selectedNode!);
    this.visData.nodes.add([...reactionNodes, ...substrateNodes]);
    this.visData.edges.add([...reactionEdges.targetSide, ...reactionEdges.substrateSide]);
  }

  handleWindowResize() {
    if (this.state.currentAction === "Explore") {
      if (this.visNetwork) {
        this.visOptions.height = '0';
        this.visNetwork.setOptions(this.visOptions);
        this.visOptions.height = `${this.visViewerRef.current!.offsetHeight}px`;
        this.visNetwork.setOptions(this.visOptions);
      }
    }
  }

  handleFormInputSubmit() {
    this.setState({
      hideSpeedDial: true,
    })
  }

  handleFormInputRespond(data: {status: {success: boolean, message: string}, graph: GraphData}, timeElapsed: number) {
    if (data.status.success) {
      this.graphData = data.graph;
      this.loadVisData();
      if (data.graph.nodes.length > 1) {
        this.setState({
          currentAction: "Explore",
          hideSpeedDial: false,
          openSnackbar: true,
          alertSeverity: "success",
          snackbarMessage: `Mission complete! Time elapsed: ${secondToHHMMSS(timeElapsed)}`
        });
      } else {
        this.setState({
          currentAction: "Explore",
          hideSpeedDial: false,
          openSnackbar: true,
          alertSeverity: "warning",
          snackbarMessage: "No result"
        });
      }
    } else {
      this.setState({
        hideSpeedDial: false,
        openSnackbar: true,
        alertSeverity: "error",
        snackbarMessage: data.status.message
      });
    }
  }

  handleFileInputSubmit(files: File[]) {
    const fileReader = new FileReader();
    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = event => {
      this.graphData = JSON.parse(event.target!.result as string).graph;
      this.loadVisData();
      this.setState({currentAction: "Explore"});
    };
  }

  handleExploreDialogClose() {
    this.setState({openExploreDialog: false});
  }

  handleNextExploreSubmit() {
    this.setState({openSnackbar: false});
  }

  handleNextExploreRespond(data: {status: {success: boolean, message: string}, graph: GraphData}, timeElapsed: number) {
    if (data.status.success) {
      this.updateVisData(data.graph);
      if (data.graph.nodes.length > 1) {
        this.setState({
          openExploreDialog: false,
          openSnackbar: true,
          alertSeverity: "success",
          snackbarMessage: `Mission complete! Time elapsed: ${secondToHHMMSS(timeElapsed)}`
        });
      } else {
        this.setState({
          openSnackbar: true,
          alertSeverity: "warning",
          snackbarMessage: "No result."
        });
      }
    } else {
      this.setState({
        openSnackbar: true,
        alertSeverity: "error",
        snackbarMessage: data.status.message
      });
    }
  }

  handleSaveDialogClose() {
    this.setState({openSaveDialog: false});
  }

  handleNetworkSave() {
    this.setState({openSaveDialog: false});
  }

  handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({openSnackbar: false});
  }

  handleNewActionClick() {
    this.visNetwork?.setOptions({height: '0'});
    this.setState({
      currentAction: "New",
      openSnackbar: false
    });
  }

  handleOpenActionClick() {
    this.visNetwork?.setOptions({height: '0'});
    this.setState({
      currentAction: "Open",
      openSnackbar: false
    });
  }

  handleExploreActionClick() {
    this.setState({
      currentAction: "Explore",
      openSnackbar: false
    });
  }

  handleSaveActionClick() {
    this.setState({
      openSnackbar: false,
      openSaveDialog: true
    });
  }

  render(): React.ReactNode {
    let mainElement: JSX.Element;

    if (this.state.currentAction === "New") {
      mainElement = (
        <div className="new-module">
          <FormInput
            onSubmit={this.handleFormInputSubmit}
            onRespond={this.handleFormInputRespond}
          />
        </div>
      );
    } else if (this.state.currentAction === "Open") {
      mainElement = (
        <div className="open-module">
          <FileInput
            maxSize={104857600}
            onSubmit={this.handleFileInputSubmit}
          />
        </div>
      );
    } else if (this.state.currentAction === "Explore") {
      mainElement = (
        <div className="explore-module">
          {/* <ExploreDialog
            data={{node: this.selectedNode}}
            open={this.state.openExploreDialog}
            onClose={this.handleExploreDialogClose}
            onSubmit={this.handleNextExploreSubmit}
            onRespond={this.handleNextExploreRespond}
          /> */}
        </div>
      );
    } else {
      mainElement = (
        <div></div>
      );
    }

    return (
      <div className="network-explorer">
        <Box className="network-explorer-header-box"
          sx={{
            backgroundColor: "primary.main",
          }}
        >
          <h1>Network Explorer</h1>
        </Box>
        <div className="network-viewer" ref={this.visViewerRef} style={{display: (this.state.currentAction === "Explore" ? "flex" : "none")}}></div>
        {mainElement}
        <SpeedDial
          className="speed-dail"
          ariaLabel="Speed Dial"
          icon={<SpeedDialIcon />}
          sx={{
            display: this.state.hideSpeedDial? "none" : "flex"
          }}
        >
          {this.actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.onClick}
            />
          ))}
        </SpeedDial>
        <SaveDialog
          data={{graphData: this.graphData}}
          open={this.state.openSaveDialog}
          onClose={this.handleSaveDialogClose}
          handleSubmit={this.handleNetworkSave}
        />
        <Snackbar
          open={this.state.openSnackbar}
          onClose={this.handleSnackbarClose}
        >
          <Alert onClose={this.handleSnackbarClose} severity={this.state.alertSeverity} sx={{ width: '100%' }}>
            {this.state.snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    );
  }
}