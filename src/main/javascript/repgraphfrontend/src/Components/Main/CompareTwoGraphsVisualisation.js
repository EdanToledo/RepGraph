import React, {useState, useEffect, useContext} from "react";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import {AppContext} from "../../Store/AppContextProvider";
import {cloneDeep} from "lodash";
import {Graph} from "../Graph/Graph";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";

import {Chip} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";

import ListItem from "@material-ui/core/ListItem";
import FormGroup from '@material-ui/core/FormGroup';
import Divider from "@material-ui/core/Divider";
import {Virtuoso} from "react-virtuoso";
import {Link, useHistory} from "react-router-dom";
import TextField from "@material-ui/core/TextField/TextField";
import {determineAdjacentLinks, layoutHierarchy} from "../../LayoutAlgorithms/layoutHierarchy";
import {layoutTree} from "../../LayoutAlgorithms/layoutTree";
import {layoutFlat} from "../../LayoutAlgorithms/layoutFlat";
import {ParentSize} from "@visx/responsive";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import EditIcon from '@material-ui/icons/Edit';


const useStyles = makeStyles((theme) => ({
    root: {
        // maxWidth: "100%",
        // height: "100%",
    },
    header: {
        display: "flex",
        alignItems: "center",
        height: 50,
        paddingLeft: theme.spacing(4),
        backgroundColor: theme.palette.background.default
    },
    body: {
        width: "100%",
        height: "100%",
        display: "block",
        // border: "1px solid red"
    },
    graphDiv: {
        height: "100%",
        //border: "1px solid red",
        flex: "1",
        width: "100%"
    }
}));

const updateCompareGroups = (standardVisualisation, similarNodes, similarEdges) => {
    let currentStandardVisualisation = cloneDeep(standardVisualisation);

    let newNodes = currentStandardVisualisation.nodes.map(node =>({
        ...node,
        group: similarNodes.includes(node.id) && node.type === "node" ? "similar" : node.type === "node" ? "dissimilar" : node.group
    }))

    let newLinks = currentStandardVisualisation.links.map(link =>({
        ...link,
        group: similarEdges.includes(link.id) && link.type === "link" ? "similar" : link.type === "link" ? "dissimilar" : link.group
    }))

    return { ...currentStandardVisualisation, nodes: newNodes, links: newLinks };
}

