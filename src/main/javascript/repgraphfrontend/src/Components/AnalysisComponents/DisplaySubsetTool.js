import React, {useContext} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Button from "@material-ui/core/Button";
import LocationSearchingIcon from '@material-ui/icons/LocationSearching';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import {
    Typography
} from "@material-ui/core";

import {AppContext} from "../../Store/AppContextProvider.js";
import {useHistory} from "react-router-dom";
import Chip from "@material-ui/core/Chip";

import CardContent from "@material-ui/core/CardContent";

import {Graph} from "../Graph/Graph";
import {determineAdjacentLinks, layoutHierarchy} from "../../LayoutAlgorithms/layoutHierarchy";
import {layoutTree} from "../../LayoutAlgorithms/layoutTree";
import {layoutFlat} from "../../LayoutAlgorithms/layoutFlat";
import {ParentSize} from "@visx/responsive";

const useStyles = makeStyles((theme) => ({
    root: {
        height: "100%",
        width: "100%",
    },
    graphDiv: {
        height: "100%",
        //border: "1px solid red",
        flex: "1",
        width: "100%"
    }
}));

function DisplaySubsetTool(props) {
    const {state, dispatch} = useContext(AppContext); //Provide access to global state
    const [subsetResponse, setSubsetResponse] = React.useState(null); //Store selected subset response in local state

    const history = useHistory(); //Use history for page routing

    const [open, setOpen] = React.useState(false); //Store local state for whether dialog is open or not
    const [resultOpen, setResultOpen] = React.useState(false); //Store local state for whether result dialog is open or not

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

    //Handle click open for first dialog to select subset
    const handleClickOpen = () => {
        setOpen(true);
    };

    //Reset selected property of nodes in global state
    const resetSelectedNode = () => {
        const resetNodes = state.selectedSentenceVisualisation.nodes.map(oldNode => ({
            ...oldNode,
            selected: false
        }));
        dispatch({
            type: "SET_SENTENCE_VISUALISATION",
            payload: {selectedSentenceVisualisation: {...state.selectedSentenceVisualisation, nodes: resetNodes}}
        });
    };

    //Handle close for first dialog to select subset
    const handleClose = () => {
        setOpen(false);

        //Reset selected node
        resetSelectedNode();
    };

    //handle close for second dialog to display subset result
    const handleResultClose = () => {
        setResultOpen(false);
    };

    const [subsetType, setSubsetType] = React.useState('adjacent'); //Store subset type in local state

    //Handle change of selected subset type
    const handleChange = (event) => {
        setSubsetType(event.target.value);
    };

    const classes = useStyles();

    function handleDisplaySubset() {
        setOpen(false);

        let myHeaders = new Headers();
        myHeaders.append("X-USER", state.userID);
        let requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        dispatch({type: "SET_LOADING", payload: {isLoading: true}}); //Show loading animation

        //Request subset from backend
        fetch(state.APIendpoint + "/GetSubset?graphID=" + state.selectedSentenceID + "&NodeID=" + getSelectedNodeID() + "&SubsetType=" + subsetType, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw "Response not OK";
                }
                return response.text();
            })
            .then((result) => {
                const jsonResult = JSON.parse(result); //Parse response into JSON


                let graphData = null;

                switch (state.visualisationFormat) {
                    case "1":
                        graphData = layoutHierarchy(jsonResult, state.graphLayoutSpacing, state.framework);
                        break;
                    case "2":
                        graphData = layoutTree(jsonResult, state.graphLayoutSpacing, state.framework);
                        break;
                    case "3":
                        graphData = layoutFlat(jsonResult, false, state.graphLayoutSpacing, state.framework);
                        break;
                    default:
                        graphData = layoutHierarchy(jsonResult, state.graphLayoutSpacing, state.framework);
                        break;
                }

                resetSelectedNode();
                setSubsetResponse(graphData); //Store the response in local state
                setResultOpen(true); //Show the result in dialog

                dispatch({type: "SET_LOADING", payload: {isLoading: false}}); //Stop the loading animation

            })
            .catch((error) => {
                dispatch({type: "SET_LOADING", payload: {isLoading: false}}); //Stop the loading animation
                console.log("error", error); //Log the error
                history.push("/404"); //Take user to error page
            });
    }

    const events = {
        select: "subset"
    }

    function getSelectedNodeLabel() {

        let selectedNode = null;

        if (state.selectedSentenceID) {
            selectedNode = state.selectedSentenceVisualisation.nodes.find(node => node.selected === true);
        }

        if (selectedNode) { //User has selected a node
            return selectedNode.label;
        } else { //User has not selected a node
            return "No node selected";
        }
    }

    const getSelectedNodeID = () => {

        let selectedNode = null;

        if (state.selectedSentenceID) {
            selectedNode = state.selectedSentenceVisualisation.nodes.find(node => node.selected === true);
        }

        if (selectedNode) {
            return selectedNode.id;
        } else {
            return null;
        }
    }

    return (
        <CardContent>
            <FormLabel><Typography color={"textPrimary"}>Select Type of Subgraph</Typography></FormLabel>
            <RadioGroup aria-label="subset-type" name="subset" value={subsetType} onChange={handleChange}>
                <FormControlLabel value="adjacent" control={<Radio/>}
                                  label={<Typography color={"textPrimary"}> Display Adjacent Nodes</Typography>}/>
                <FormControlLabel value="descendent" control={<Radio color="secondary"/>}
                                  label={<Typography color={"textPrimary"}> Display Descendent Nodes</Typography>}/>
            </RadioGroup>
            <Button
                variant="contained" color="primary" disableElevation onClick={handleClickOpen}
                endIcon={<LocationSearchingIcon/>}
                disabled={state.selectedSentenceID === null}
            >
                Select Node
            </Button>
            <Dialog
                open={open}
                fullWidth={true}
                maxWidth="xl"
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Select a node on the graph:"}
                    <Chip style={{marginLeft: "10px", marginRight: "10px"}}
                          label={`Selected Node: ${getSelectedNodeLabel()}`}
                    />

                </DialogTitle>
                <DialogContent style={{height: "80vh"}}>
                    {state.selectedSentenceID === null ? (
                        <div>Select a sentence first.</div>
                    ) : (
                        <div className={classes.graphDiv}>
                            <ParentSize>
                                {parent => (
                                    <Graph
                                        width={parent.width}
                                        height={parent.height}
                                        graph={state.selectedSentenceVisualisation}
                                        adjacentLinks={determineAdjacentLinks(state.selectedSentenceVisualisation)}
                                        graphFormatCode={graphFormatCode}
                                        events={events}
                                    />
                                )}
                            </ParentSize>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDisplaySubset} variant="contained" color="primary" disableElevation autoFocus
                            disabled={getSelectedNodeID() === null ? true : false}>
                        Display
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={resultOpen}
                fullWidth={true}
                maxWidth="xl"
                onClose={handleResultClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Subgraph Result"}</DialogTitle>
                <DialogContent style={{height: "80vh"}}>
                    {subsetResponse === null ? (
                        <div>No result to display</div>
                    ) : (
                        <div className={classes.graphDiv}>
                            <ParentSize>
                                {parent => (
                                    <Graph
                                        width={parent.width}
                                        height={parent.height}
                                        graph={subsetResponse}
                                        adjacentLinks={determineAdjacentLinks(subsetResponse)}
                                        graphFormatCode={graphFormatCode}
                                    />
                                )}
                            </ParentSize>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleResultClose} color="primary" variant="contained" disableElevation autoFocus>
                        close
                    </Button>
                </DialogActions>
            </Dialog>
        </CardContent>
    );

}

export default DisplaySubsetTool;
