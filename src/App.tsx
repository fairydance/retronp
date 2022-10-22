import React from 'react';
import {Routes, Route} from "react-router-dom";
import NavBar from './shared/navbar'
import Home from './pages/home'
import Bio from "./pages/modules/bio"
import {default as BioNetworkExplorer} from "./pages/modules/bio/network-explorer"
import {default as BioPathwayExplorer} from "./pages/modules/bio/pathway-explorer"
import Chem from "./pages/modules/chem"
import {default as ChemNetworkExplorer} from "./pages/modules/chem/network-explorer"
import {default as ChemPathwayExplorer} from "./pages/modules/chem/pathway-explorer"
import NetworkViewer from './pages/network-viewer'
import './App.scss';

interface AppProps {}

interface AppState {}

export default class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
  }

  render() {
    return (
      <div className="app">
        <div className="app-nav">
          <NavBar />
        </div>
        <div className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/modules/bio" element={<Bio />} />
            <Route path="/modules/bio/network-explorer" element={<BioNetworkExplorer />} />
            <Route path="/modules/bio/pathway-explorer" element={<BioPathwayExplorer />} />
            <Route path="/modules/chem" element={<Chem />} />
            <Route path="/modules/chem/network-explorer" element={<ChemNetworkExplorer />} />
            <Route path="/modules/chem/pathway-explorer" element={<ChemPathwayExplorer />} />
            {/* <Route path="/network-viewer" element={<NetworkViewer />} /> */}
          </Routes>
        </div>
      </div>
    );
  }
}
