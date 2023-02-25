import React from "react";
import MuiAlert, { AlertProps, AlertColor } from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
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
import {NodeData, GraphData, VisData} from "../../../utils/base";
import {secondToHHMMSS} from "../../../utils/time";
import FileInput from "../../../shared/file-input";
import FormInput from "./form-input"
import ExploreDialog from "./explore-dialog"
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
  openExploreDialog: boolean;
  openSaveDialog: boolean;
}

export default class Automatic extends React.Component<AutomaticProps, AutomaticState> {
  actions: Action[];
  graphDataArray: GraphData[];
  visViewerRef: React.RefObject<HTMLInputElement>;
  visData: VisData;
  visOptions!: VisOptions;
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
    this.visOptions = {height: '0', clickToUse: true};
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
      openExploreDialog: false,
      openSaveDialog: false
    };
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleFormInputSubmit = this.handleFormInputSubmit.bind(this);
    this.handleFormInputRespond = this.handleFormInputRespond.bind(this);
    this.handleFileInputSubmit = this.handleFileInputSubmit.bind(this);
    this.handlePathwayChange = this.handlePathwayChange.bind(this);
    this.handleExploreDialogClose = this.handleExploreDialogClose.bind(this);
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
            if (params["nodes"].length > 0) {
              this.selectedNode = this.visData.nodes.get(params["nodes"])[0];
              if (["target", "intermediate", "substrate"].includes(this.selectedNode!.metadata.type)) {
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
    // let showedGraphData: GraphData = {nodes: [], edges: []};
    // for (const node of graphData.nodes) {
    //   if (node.metadata.show) {
    //     showedGraphData.nodes.push(node);
    //   }
    // }
    // for (const edge of graphData.edges) {
    //   if (edge.metadata.show) {
    //     showedGraphData.edges.push(edge);
    //   }
    // }
    // this.visData = {
    //   nodes: new VisDataSet<any>(showedGraphData.nodes),
    //   edges: new VisDataSet<any>(showedGraphData.edges),
    // };
    this.visData = {
      nodes: new VisDataSet<any>(graphData.nodes),
      edges: new VisDataSet<any>(graphData.edges),
    };
    this.visNetwork!.setData(this.visData);
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
      this.graphDataArray = JSON.parse(event.target!.result as string).graphs
      this.loadVisData(this.graphDataArray[0]);
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

  handleExploreDialogClose() {
    this.setState({openExploreDialog: false});
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
    this.setState({
      currentAction: "New",
      openSnackbar: false
    });
  }

  handleOpenActionClick() {
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
          <ExploreDialog
            data={{node: this.selectedNode}}
            open={this.state.openExploreDialog}
            onClose={this.handleExploreDialogClose}
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