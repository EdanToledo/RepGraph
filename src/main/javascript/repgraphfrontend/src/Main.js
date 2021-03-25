import React, {useContext} from "react";
import {
    Card,
    Grid,
    Paper,
    Typography,
    CardContent,
    CardActions,
    Switch
} from "@material-ui/core";

import {makeStyles, useTheme} from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import CssBaseline from "@material-ui/core/CssBaseline";
import {Button} from "@material-ui/core";
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import MenuItem from '@material-ui/core/MenuItem';

import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

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
import {TextField} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import {Link, useHistory} from "react-router-dom";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import ToggleButton from "@material-ui/lab/ToggleButton";
import MuiAlert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import Box from "@material-ui/core/Box";
import Fab from "@material-ui/core/Fab";
import Popover from "@material-ui/core/Popover";

import {Graph} from "./Components/Graph/Graph";
import {determineAdjacentLinks, layoutHierarchy} from "./LayoutAlgorithms/layoutHierarchy";
import {layoutTree} from "./LayoutAlgorithms/layoutTree";
import {layoutFlat} from "./LayoutAlgorithms/layoutFlat";

const drawerWidth = 240;

//Styles for the app bar and menu drawer of the application
const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex"
    },
    appBar: {},
    menuButton: {
        marginRight: 25,
        marginLeft: 25
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
        minHeight: 90,
        alignItems: 'center',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
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
    }


}));

const width = "95vw";
const height = "100%";

