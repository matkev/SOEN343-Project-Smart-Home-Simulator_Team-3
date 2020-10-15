import React from 'react';
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar/AppBar";
import useStyle from './styles'
import Button from "@material-ui/core/Button";
import {Link} from "react-router-dom";

const Header = () => {
  const classes = useStyle();
  const logoutClick = () => {
    localStorage.clear();
    window.location.reload();
  };
  return (
    <AppBar className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <Link to={"/"}><Typography>Soen 343</Typography></Link>
        <Button size={'small'} className={classes.logoutBtn} onClick={logoutClick}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;