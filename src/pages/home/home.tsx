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
import Divider from '@mui/material/Divider';
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
      <Box className="home">
        <Box className="home-header"
          sx={{
            backgroundColor: "primary.main",
          }}
        >
          <h1>RetroNP</h1>
          <p>Retrosynthetic Planning for Natural Products</p>
        </Box>
        <Box className="home-main">
          <Box className="home-section-title" sx={{color: "primary.main"}}>Modules</Box>
          <Divider />
          <Box className="home-modules">
            <Card className="home-module-card" sx={{ width: "100%" }}>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Chem
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This is chem module. [TODO]
                </Typography>
              </CardContent>
              <CardActions>
                <Button component={RouterLink} to="chem/interactive" sx={{ width: "100%" }}>Interactive</Button>
                <Button component={RouterLink} to="chem/automatic" sx={{ width: "100%" }}>Automatic</Button>
                <Button component={RouterLink} to="chem/interactive-test" sx={{ width: "100%" }}>Interactive Test</Button>
              </CardActions>
            </Card>
            <Card className="home-module-card" sx={{ width: "100%" }}>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Bio
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This is bio module. [TODO]
                </Typography>
              </CardContent>
              <CardActions>
                <Button component={RouterLink} to="bio/interactive" sx={{ width: "100%" }}>Interactive</Button>
                <Button component={RouterLink} to="bio/automatic" sx={{ width: "100%" }}>Automatic</Button>
              </CardActions>
            </Card>
          </Box>
        </Box>
      </Box>
    );
  }
}