function CompareTwoGraphsVisualisation(props) {
    const classes = useStyles();
    const {state, dispatch} = useContext(AppContext);
    const history = useHistory();

    const [sentence1, setSentence1] = React.useState(null); //Sentence 1 ID
    const [sentence1GraphData, setSentence1GraphData] = React.useState(null); //Sentence 1 Graph Data response
    const [sentence2, setSentence2] = React.useState(null); //Sentence 2 ID
    const [sentence2GraphData, setSentence2GraphData] = React.useState(null); //Sentence 2 Graph Data response
  
    const [open, setOpen] = React.useState(false); //Select sentence dialog open
    const [selectSide, setSelectSide] = React.useState(null); //Current side selection

    const [compareResponse, setCompareResponse] = useState(null); //Compare response result
    const [showCompare, setShowCompare] = useState(false); //Boolean to determine whether the comparison results can be shown

    const [strict, setStrict] = React.useState(false);
    const [noSurface, setNoSurface] = React.useState(false);
    const [noAbstract, setNoAbstract] = React.useState(false);

    function handleStrictSwitch(){
        setStrict(!strict)
    };
    function handleNoSurfaceSwitch(){
        setNoSurface(!noSurface)
    };
    function handleNoAbstractSwitch(){
        setNoAbstract(!noAbstract)
    };

    //Determine graphFormatCode
    let graphFormatCode = null;
    switch (state.visualisationFormat) {
        case "1":
            graphFormatCode = showCompare ? "hierarchicalCompare" : "hierarchical";
            break;
        case "2":
            graphFormatCode = showCompare ? "treeCompare" : "tree";
            break;
        case "3":
            graphFormatCode = showCompare ? "flatCompare" : "flat";
            break;
        default:
            graphFormatCode = showCompare ? "hierarchicalCompare" : "hierarchical";
            break;
    }

    function handleSelectSide(side) {
        //Need to request visualisation from backend and store result
        setSelectSide(side);
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
    }

    function handleCompareClick(){

        let myHeaders = new Headers();
        myHeaders.append("X-USER", state.userID);

        let requestOptions = {
            method: 'GET',
            headers : myHeaders,
            redirect: 'follow'
        };

        fetch(state.APIendpoint +"/CompareGraphs?graphID1="+sentence1+"&graphID2="+sentence2+"&strict="+strict+"&noAbstract="+noAbstract+"&"+"noSurface="+noSurface, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw "Response not OK";
                }
                return response.text();
            })
            .then(result => {
                const jsonResult = JSON.parse(result);
                 //debugging

                setCompareResponse(jsonResult);
                setShowCompare(true);

            })
            .catch(error => {
                dispatch({type: "SET_LOADING", payload: {isLoading: false}});
                console.log("error", error);
                history.push("/404"); //for debugging
            });

    }

    function getGraph(spacing, selectSide){
        if (selectSide === 1) {
            let graphData = null;

            switch (state.visualisationFormat) {
                case "1":
                    graphData = showCompare ? updateCompareGroups(layoutHierarchy(sentence1GraphData, state.graphLayoutSpacing, state.framework), compareResponse.SimilarNodes1, compareResponse.SimilarEdges1) : layoutHierarchy(sentence1GraphData, state.graphLayoutSpacing, state.framework);
                    break;
                case "2":
                    graphData = showCompare ? updateCompareGroups(layoutTree(sentence1GraphData, state.graphLayoutSpacing, state.framework), compareResponse.SimilarNodes1, compareResponse.SimilarEdges1) : layoutTree(sentence1GraphData, state.graphLayoutSpacing, state.framework);
                    break;
                case "3":
                    graphData = showCompare ? updateCompareGroups(layoutFlat(sentence1GraphData,false, state.graphLayoutSpacing, state.framework), compareResponse.SimilarNodes1, compareResponse.SimilarEdges1) : layoutFlat(sentence1GraphData,false, state.graphLayoutSpacing, state.framework);
                    break;
                default:
                    graphData = showCompare ? updateCompareGroups(layoutHierarchy(sentence1GraphData, state.graphLayoutSpacing, state.framework), compareResponse.SimilarNodes1, compareResponse.SimilarEdges1) : layoutHierarchy(sentence1GraphData, state.graphLayoutSpacing, state.framework);
                    break;
            }

            return graphData
        }else{
            let graphData = null;

            switch (state.visualisationFormat) {
                case "1":
                    graphData = showCompare ? updateCompareGroups(layoutHierarchy(sentence2GraphData, state.graphLayoutSpacing, state.framework), compareResponse.SimilarNodes2, compareResponse.SimilarEdges2) : layoutHierarchy(sentence2GraphData, state.graphLayoutSpacing, state.framework);
                    break;
                case "2":
                    graphData = showCompare ? updateCompareGroups(layoutTree(sentence2GraphData, state.graphLayoutSpacing, state.framework), compareResponse.SimilarNodes2, compareResponse.SimilarEdges2) : layoutTree(sentence2GraphData, state.graphLayoutSpacing, state.framework);
                    break;
                case "3":
                    graphData = showCompare ? updateCompareGroups(layoutFlat(sentence2GraphData,false, state.graphLayoutSpacing, state.framework), compareResponse.SimilarNodes2, compareResponse.SimilarEdges2) : layoutFlat(sentence2GraphData,false, state.graphLayoutSpacing, state.framework);
                    break;
                default:
                    graphData = showCompare ? updateCompareGroups(layoutHierarchy(sentence2GraphData, state.graphLayoutSpacing, state.framework), compareResponse.SimilarNodes2, compareResponse.SimilarEdges2) : layoutHierarchy(sentence2GraphData, state.graphLayoutSpacing, state.framework);
                    break;
            }

            return graphData
        }
    }

    //Component to let user select sentence from list of sentences uploaded in data-set
    function SelectSentenceList() {
        const {state, dispatch} = useContext(AppContext);
        const [currentLength, setCurrentLength] = React.useState(state.dataSet.length);
        const [currentDataSet, setCurrentDataSet] = React.useState(state.dataSet);
        const history = useHistory();

        function requestSentenceFromBackend(sentenceId){



            let myHeaders = new Headers();
            myHeaders.append("X-USER", state.userID);

            let requestOptions = {
                method: 'GET',
                headers : myHeaders,
                redirect: 'follow'
            };

            dispatch({type: "SET_LOADING", payload: {isLoading: true}});

            fetch(state.APIendpoint + "/GetGraph?graphID=" + sentenceId, requestOptions)
                .then((response) => {
                    if (!response.ok) {
                        throw "Response not OK";
                    }
                    return response.text();
                })
                .then((result) => {
                    const jsonResult = JSON.parse(result);


                    dispatch({type: "SET_LOADING", payload: {isLoading: false}});

                    if (selectSide === 1) {
                        setSentence1GraphData(jsonResult);
                    } else {
                        setSentence2GraphData(jsonResult);
                    }

                })
                .catch((error) => {
                    dispatch({type: "SET_LOADING", payload: {isLoading: false}});
                    console.log("error", error);
                    history.push("/404"); //for debugging
                });
        }

        function handleSelectSentence(sentenceId) {

            setOpen(false);
            setShowCompare(false);

            if (selectSide === 1) {
                setSentence1(sentenceId); //stores the id of the sentence selected for graph 1

                //Request visualisation from back-end
                requestSentenceFromBackend(sentenceId);

            } else {
                setSentence2(sentenceId); //stores the id of the sentence selected for graph 2

                //Request visualisation from back-end
                requestSentenceFromBackend(sentenceId);
            }
        }

        function search(value) {
            let found = [];
            for (let x of state.dataSet) {

                if (x.input.toLowerCase().trim().includes(value.toLowerCase().trim()) || x.id.includes(value.trim())) {
                    found.push(x);
                }
            }
            setCurrentLength(found.length);
            setCurrentDataSet(found);
        }
        return (
            <Grid item style={{width: "100%"}}>
                <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                    style={{width: "100%"}}
                >
                    <Grid item style={{width:"100%"}}>
                        <TextField id="outlined-basic"
                                   label="Search for a Sentence or ID"
                                   variant="outlined"
                                   fullWidth
                                   onChange={e => (search(e.target.value))}/>
                    </Grid>
                    <Grid item style={{width:"100%"}}>
                        {state.dataSet === null ? (
                            <div>No data-set has been uploaded yet</div>
                        ) : (
                            <Virtuoso
                                style={{width: "100%", height: "400px"}}
                                totalCount={currentLength}
                                item={(index) => {
                                    return (
                                        <ListItem
                                            button
                                            key={currentDataSet[index].id}
                                            onClick={() => handleSelectSentence(currentDataSet[index].id)}
                                        >
                                            <Typography>{currentDataSet[index].input}</Typography>
                                        </ListItem>
                                    );
                                }}
                                footer={() => (
                                    <div style={{padding: "1rem", textAlign: "center"}}>
                                        -- end of dataset --
                                    </div>
                                )}
                            />
                        )}
                    </Grid>
                <Divider/>
                </Grid>
            </Grid>
        );
    }

    return (
        <Grid className={classes.root}
              container
              direction="column"
              justify="center"
              alignItems="center"
              spacing={1}>
            <Grid item >
            <FormControlLabel control={<Switch
                color={"primary"}
                checked={strict}
                onChange={handleStrictSwitch}
                name="Strict"
            />} label="Strict Comparison"  />
            <FormControlLabel control={<Switch
                color={"primary"}
                checked={!noSurface}
                onChange={handleNoSurfaceSwitch}
                name="NoSurface"
            />} label="Match Surface Nodes"  />
            <FormControlLabel control={<Switch
                color={"primary"}
                checked={!noAbstract}
                onChange={handleNoAbstractSwitch}
                name="NoAbstract"
            />} label="Match Abstract Nodes"  />
        </Grid>
            <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
                spacing={1}
            >
                <Dialog
                    fullWidth
                    maxWidth="md"
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="select comparison sentence"
                >
                    <DialogTitle id="select-comparison-sentence-title">
                        Select Graph: {selectSide}
                    </DialogTitle>
                    <DialogContent>
                        <SelectSentenceList/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} variant="contained" color="primary" disableElevation>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
                <Grid container item xs={6} className={classes.body} spacing={1}>
                    <Grid
                        item
                        container
                        direction="column"
                        justify="center"
                        alignItems="center"
                    >
                        <Tooltip
                            arrow
                            title={sentence1 === null ? "Select Sentence" : "Change Sentence"}
                        >
                            <Chip
                                onClick={() => {

                                    //Show the dialog to select a sentence
                                    handleSelectSide(1);
                                }}
                                label={sentence1 === null ? "Select a Sentence" : sentence1}
                                icon={
                                    sentence1 === null ? <AddCircleOutlineIcon/> : <EditIcon/>
                                }
                            />
                        </Tooltip>
                    </Grid>
                    <Grid item style={{width: "100%", height: "50vh"}}>
                        {
                            sentence1GraphData === null ? <div>Please select a sentence</div> :

                                <div className={classes.graphDiv}>
                                    <ParentSize>
                                        {parent => (
                                            <Graph
                                                width={parent.width}
                                                height={parent.height}
                                                graph={getGraph(state.graphLayoutSpacing,1)}
                                                adjacentLinks={determineAdjacentLinks(getGraph(state.graphLayoutSpacing,1))}
                                                graphFormatCode={graphFormatCode}
                                            />
                                        )}
                                    </ParentSize>
                                </div>
                        }
                    </Grid>
                </Grid>
                <Grid container item xs={6} className={classes.body} spacing={1}>
                    <Grid
                        item
                        container
                        direction="column"
                        justify="center"
                        alignItems="center"
                    >
                        <Tooltip
                            arrow
                            title={sentence2 === null ? "Select Sentence" : "Change Sentence"}
                        >
                            <Chip
                                onClick={() => {

                                    //Show the dialog to select a sentence
                                    handleSelectSide(2);
                                }}
                                label={sentence2 === null ? "Select a Sentence" : sentence2}
                                icon={
                                    sentence2 === null ? <AddCircleOutlineIcon/> : <EditIcon/>
                                }
                            />
                        </Tooltip>
                    </Grid>
                    <Grid item style={{width: "100%", height: "50vh"}}>
                        {
                            sentence2GraphData === null ? <div>Please select a sentence</div> :

                                <div className={classes.graphDiv}>
                                    <ParentSize>
                                        {parent => (
                                            <Graph
                                                width={parent.width}
                                                height={parent.height}
                                                graph={getGraph(state.graphLayoutSpacing,2)}
                                                adjacentLinks={determineAdjacentLinks(getGraph(state.graphLayoutSpacing,2))}
                                                graphFormatCode={graphFormatCode}
                                            />
                                        )}
                                    </ParentSize>
                                </div>
                        }
                    </Grid>
                </Grid>
            </Grid>
            <Grid item>
                <Button variant="contained" color="primary" disableElevation endIcon={<CompareArrowsIcon/>} disabled={sentence1GraphData === null || sentence2GraphData === null} onClick={handleCompareClick}>
                    Compare
                </Button>
            </Grid>
        </Grid>


    );
}

export default CompareTwoGraphsVisualisation;
