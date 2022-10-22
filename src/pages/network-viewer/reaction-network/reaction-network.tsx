import React from "react";
import {Network as VisNetwork, Options as VisOptions, IdType as VisIdType} from "vis-network";
import {DataSet as VisDataSet} from "vis-data";
import {GraphData} from "../../../utils/base";
import "./reaction-network.scss";

export interface ReactionNetworkProps {
  graph: GraphData;
}

export interface ReactionNetworkState {}

export default class ReactionNetwork extends React.Component<ReactionNetworkProps, ReactionNetworkState> {
  reactionNetworkRef: React.RefObject<HTMLInputElement>;
  visOptions!: VisOptions;
  visNetwork!: VisNetwork;

  constructor(props: ReactionNetworkProps) {
    super(props);
    this.reactionNetworkRef = React.createRef();
    this.handleWindowResize = this.handleWindowResize.bind(this);
  }

  componentDidMount() {
    this.visOptions = {
      height: `${this.reactionNetworkRef.current!.offsetHeight - 1}px`,
      // clickToUse: true,
    };
    this.visNetwork = new VisNetwork(this.reactionNetworkRef.current!, this.props.graph, this.visOptions);
    window.addEventListener('resize', this.handleWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  handleWindowResize() {
    this.visOptions.height = '0';
    this.visNetwork.setOptions(this.visOptions);
    this.visOptions.height = `${this.reactionNetworkRef.current!.offsetHeight - 1}px`;
    this.visNetwork.setOptions(this.visOptions);
  }

  render() {
    return (
      <div className="reaction-network" ref={this.reactionNetworkRef}></div>
    );
  }
}