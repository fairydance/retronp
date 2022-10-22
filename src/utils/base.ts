import {DataSet as VisDataSet} from "vis-data";

export interface NodeData {
  id: string;
  label: string;
  color: {'border': string, 'highlight': {'border': string}} | string;
  image?: string;
  metadata: {
    type: string;
    smiles?: string;
    reactionId?: string;
    score?: string;
    smarts?: string;
    isExplored?: boolean;
    show?: boolean;
    ruleType?: string;
  }
}

export interface EdgeData {
  id: string;
  label?: string;
  from: string;
  to: string;
  metadata: {
    show?: boolean;
  }
}

export interface GraphData {
  nodes: NodeData[];
  edges: EdgeData[];
}

export interface VisData {
  nodes: VisDataSet<any>;
  edges: VisDataSet<any>;
}