import React, {useContext} from "react";
import {
    Card,
    Grid,
    Paper,
    Typography,
    CardContent,
    CardActions
} from "@material-ui/core";

import {makeStyles, useTheme} from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import CssBaseline from "@material-ui/core/CssBaseline";
import {Button} from "@material-ui/core";
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

import {AppContext} from "./Store/AppContextProvider.js";
import SentenceList from "./Components/Main/SentenceList.js";
import AnalysisAccordion from "./Components/Main/AnalysisAccordion";
import GraphVisualisation from "./Components/Main/GraphVisualisation";
import "./Components/Main/network.css";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import BuildIcon from '@material-ui/icons/Build';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import {Chip} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import {Link, useHistory} from "react-router-dom";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import ToggleButton from "@material-ui/lab/ToggleButton";
import MuiAlert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import Box from "@material-ui/core/Box";
import Fab from "@material-ui/core/Fab";
import Popover from "@material-ui/core/Popover";

const drawerWidth = 240;

//Styles for the app bar and menu drawer of the application
const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex"
    },
    appBar: {},
    menuButton: {
        marginRight: 36
    },
    hide: {
        display: "none"
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: "nowrap"
    },
    toolbar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar
    },
    content: {
        padding: theme.spacing(3)
    },
    bottomAppBar: {
        top: 'auto',
        bottom: 0,
    },
    fabButton: {
        margin: '0 auto',
    },
}));

