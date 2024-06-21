import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";

const useStyles = makeStyles((theme) => ({
    root: {
        marginBottom: 10
    },
    menuButton: {
        marginRight: theme.spacing(2)
    },
    title: {
        flexGrow: 1
    }
}));

function Header(props) {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <AppBar position="static" style={{ background: "#e0e0e0" }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        className={classes.menuButton}
                        style={{ color: "black" }}
                        aria-label="menu"
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        className={classes.title}
                        style={{ color: "black" }}
                    >
                        RepGraph
                    </Typography>
                </Toolbar>
            </AppBar>
        </div>
    );
}
export default Header;
