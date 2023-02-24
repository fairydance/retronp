import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import "./about.scss"

interface AboutProps {}

interface AboutState {}

export default class About extends React.Component<AboutProps, AboutState> {
  constructor(props: AboutProps) {
    super(props);
  }

  render() {
    let domainDescriptionTemplateString = `{
  <chain-id>: [
    {
      "domain-id": <unique-domain-id>,
      "cath-code": <cath-code>,
      "segments": [[<begin-resi>, <end-resi>],...]
    },
    ...
  ],
  ...
}`;
    return (
      <Box component="div" className="about">
        <Box component="div" className="panel-header"
          sx={{
            backgroundColor: "primary.main",
          }}
        >
          <h1>About RetroNP</h1>
        </Box>
        <Box component="div" className="about-main">
          
        </Box>
      </Box>
    );
  }
}
