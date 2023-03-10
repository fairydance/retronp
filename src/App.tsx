import React from 'react';
import {Routes, Route} from "react-router-dom";
import NavBar from './shared/navbar'
import Home from './pages/home'
import {default as BioInteractive} from "./pages/bio/interactive"
import {default as BioAutomatic} from "./pages/bio/automatic"
import {default as ChemInteractive} from "./pages/chem/interactive"
import {default as ChemAutomatic} from "./pages/chem/automatic"
import {default as ChemInteractiveTest} from "./pages/chem/interactive-test"
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
            <Route path="/bio/interactive" element={<BioInteractive />} />
            <Route path="/bio/automatic" element={<BioAutomatic />} />
            <Route path="/chem/interactive" element={<ChemInteractive />} />
            <Route path="/chem/automatic" element={<ChemAutomatic />} />
            <Route path="/chem/interactive-test" element={<ChemInteractiveTest />} />
            {/* <Route path="/network-viewer" element={<NetworkViewer />} /> */}
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
    );
  }
}