export default function Main() {
    const {state, dispatch} = useContext(AppContext); //Provide access to global state
    const classes = useStyles(); //Use styles created above
    const theme = useTheme();
    const history = useHistory(); //Provide access to router history
    const [sentenceOpen, setSentenceOpen] = React.useState(false); //Local state of select sentence dialog
    const [dataSetResponseOpen, setDataSetResponseOpen] = React.useState(true); //Local state for upload dataset alert
    const [parserResponseOpen, setParserResponseOpen] = React.useState(false); //Local state for parser alert
    const [analysisToolsOpen, setAnalysisToolsOpen] = React.useState(false); //Local state for analysis tools drawer
    const [anchorEl, setAnchorEl] = React.useState(null); //Anchor state for popover graph legend
    const [sentence, setSentence] = React.useState("");
    const [anchorSen, setAnchorSen] = React.useState(null);

    //Determine graphFormatCode
    let graphFormatCode = null;
    switch (state.visualisationFormat) {
        case "1":
            graphFormatCode = "hierarchical";
            break;
        case "2":
            graphFormatCode = "tree";
            break;
        case "3":
            graphFormatCode = "flat";
            break;
        default:
            graphFormatCode = "hierarchical";
            break;
    }


    //Handle close of the alert shown after data-set upload
    const handleDataSetResponseClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setDataSetResponseOpen(false);
    };

    const handleParserResponseClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setParserResponseOpen(false);
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
            
            //Update the currently displayed graph as well
            if (state.selectedSentenceID !== null) {
                let myHeaders = new Headers();
                myHeaders.append("X-USER", state.userID);
                let requestOptions = {
                    method: 'GET',
                    headers : myHeaders,
                    redirect: 'follow'
                };

                dispatch({type: "SET_LOADING", payload: {isLoading: true}}); //Show loading animation

                let graphData = null;
                switch (newFormat) {
                    case "1":
                        graphData = layoutHierarchy(state.selectedSentenceGraphData);
                        break;
                    case "2":
                        graphData = layoutTree(state.selectedSentenceGraphData);
                        break;
                    case "3":
                        graphData = layoutFlat(state.selectedSentenceGraphData);
                        break;
                    default:
                        graphData = layoutHierarchy(state.selectedSentenceGraphData);
                        break;
                }

                

                dispatch({type: "SET_SENTENCE_VISUALISATION", payload: {selectedSentenceVisualisation: graphData}});
                dispatch({type: "SET_LOADING", payload: {isLoading: false}});
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

    //Function to handle click on graph legend button
    const handleClickSentenceParse = (event) => {
        setAnchorSen(event.currentTarget);
    };

    //Functions to handle close of graph legend
    const handleCloseSentenceParse = () => {
        setAnchorSen(null);
    };

    const legendOpen = Boolean(anchorEl); //State of graph legend
    const senOpen = Boolean(anchorSen);

    function parseSentence() {
        let myHeaders = new Headers();
        myHeaders.append("X-USER", state.userID);
        let requestOptions = {
            method: 'GET',
            headers : myHeaders,
            redirect: 'follow'
        };

        fetch(state.APIendpoint + "/ParseSentence?sentence=" + sentence + "&format=" + state.visualisationFormat, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw "Response not OK";
                }
                return response.text();
            })
            .then(result => {
                const jsonResult = JSON.parse(result);
                 //Debugging
                if (!jsonResult.hasOwnProperty('Error')) {


                    dispatch({
                        type: "SET_SENTENCE_VISUALISATION",
                        payload: {selectedSentenceVisualisation: jsonResult}
                    }); //Set global state for visualisation

                    dispatch({
                        type: "SET_SELECTED_SENTENCE_ID",
                        payload: {selectedSentenceID: jsonResult.id}
                    });
                    dispatch({type: "SET_TEST_RESULTS", payload: {testResults: null}});
                    dispatch({type: "SET_LOADING", payload: {isLoading: false}}); //Stop loading animation
                } else {
                    dispatch({
                        type: "SET_PARSER_RESPONSE",
                        payload: {parserResponse: jsonResult.Error}
                    });
                    setParserResponseOpen(true);
                }
            })
            .catch(error => {
                dispatch({type: "SET_LOADING", payload: {isLoading: false}}); //Stop loading animation
                 //Debugging
                history.push("/404"); //Send user to error page
            });

        fetch(state.APIendpoint + "/ReturnModelList", requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw "Response not OK";
                }
                return response.text();
            })
            .then(result => {
                const jsonResult = JSON.parse(result);

                dispatch({
                    type: "SET_DATASET",
                    payload: {dataSet: jsonResult}
                }); //Set global state for visualisation


                dispatch({type: "SET_LOADING", payload: {isLoading: false}}); //Stop loading animation
            })
            .catch(error => {
                dispatch({type: "SET_LOADING", payload: {isLoading: false}}); //Stop loading animation
                 //Debugging
                history.push("/404"); //Send user to error page
            });

    }

    return (

        <Grid
            container
            direction="column"
            justify="center"
            alignItems="center">
            <CssBaseline/>

            <Grid item style={{width: "100%"}}>
                <AppBar position="static" color={"secondary"}>
                    <Toolbar className={classes.toolbar}>
                        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                            <MenuIcon/>
                        </IconButton>
                        <Typography variant="h4" color={"textPrimary"} style={{fontWeight: 700}}>
                            RepGraph
                        </Typography>

                        <Grid className={classes.menuButton}>

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
                                                    <Chip label="AbstractNode" style={{
                                                        color: "white",
                                                        fontWeight: "bold",
                                                        backgroundColor: state.visualisationOptions.groups.node.color
                                                    }}/>
                                                </Grid>
                                                <Grid item>
                                                    <Chip label="SurfaceNode" style={{
                                                        color: "white",
                                                        fontWeight: "bold",
                                                        backgroundColor: state.visualisationOptions.groups.surfaceNode.color
                                                    }}/>
                                                </Grid>
                                                <Grid item>
                                                    <Chip label="Token" style={{
                                                        color: "white",
                                                        fontWeight: "bold",
                                                        backgroundColor: state.visualisationOptions.groups.token.color
                                                    }}/>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Popover>
                            </div>
                        </Grid>

                        <Grid className={classes.menuButton}>
                            <Tooltip arrow
                                     title={"Select visualisation format"}>
                                <ToggleButtonGroup
                                    value={state.visualisationFormat}
                                    exclusive
                                    onChange={handleChangeVisualisationFormat}
                                    aria-label="Visualisation formats"


                                >
                                    <ToggleButton value="1" aria-label="Hierarchical">
                                        <Typography color={ "textPrimary" }>Hierarchical</Typography>
                                    </ToggleButton>
                                    <ToggleButton value="2" aria-label="Tree-like">
                                        <Typography color={ "textPrimary"}>Tree-like</Typography>
                                    </ToggleButton>
                                    <ToggleButton value="3" aria-label="Flat">
                                        <Typography color={"textPrimary"}>Flat</Typography>
                                    </ToggleButton>
                                </ToggleButtonGroup>

                            </Tooltip>
                        </Grid>

                        <Grid>
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
                        <Grid className={classes.menuButton}>
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
                        <Typography color={ "textPrimary"}>Dark</Typography>
                    </Toolbar>

                </AppBar>
                <AppBar position="fixed" className={classes.bottomAppBar} color="secondary">
                    <Toolbar>
                        <Fab color="primary" aria-label="add" variant="extended" className={classes.fabButton}
                             onClick={() => setAnalysisToolsOpen(true)}>
                            Show Analysis Tools <ExpandLessIcon/>
                        </Fab>
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
            <Snackbar open={parserResponseOpen} autoHideDuration={6000}
                      onClose={handleParserResponseClose}>
                <MuiAlert elevation={6} variant="filled" onClose={handleParserResponseClose}
                          severity={"warning"}>
                    {state.parserResponse === "Parser Error" ? "The parser encountered an error - Please enter a different sentence" : ""}
                </MuiAlert>
            </Snackbar>
            <Grid item container style={{width: "100%", flexGrow: "1", padding: "10px", border:"0px solid red"}}>
                {state.selectedSentenceID === null ? (
                    <Grid item style={{height: "100%", width: "100%"}}>
                        <Card variant="outlined" style={{height: "100%"}}>
                            <CardContent style={{height: "100%"}}>
                                <Grid container direction="row" alignItems="center" justify="center">
                                    <Grid item>
                                        {
                                            state.dataSet === null ? <Typography variant="subtitle1">Please
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
                             <Graph
                                width={width}
                                height={height}
                                graph={state.selectedSentenceVisualisation}
                                adjacentLinks={determineAdjacentLinks(state.selectedSentenceVisualisation)}
                                graphFormatCode={graphFormatCode}
                            />
                    </div>
                )}
            </Grid>
        </Grid>
    );
}