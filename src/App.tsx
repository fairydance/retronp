import React from 'react';
import {Routes, Route} from "react-router-dom";
import NavBar from './shared/navbar'
import Home from './pages/home'
import {default as BioNetworkExplorer} from "./pages/bio/interactive"
import {default as BioPathwayExplorer} from "./pages/bio/automatic"
import {default as ChemNetworkExplorer} from "./pages/chem/interactive"
import {default as ChemPathwayExplorer} from "./pages/chem/automatic"
import NetworkViewer from './pages/network-viewer'
import About from "./pages/about"
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
            <Route path="/bio/interactive" element={<BioNetworkExplorer />} />
            <Route path="/bio/automatic" element={<BioPathwayExplorer />} />
            <Route path="/chem/interactive" element={<ChemNetworkExplorer />} />
            <Route path="/chem/automatic" element={<ChemPathwayExplorer />} />
            {/* <Route path="/network-viewer" element={<NetworkViewer />} /> */}
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
    );
  }
}
