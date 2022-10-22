import React from "react";
import {Link as RouterLink} from "react-router-dom";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import "./home.scss"

const bull = (
  <Box
    component="span"
    sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
  >
    •
  </Box>
);


interface HomeProps {}

interface HomeState {}

export default class Home extends React.Component<HomeProps, HomeState> {
  constructor(props: HomeProps) {
    super(props);
  }

  render() {
    return (
      <div className="home">
        <Box className="home-header"
          sx={{
            backgroundColor: "primary.main",
          }}
        >
          <h1>RetroNP</h1>
          <p>Retrosynthetic Planning for Natural Products</p>
        </Box>
        <div className="home-modules">
          <Button
            className="home-module-card"
            component={RouterLink}
            to="/modules/chem"
          >
            Chem Module
          </Button>
          <Button
            className="home-module-card"
            component={RouterLink}
            to="/modules/bio"
          >
            Bio Module
          </Button>
        </div>
      </div>
    );
  }
}
