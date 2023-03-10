import React from "react";
import MuiAlert, { AlertProps, AlertColor } from "@mui/material/Alert";
import Box from "@mui/material/Box";
import IconButton from '@mui/material/IconButton';
import Pagination from "@mui/material/Pagination";
import Snackbar from "@mui/material/Snackbar";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CreateIcon from "@mui/icons-material/Create";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import SaveIcon from "@mui/icons-material/Save";
import StartIcon from '@mui/icons-material/Start';
import {Network as VisNetwork, Options as VisOptions, IdType as VisIdType} from "vis-network";
import {DataSet as VisDataSet} from "vis-data";
import {NodeData, EdgeData, GraphData, VisData} from "../../../utils/base";
import {secondToHHMMSS} from "../../../utils/time";
import FileInput from "../../../shared/file-input";
import FormInput from "./form-input"
import ExploreDrawer from "../../../shared/explore-drawer"
import ExploreDialog from "../../../shared/explore-dialog"
import SaveDialog from "./save-dialog"
import "./automatic.scss"

interface Action {
  name: string;
  icon: JSX.Element;
  onClick: React.MouseEventHandler | undefined;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export interface AutomaticProps {}

export interface AutomaticState {
  currentGraphIdx: number;
  currentAction: string;
  hideSpeedDial: boolean;
  openSnackbar: boolean;
  alertSeverity: AlertColor;
  snackbarMessage: string;
  openExploreDrawer: boolean;
  openExploreDialog: boolean;
  openSaveDialog: boolean;
}

export default class Automatic extends React.Component<AutomaticProps, AutomaticState> {
  actions: Action[];
  graphDataArray: GraphData[];
  visViewerRef: React.RefObject<HTMLInputElement>;
  visData: VisData;
  visOptions: VisOptions;
  visNetwork: VisNetwork | undefined;
  updateVisNetwork: boolean;
  private clickTime: Date;
  private doubleClickTime: Date;
  private doubleClickThreshold: number;
  private selectedNode: NodeData | undefined;

