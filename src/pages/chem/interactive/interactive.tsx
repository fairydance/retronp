import React from "react";
import MuiAlert, { AlertProps, AlertColor } from "@mui/material/Alert";
import Box from "@mui/material/Box";
import IconButton from '@mui/material/IconButton';
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
import "./interactive.scss"

interface Action {
  name: string;
  icon: JSX.Element;
  onClick: React.MouseEventHandler | undefined;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export interface InteractiveProps {}

export interface InteractiveState {
  currentAction: string;
  hideSpeedDial: boolean;
  openSnackbar: boolean;
  alertSeverity: AlertColor;
  snackbarMessage: string;
  openExploreDrawer: boolean;
  openExploreDialog: boolean;
  openSaveDialog: boolean;
}

export default class Interactive extends React.Component<InteractiveProps, InteractiveState> {
  actions: Action[];
  graphData: GraphData;
  visViewerRef: React.RefObject<HTMLInputElement>;
  visData: VisData;
  visOptions: VisOptions;
  visNetwork: VisNetwork | undefined;
  private clickTime: Date;
  private doubleClickTime: Date;
  private doubleClickThreshold: number;
  private selectedNode: NodeData | undefined;

  constructor(props: InteractiveProps) {
    super(props);
    this.graphData = {nodes: [], edges: []};
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
    this.clickTime = new Date();
    this.doubleClickTime = new Date();
    this.doubleClickThreshold = 50;
    this.state = {
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
    this.handleOpenExploreDrawerButtonClick = this.handleOpenExploreDrawerButtonClick.bind(this);
    this.handleVisNetworkLayoutApply = this.handleVisNetworkLayoutApply.bind(this);
    this.handleExploreDrawerClose = this.handleExploreDrawerClose.bind(this);
    this.handleExploreDialogClose = this.handleExploreDialogClose.bind(this);
    this.handleNextExploreSubmit = this.handleNextExploreSubmit.bind(this);
    this.handleNextExploreRespond = this.handleNextExploreRespond.bind(this);
    this.handleAddReaction = this.handleAddReaction.bind(this);
    this.handleRenderMolecule = this.handleRenderMolecule.bind(this);
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

  loadVisData(newGraphData: GraphData) {
    this.graphData = newGraphData;
    let showedGraphData: GraphData = {nodes: [], edges: []};
    for (const node of this.graphData.nodes) {
      if (node.metadata.show) {
        showedGraphData.nodes.push(node);
      }
    }
    for (const edge of this.graphData.edges) {
      if (edge.metadata.show) {
        showedGraphData.edges.push(edge);
      }
    }
    this.visData = {
      nodes: new VisDataSet<any>(showedGraphData.nodes),
      edges: new VisDataSet<any>(showedGraphData.edges),
    };
    this.visNetwork!.setData(this.visData);
  }

  updateVisData(newGraphData: GraphData) {
    const targetNodeId = newGraphData.nodes.find(node => node.metadata.type === "target")!.id;
    let modifyNodeId = (nodeId: string): string => ((nodeId === targetNodeId) ? this.selectedNode!.id : this.selectedNode!.id + '.' + nodeId);
    let showedGraphData: GraphData = {nodes: [], edges: []};
    for (let node of newGraphData.nodes) {
      node.id = modifyNodeId(node.id);
      if (node.metadata.type != "target") {
        this.graphData.nodes.push(node);
        if (node.metadata.show) {
          showedGraphData.nodes.push(node);
        }
      }
    }
    for (let edge of newGraphData.edges) {
      edge.id = modifyNodeId(edge.from) + "->" + modifyNodeId(edge.to);
      edge.from = modifyNodeId(edge.from);
      edge.to = modifyNodeId(edge.to);
      this.graphData.edges.push(edge);
      if (edge.metadata.show) {
        showedGraphData.edges.push(edge);
      }
    }
    this.selectedNode!.metadata.isExplored = true;
    if (this.selectedNode!.metadata.type != "target") {
      this.selectedNode!.color = {'border': "#ff9800", 'highlight': {'border': "#ff9800"}};
    }
    this.visData.nodes.update(this.selectedNode!);
    this.visData.nodes.add(showedGraphData.nodes);
    this.visData.edges.add(showedGraphData.edges);
  }

  getAllReactionNodes(targetNode: NodeData): NodeData[] {
    let reactionNodes: NodeData[] = [];
    let reactionEdges: {targetSide: EdgeData[], substrateSide: EdgeData[]} = {targetSide: [], substrateSide: []};
    reactionEdges.targetSide.push(...this.graphData.edges.filter(edge => edge.to === targetNode.id)!);
    for (const edge of reactionEdges.targetSide) {
      reactionNodes.push(...this.graphData.nodes.filter(node => node.id === edge.from)!);
    }
    return reactionNodes;
  }

  getAllSubstrateNodes(reactionNode: NodeData): NodeData[] {
    let reactionEdges: {targetSide: EdgeData[], substrateSide: EdgeData[]} = {targetSide: [], substrateSide: []};
    let substrateNodes: NodeData[] = [];
    reactionEdges.substrateSide.push(...this.graphData.edges.filter(edge => edge.to === reactionNode.id)!);
    for (const edge of reactionEdges.substrateSide) {
      substrateNodes.push(...this.graphData.nodes.filter(node => node.id === edge.from)!);
    }
    return substrateNodes;
  }

  getAllReactionBranch(reactionNode: NodeData): GraphData {
    let branch: GraphData = {nodes: [], edges: []};
    let reactionEdges: {targetSide: EdgeData[], substrateSide: EdgeData[]} = {targetSide: [], substrateSide: []};
    let substrateNodes: NodeData[] = [];
    reactionEdges.targetSide.push(...this.graphData.edges.filter(edge => edge.from === reactionNode.id)!);
    reactionEdges.substrateSide.push(...this.graphData.edges.filter(edge => edge.to === reactionNode.id)!);
    for (const edge of reactionEdges.substrateSide) {
      substrateNodes.push(...this.graphData.nodes.filter(node => node.id === edge.from)!);
    }
    branch = {nodes: [reactionNode, ...substrateNodes], edges: [...reactionEdges.targetSide, ...reactionEdges.substrateSide]};
    for (let substrateNode of substrateNodes) {
      let _reactionNodes = this.getAllReactionNodes(substrateNode);
      for (let _reactionNode of _reactionNodes) {
        let _branch = this.getAllReactionBranch(_reactionNode);
        branch.nodes.push(..._branch.nodes);
        branch.edges.push(..._branch.edges);
      }
    }
    return branch;
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
    reactionEdges.targetSide.push(...this.graphData.edges.filter(edge => edge.from === reactionNode.id)!);
    reactionEdges.substrateSide.push(...this.graphData.edges.filter(edge => edge.to === reactionNode.id)!);
    for (const edge of reactionEdges.substrateSide) {
      substrateNodes.push(...this.graphData.nodes.filter(node => node.id === edge.from)!);
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
    for (let node of this.graphData.nodes) {
      if (reactionBranchIds.nodeIds.includes(node.id)) {
        node.metadata.show = false;
      }
    }
    for (let edge of this.graphData.edges) {
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

  handleFormInputRespond(data: {status: {success: boolean, message: string}, graph: GraphData}, timeElapsed: number) {
    if (data.status.success) {
      this.loadVisData(data.graph);
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
      this.loadVisData(JSON.parse(event.target!.result as string).graph);
      this.setState({currentAction: "Explore"});
    };
  }

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

  handleAddReaction(data: {status: {success: boolean, message: string}, graph: GraphData}) {
    if (data.status.success) {
      console.log(data.graph);
      this.updateVisData(data.graph);
      this.setState({
        openExploreDialog: false,
        openSnackbar: true,
        alertSeverity: "success",
        snackbarMessage: "A new reaction is added."
      });
    } else {
      this.setState({
        openSnackbar: true,
        alertSeverity: "error",
        snackbarMessage: data.status.message
      });
    }
  }

  handleRenderMolecule(data: {status: {success: boolean, message: string}, image: string}) {
    if (data.status.success) {
      console.log(data.image);
      this.selectedNode!.image = data.image;
      this.visData.nodes.update(this.selectedNode!);
      this.setState({
        openExploreDialog: false,
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
          <div className="network-viewer" ref={this.visViewerRef} style={{display: "none"}} />
          <FormInput
            requestURL={"http://162.105.160.202:5000/retronp/api/chem/interactive-retrosynthesis"}
            onSubmit={this.handleFormInputSubmit}
            onRespond={this.handleFormInputRespond}
          />
        </div>
      );
    } else if (this.state.currentAction === "Open") {
      mainElement = (
        <div className="open-module">
          <div className="network-viewer" ref={this.visViewerRef} style={{display: "none"}} />
          <FileInput
            maxSize={104857600}
            onSubmit={this.handleFileInputSubmit}
          />
        </div>
      );
    } else if (this.state.currentAction === "Explore") {
      mainElement = (
        <div className="explore-module">
          <div className="network-viewer" ref={this.visViewerRef} />
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
            exploreRequestURL={"http://162.105.160.202:5000/retronp/api/chem/interactive-retrosynthesis"}
            addReactionRequestURL={"http://162.105.160.202:5000/retronp/api/smiles-to-reaction"}
            renderMoleculeRequestURL={"http://162.105.160.202:5000/retronp/api/molecule-render"}
            onClose={this.handleExploreDialogClose}
            onExploreSubmit={this.handleNextExploreSubmit}
            onExploreRespond={this.handleNextExploreRespond}
            onAddReaction={this.handleAddReaction}
            onRenderMolecule={this.handleRenderMolecule}
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
      <div className="interactive-retrosynthesis">
        <Box className="interactive-retrosynthesis-header-box"
          sx={{
            backgroundColor: "primary.main",
          }}
        >
          <h1>Interactive Retrosynthesis</h1>
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