export default function Main() {
    const {state, dispatch} = useContext(AppContext); //Provide access to global state
    const classes = useStyles(); //Use styles created above
    const theme = useTheme();
    const history = useHistory(); //Provide access to router history
    const [sentenceOpen, setSentenceOpen] = React.useState(false); //Local state of select sentence dialog
    const [dataSetResponseOpen, setDataSetResponseOpen] = React.useState(true); //Local state for upload dataset alert
    const [analysisToolsOpen, setAnalysisToolsOpen] = React.useState(false); //Local state for analysis tools drawer
    const [anchorEl, setAnchorEl] = React.useState(null); //Anchor state for popover graph legend

    //Handle close of the alert shown after data-set upload
    const handleDataSetResponseClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setDataSetResponseOpen(false);
    };

    //Handle click close select sentence dialog
    const handleSentenceClose = () => {
        setSentenceOpen(false);
    };

    //Handle click close select sentence dialog
    const handleAnalysisToolsClose = () => {
        setAnalysisToolsOpen(false);
    };

    //Handle change visualisation format setting in application app bar
    const handleChangeVisualisationFormat = (event, newFormat) => {
        //Enforce one format being selected at all times
        if (newFormat !== null) {
            dispatch({type: "SET_VISUALISATION_FORMAT", payload: {visualisationFormat: newFormat}}); //Set global state for visualisation format
            console.log(newFormat);
            //Update the currently displayed graph as well
            if (state.selectedSentenceID !== null) {
                let requestOptions = {
                    method: 'GET',
                    redirect: 'follow'
                };

                dispatch({type: "SET_LOADING", payload: {isLoading: true}}); //Show loading animation

                //Request new visualisation from backend
                fetch(state.APIendpoint + "/Visualise?graphID=" + state.selectedSentenceID + "&format=" + newFormat, requestOptions)
                    .then((response) => response.text())
                    .then((result) => {

                        const jsonResult = JSON.parse(result);
                        console.log(jsonResult); //Debugging

                        dispatch({
                            type: "SET_SENTENCE_VISUALISATION",
                            payload: {selectedSentenceVisualisation: jsonResult}
                        }); //Set global state for visualisation
                        dispatch({type: "SET_LOADING", payload: {isLoading: false}}); //Stop loading animation
                    })
                    .catch((error) => {
                        dispatch({type: "SET_LOADING", payload: {isLoading: false}}); //Stop loading animation
                        console.log("error", error); //Debugging
                        history.push("/404"); //Send user to error page
                    });
            }

        }
    }

    //Function to handle click on graph legend button
    const handleClickGraphLegend = (event) => {
        setAnchorEl(event.currentTarget);
    };

    //Functions to handle close of graph legend
    const handleCloseGraphLegend = () => {
        setAnchorEl(null);
    };

    const legendOpen = Boolean(anchorEl); //State of graph legend

    return (
        <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            style={{height: "100vh", width: "100vw"}}>
            <CssBaseline/>
            <Grid item style={{width: "100%", flexGrow: "0"}}>
                <Box
                    bgcolor="secondary.main"
                >
                    <Toolbar>
                        <Typography color="primary" variant="h5">
                            RepGraph
                        </Typography>
                        <Grid container justify="flex-end" spacing={2}>
                            <Grid item>
                                <div>
                                    <Fab color="primary" aria-label="add" variant="extended"
                                         className={classes.fabButton} onClick={handleClickGraphLegend}>
                                        Show Graph Legend
                                    </Fab>
                                    <Popover
                                        open={legendOpen}
                                        anchorEl={anchorEl}
                                        onClose={handleCloseGraphLegend}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'center',
                                        }}
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'center',
                                        }}
                                    >
                                        <Card>
                                            <CardContent>
                                                <Grid container spacing={1}>
                                                    <Grid item>
                                                        <Chip label="AbstractNode" style={{color:"white",fontWeight:"bold", backgroundColor:"rgba(0,172,237,1)"}}/>
                                                    </Grid>
                                                    <Grid item>
                                                        <Chip label="SurfaceNode" style={{color:"white",fontWeight:"bold", backgroundColor:"rgba(0,237,107,1)"}}/>
                                                    </Grid>
                                                    <Grid item>
                                                        <Chip label="Token" style={{color:"white",fontWeight:"bold", backgroundColor:"rgba(255,87,34,1)"}}/>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Popover>
                                </div>
                            </Grid>
                            <Grid item color="inherit">
                                <Tooltip arrow
                                         title={"Select visualisation format"}>
                                    <ToggleButtonGroup
                                        value={state.visualisationFormat}
                                        exclusive
                                        onChange={handleChangeVisualisationFormat}
                                        aria-label="Visualisation formats"
                                        color="primary"
                                    >
                                        <ToggleButton color="primary" value="1" aria-label="Hierarchical">
                                            <Typography color="primary">Hierarchical</Typography>
                                        </ToggleButton>
                                        <ToggleButton color="secondary" value="2" aria-label="Tree-like">
                                            <Typography color="primary">Tree-like</Typography>
                                        </ToggleButton>
                                        <ToggleButton color="secondary" value="3" aria-label="Flat">
                                            <Typography color="primary">Flat</Typography>
                                        </ToggleButton>
                                    </ToggleButtonGroup>

                                </Tooltip>
                            </Grid>
                            <Grid item>
                                <Tooltip arrow
                                         title={state.selectedSentenceID === null ? "Select Sentence" : "Change Sentence"}>
                                    <Fab color="primary" aria-label="add" variant="extended"
                                         className={classes.fabButton} onClick={() => {
                                        setSentenceOpen(true);
                                    }} disabled={state.dataSet === null}>
                                        {state.selectedSentenceID === null ? "No Sentence Selected" : state.selectedSentenceID} {state.selectedSentenceID === null ?
                                        <AddCircleOutlineIcon/> :
                                        <BuildIcon/>}
                                    </Fab>
                                </Tooltip>
                            </Grid>
                            <Grid item>
                                <Tooltip arrow
                                         title={state.dataSet === null ? "Upload data-set" : "Upload new data-set"}>
                                    <Fab color="primary" aria-label="add" variant="extended"
                                         className={classes.fabButton} onClick={() => {
                                        history.push("/");
                                    }}>
                                        {state.dataSet === null ? "No Data-set Uploaded" : state.dataSetFileName} {state.dataSet === null ?
                                        <CloudUploadIcon/> : <BuildIcon/>}
                                    </Fab>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </Box>
            </Grid>
            <Grid item container style={{width: "100%", flexGrow: "1", padding: "10px"}}>
                {state.selectedSentenceID === null ? (
                    <Grid item style={{height: "100%", width: "100%"}}>
                        <Card variant="outlined" style={{height: "100%"}}>
                            <CardContent style={{height: "100%"}}>
                                <Grid container direction="row" alignItems="center" justify="center">
                                    <Grid item>
                                        {
                                            state.dataSet === null? <Typography variant="subtitle1">Please
                                                upload a data-set</Typography> :
                                                <Typography variant="subtitle1">Please
                                                    select a sentence</Typography>
                                        }

                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                    </Grid>
                ) : (
                    <div style={{height: "80vh", width: "100vw"}}>
                        <GraphVisualisation/>
                    </div>
                )}
            </Grid>
            <Grid item style={{width: "100%", flexGrow: "0"}}>
                <AppBar position="fixed" className={classes.bottomAppBar} color="secondary">
                    <Toolbar>
                        <Fab color="primary" aria-label="add" variant="extended" className={classes.fabButton}
                             onClick={() => setAnalysisToolsOpen(true)}>
                            Show Analysis Tools <ExpandLessIcon/>
                        </Fab>
                        {/*<Button
                            color="primary"
                            variant="outlined"
                            endIcon={<ExpandLessIcon/>}
                            onClick={() => setAnalysisToolsOpen(true)}
                        >
                            Show Analysis Tools
                        </Button>*/}
                    </Toolbar>
                </AppBar>
            </Grid>
            <Dialog
                fullWidth
                maxWidth="md"
                open={sentenceOpen}
                onClose={handleSentenceClose}
            >
                <DialogTitle>
                    Select a sentence
                </DialogTitle>
                <DialogContent>
                    <SentenceList closeSelectSentence={handleSentenceClose}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSentenceClose}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Drawer anchor='bottom' open={analysisToolsOpen} onClose={handleAnalysisToolsClose}>
                <AnalysisAccordion/>
            </Drawer>
            <Snackbar open={dataSetResponseOpen && state.dataSet !== null} autoHideDuration={6000}
                      onClose={handleDataSetResponseClose}>
                <MuiAlert elevation={6} variant="filled" onClose={handleDataSetResponseClose}
                          severity={state.dataSetResponse === "Duplicates Found" ? "warning" : "success"}>
                    {state.dataSetResponse === "Duplicates Found" ? "Data-set contained duplicate IDs, which were removed." : state.dataSetResponse}
                </MuiAlert>
            </Snackbar>
        </Grid>
    );
}