  constructor(props: AutomaticProps) {
    super(props);
    this.graphDataArray = [{"nodes": [], "edges": []}];
    this.visViewerRef = React.createRef();
    this.visData = {
      nodes: new VisDataSet<any>([]),
      edges: new VisDataSet<any>([])
    };
    this.visOptions = {
      height: '0',
      clickToUse: true,
      layout: {
        hierarchical: {
          enabled: false,
          direction: "LR",
          sortMethod: "directed"
        }
      }
    };
    this.updateVisNetwork = true;
    this.clickTime = new Date();
    this.doubleClickTime = new Date();
    this.doubleClickThreshold = 50;
    this.state = {
      currentGraphIdx: 0,
      currentAction: "New",
      hideSpeedDial: false,
      openSnackbar: false,
      alertSeverity: "info",
      snackbarMessage: "",
      openExploreDrawer: false,
      openExploreDialog: false,
      openSaveDialog: false
    };
    this.getAllReactionNodes = this.getAllReactionNodes.bind(this);
    this.getAllSubstrateNodes = this.getAllSubstrateNodes.bind(this);
    this.showReaction = this.showReaction.bind(this);
    this.hideReaction = this.hideReaction.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleFormInputSubmit = this.handleFormInputSubmit.bind(this);
    this.handleFormInputRespond = this.handleFormInputRespond.bind(this);
    this.handleFileInputSubmit = this.handleFileInputSubmit.bind(this);
    this.handlePathwayChange = this.handlePathwayChange.bind(this);
    this.handleOpenExploreDrawerButtonClick = this.handleOpenExploreDrawerButtonClick.bind(this);
    this.handleVisNetworkLayoutApply = this.handleVisNetworkLayoutApply.bind(this);
    this.handleExploreDrawerClose = this.handleExploreDrawerClose.bind(this);
    this.handleExploreDialogClose = this.handleExploreDialogClose.bind(this);
    this.handleRenderMolecule = this.handleRenderMolecule.bind(this);
    this.handleSaveDialogClose = this.handleSaveDialogClose.bind(this);
    this.handlePathwaySave = this.handlePathwaySave.bind(this);
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
    this.visOptions.height = `${this.visViewerRef.current!.offsetHeight}px`;
    this.visNetwork!.setOptions(this.visOptions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  initEmptyVisNetwork() {
    this.visNetwork = new VisNetwork(this.visViewerRef.current!, {}, this.visOptions);
    this.visNetwork.on("click", (params: any) => {
      this.clickTime = new Date();
      if (this.clickTime.getTime() - this.doubleClickTime.getTime() > this.doubleClickThreshold) {
        setTimeout(() => {
          if (this.clickTime.getTime() - this.doubleClickTime.getTime() > this.doubleClickThreshold) {
            if (params["nodes"].length > 0) {
              this.selectedNode = this.visData.nodes.get(params["nodes"])[0];
              if (["target", "intermediate", "substrate", "reaction"].includes(this.selectedNode!.metadata.type)) {
                console.log(`click node (id=${this.selectedNode!.id})`);
                this.setState({openExploreDialog: true});
              }
            }
          }
        }, this.doubleClickThreshold)
      }
    });
    this.visNetwork.on("doubleClick", (params: any) => {
      this.doubleClickTime = new Date();
      if (params["nodes"].length > 0) {
        this.selectedNode = this.visData.nodes.get(params["nodes"])[0];
        if (this.selectedNode!.metadata.type !== "substrate" && !this.selectedNode!.metadata.isExplored) {
          console.log(`double click node (id=${this.selectedNode!.id})`);
          this.setState({openExploreDialog: true});
        }
      }
    });
  }

  loadVisData(graphData: GraphData) {
    this.visData = {
      nodes: new VisDataSet<any>(graphData.nodes),
      edges: new VisDataSet<any>(graphData.edges),
    };
    this.visNetwork!.setData(this.visData);
  }

  getAllReactionNodes(targetNode: NodeData): NodeData[] {
    let reactionNodes: NodeData[] = [];
    let reactionEdges: {targetSide: EdgeData[], substrateSide: EdgeData[]} = {targetSide: [], substrateSide: []};
    reactionEdges.targetSide.push(...this.graphDataArray[this.state.currentGraphIdx].edges.filter(edge => edge.to === targetNode.id)!);
    for (const edge of reactionEdges.targetSide) {
      reactionNodes.push(...this.graphDataArray[this.state.currentGraphIdx].nodes.filter(node => node.id === edge.from)!);
    }
    return reactionNodes;
  }

  getAllSubstrateNodes(reactionNode: NodeData): NodeData[] {
    let reactionEdges: {targetSide: EdgeData[], substrateSide: EdgeData[]} = {targetSide: [], substrateSide: []};
    let substrateNodes: NodeData[] = [];
    reactionEdges.substrateSide.push(...this.graphDataArray[this.state.currentGraphIdx].edges.filter(edge => edge.to === reactionNode.id)!);
    for (const edge of reactionEdges.substrateSide) {
      substrateNodes.push(...this.graphDataArray[this.state.currentGraphIdx].nodes.filter(node => node.id === edge.from)!);
    }
    return substrateNodes;
  }

  getVisReactionBranchIds(reactionNodeId: string): {nodeIds: string[], edgeIds: string[]} {
    let reactionBranchIds: {nodeIds: string[], edgeIds: string[]} = {nodeIds: [], edgeIds: []};
    let reactionEdgeIds = this.visNetwork!.getConnectedEdges(reactionNodeId);
    let substrateNodeIds = this.visNetwork!.getConnectedNodes(reactionNodeId, "from");
    let substrateNodes = this.visData.nodes.get(substrateNodeIds as VisIdType[]);
    reactionBranchIds = {nodeIds: [reactionNodeId, ...(substrateNodeIds as string[])], edgeIds: reactionEdgeIds as string[]};
    for (let substrateNode of substrateNodes) {
      let _reactionNodeIds = this.visNetwork!.getConnectedNodes(substrateNode.id, "from");
      for (let _reactionNodeId of _reactionNodeIds) {
        let _reactionBranchIds = this.getVisReactionBranchIds(_reactionNodeId as string);
        reactionBranchIds.nodeIds = reactionBranchIds.nodeIds.concat(_reactionBranchIds.nodeIds);
        reactionBranchIds.edgeIds = reactionBranchIds.edgeIds.concat(_reactionBranchIds.edgeIds);
      }
    }
    return reactionBranchIds;
  }

  showReaction(reactionNode: NodeData) {
    let reactionEdges: {targetSide: EdgeData[], substrateSide: EdgeData[]} = {targetSide: [], substrateSide: []};
    let substrateNodes: NodeData[] = [];
    reactionEdges.targetSide.push(...this.graphDataArray[this.state.currentGraphIdx].edges.filter(edge => edge.from === reactionNode.id)!);
    reactionEdges.substrateSide.push(...this.graphDataArray[this.state.currentGraphIdx].edges.filter(edge => edge.to === reactionNode.id)!);
    for (const edge of reactionEdges.substrateSide) {
      substrateNodes.push(...this.graphDataArray[this.state.currentGraphIdx].nodes.filter(node => node.id === edge.from)!);
    }

    reactionNode.metadata.show = true;
    for (let edge of reactionEdges.targetSide) {
      edge.metadata.show = true;
    }
    for (let node of substrateNodes) {
      node.metadata.show = true;
    }
    for (let edge of reactionEdges.substrateSide) {
      edge.metadata.show = true;
    }

    this.visData.nodes.add([reactionNode, ...substrateNodes]);
    this.visData.edges.add([...reactionEdges.targetSide, ...reactionEdges.substrateSide]);
  }

  hideReaction(reactionNode: NodeData) {
    const reactionBranchIds = this.getVisReactionBranchIds(reactionNode.id);
    for (let node of this.graphDataArray[this.state.currentGraphIdx].nodes) {
      if (reactionBranchIds.nodeIds.includes(node.id)) {
        node.metadata.show = false;
      }
    }
    for (let edge of this.graphDataArray[this.state.currentGraphIdx].edges) {
      if (reactionBranchIds.edgeIds.includes(edge.id)) {
        edge.metadata.show = false;
      }
    }
    this.visData.edges.remove(reactionBranchIds.edgeIds);
    this.visData.nodes.remove(reactionBranchIds.nodeIds);
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

  handleFormInputRespond(data: {status: {success: boolean, message: string}, graphs: GraphData[]}, timeElapsed: number) {
    if (data.status.success) {
      this.graphDataArray = data.graphs;
      this.loadVisData(this.graphDataArray[0]);
      this.visOptions.layout.hierarchical.enabled = true;
      this.setState({
        currentAction: "Explore",
        currentGraphIdx: 0,
        hideSpeedDial: false,
        openSnackbar: true,
        alertSeverity: "success",
        snackbarMessage: `Mission complete! Time elapsed: ${secondToHHMMSS(timeElapsed)}`
      });
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
      this.graphDataArray = JSON.parse(event.target!.result as string).graphs;
      this.loadVisData(this.graphDataArray[0]);
      this.visOptions.layout.hierarchical.enabled = true;
      this.setState({
        currentAction: "Explore",
        currentGraphIdx: 0
      });
    };
  }

  handlePathwayChange(event: React.ChangeEvent<unknown>, value: number) {
    this.loadVisData(this.graphDataArray[value - 1]);
    this.setState({currentGraphIdx: value - 1});
  };

  handleOpenExploreDrawerButtonClick() {
    this.setState({openExploreDrawer: true});
  }

  handleVisNetworkLayoutApply(layout: any) {
    this.visOptions.layout = layout;
    this.visNetwork!.setOptions(this.visOptions);
  }

  handleExploreDrawerClose() {
    this.setState({openExploreDrawer: false});
  }

  handleExploreDialogClose() {
    this.setState({openExploreDialog: false});
  }

  handleRenderMolecule(data: {status: {success: boolean, message: string}, image: string}) {
    if (data.status.success) {
      console.log(data.image);
      this.selectedNode!.image = data.image;
      this.visData.nodes.update(this.selectedNode!);
      this.setState({
        openSnackbar: true,
        alertSeverity: "success",
        snackbarMessage: "Molecule is redrawed."
      });
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

  handlePathwaySave() {
    this.setState({openSaveDialog: false});
  }

  handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
    if (reason === 'clickaway') {
      return;
    }
    this.updateVisNetwork = false;
    this.setState({openSnackbar: false});
  }

  handleNewActionClick() {
    this.visOptions.layout.hierarchical.enabled = false;
    this.setState({
      currentAction: "New",
      openSnackbar: false
    });
  }

  handleOpenActionClick() {
    this.visOptions.layout.hierarchical.enabled = false;
    this.setState({
      currentAction: "Open",
      openSnackbar: false
    });
  }

  handleExploreActionClick() {
    this.visOptions.layout.hierarchical.enabled = true;
    this.setState({
      currentAction: "Explore",
      openSnackbar: false
    });
  }

  handleSaveActionClick() {
    this.updateVisNetwork = false;
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
          <div className="pathway-viewer" ref={this.visViewerRef} style={{display: "none"}} />
          <FormInput
            requestURL={"http://162.105.160.202:5000/retronp/api/chem/automatic-retrosynthesis"}
            onSubmit={this.handleFormInputSubmit}
            onRespond={this.handleFormInputRespond}
          />
        </div>
      );
    } else if (this.state.currentAction === "Open") {
      mainElement = (
        <div className="open-module">
          <div className="pathway-viewer" ref={this.visViewerRef} style={{display: "none"}} />
          <FileInput
            maxSize={104857600}
            onSubmit={this.handleFileInputSubmit}
          />
        </div>
      );
    } else if (this.state.currentAction === "Explore") {
      mainElement = (
        <div className="explore-module">
          <div className="pathway-viewer" ref={this.visViewerRef} />
          <Pagination color="primary"
            className="pathway-chooser"
            count={this.graphDataArray.length}
            onChange={this.handlePathwayChange}
          />
          <IconButton aria-label="start-icon" color="primary"
            sx={{
              position: "absolute",
              margin: "1rem"
            }}
            onClick={this.handleOpenExploreDrawerButtonClick}
          >
            <StartIcon />
          </IconButton>
          <ExploreDrawer
            width={300}
            open={this.state.openExploreDrawer}
            initData={{layout: this.visOptions.layout}}
            onClose={this.handleExploreDrawerClose}
            onLayoutApply={this.handleVisNetworkLayoutApply}
          />
          <ExploreDialog
            data={{node: this.selectedNode}}
            open={this.state.openExploreDialog}
            renderMoleculeRequestURL={"http://162.105.160.202:5000/retronp/api/molecule-render"}
            onRenderMolecule={this.handleRenderMolecule}
            onClose={this.handleExploreDialogClose}
            getAllReactionNodes={this.getAllReactionNodes}
            getAllSubstrateNodes={this.getAllSubstrateNodes}
            showReaction={this.showReaction}
            hideReaction={this.hideReaction}
          />
        </div>
      );
    } else {
      mainElement = (
        <div></div>
      );
    }

    return (
      <div className="automatic-retrosynthesis">
        <Box className="automatic-retrosynthesis-header-box"
          sx={{
            backgroundColor: "primary.main",
          }}
        >
          <h1>Automatic Retrosynthesis</h1>
        </Box>
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
          data={{graphs: this.graphDataArray, currentGraphIdx: this.state.currentGraphIdx}}
          open={this.state.openSaveDialog}
          inputProps={{min: 1, max: this.graphDataArray.length}}
          onClose={this.handleSaveDialogClose}
          onSubmit={this.handlePathwaySave}
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