import React, { useState, useEffect, useContext } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import MobileStepper from "@material-ui/core/MobileStepper";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import SwipeableViews from "react-swipeable-views";
import { autoPlay } from "react-swipeable-views-utils";

import { AppContext } from "../../Store/AppContextProvider";
import { cloneDeep } from "lodash";
import {ParentSize} from "@visx/responsive";
import {determineAdjacentLinks} from "../../LayoutAlgorithms/layoutHierarchy";

import {Graph} from "../Graph/Graph";

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);


const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: "100%",
        flexGrow: 1
    },
    header: {
        display: "flex",
        alignItems: "center",
        height: 50,
        paddingLeft: theme.spacing(4),
        backgroundColor: theme.palette.background.default
    },
    body: {
        height: "60vh",
        display: "block",
        maxWidth: "100%",
        overflow: "hidden",
        width: "100%"
    },
    graphDiv: {
        height: "100%",
        //border: "1px solid red",
        flex: "1",
        width: "100%"
    }
}));

// function showLongestPath(standardVisualisation, path) {
//     let currentStandardVisualisation = cloneDeep(standardVisualisation);
//     //
//     let newNodes = currentStandardVisualisation.nodes.map((node, index) => ({
//         ...node,
//         label: path.includes(node.id)
//             ? path.findIndex((nodeID) => nodeID === node.id) + " " + node.label
//             : node.label,
//         group: path.includes(node.id) ? "longestPath" : node.group
//     }));
//
//     for (let index = 0; index < path.length - 1; index++) {
//         for (const [i, e] of currentStandardVisualisation.edges.entries()) {
//             if (
//                 (path[index] === e.from && path[index + 1] === e.to) ||
//                 (path[index] === e.to && path[index + 1] === e.from)
//             ) {
//                 currentStandardVisualisation.edges[i] = {
//                     ...e,
//                     color: "rgba(0, 0, 0, 1)",
//                     shadow: true,
//                     background: {
//                         enabled: true,
//                         color: "rgba(245, 0, 87, 0.7)"
//                     }
//                 };
//             }
//         }
//     }
//
//     return {...currentStandardVisualisation, nodes: newNodes};
// }

function showLongestPath(standardVisualisation, path) {
    let currentStandardVisualisation = cloneDeep(standardVisualisation);
    //

    let newNodes = currentStandardVisualisation.nodes.map((node, index) => ({
        ...node,
        label: path.includes(node.id)
            ? path.findIndex((nodeID) => nodeID === node.id) + " " + node.label
            : node.label,
        group: path.includes(node.id) ? "longestPath" : node.group
    }));

    let newLinks = currentStandardVisualisation.links.map((link) => ({
        ...link,
        group:
            path.includes(link.source.id) && path.includes(link.target.id) && (Math.abs(path.indexOf(link.source.id) - path.indexOf(link.target.id)) === 1)
                ? "longestPath"
                : link.group
    }));
    return {...currentStandardVisualisation, nodes: newNodes, links: newLinks};
}

function LongestPathVisualisation({type}) {
    const classes = useStyles();
    const theme = useTheme();
    const {state, dispatch} = useContext(AppContext);
    const [activeStep, setActiveStep] = React.useState(0);
    //const maxSteps = tutorialSteps.length;
    const maxSteps = state.testResults[type].length;

    //Determine graphFormatCode
    let graphFormatCode = null;
    switch (state.visualisationFormat) {
        case "1":
            graphFormatCode = "hierarchicalLongestPath";
            break;
        case "2":
            graphFormatCode = "treeLongestPath";
            break;
        case "3":
            graphFormatCode = "flatLongestPath";
            break;
        default:
            graphFormatCode = "hierarchicalLongestPath";
            break;
    }

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleStepChange = (step) => {
        setActiveStep(step);
    };

    // const events = {
    //     select: function (event) {
    //         let { nodes, edges } = event;
    //
    //         dispatch({
    //             type: "SET_SELECT_NODE_EDGE",
    //             payload: { selectedNodeAndEdges: { nodes, edges } }
    //         });
    //     }
    // };

    return (
        <div className={classes.root}>
            <Paper square elevation={0} className={classes.header}>
                <Typography>
                    {"The path is (in terms of Node IDs): " + state.testResults[type][activeStep].join(" -> ")}
                </Typography>
            </Paper>
            <AutoPlaySwipeableViews
                axis={theme.direction === "rtl" ? "x-reverse" : "x"}
                index={activeStep}
                onChangeIndex={handleStepChange}
                autoplay={false}
            >
                {state.testResults[type].map((path, index) => (
                    <div className={classes.body} key={index}>
                        {Math.abs(activeStep - index) <= 2 ? (
                            // <Graph
                            //     graph={showLongestPath(
                            //         state.selectedSentenceVisualisation,
                            //         path
                            //     )} //Modified current visualisation with longest path highlighted
                            //     options={{
                            //         ...state.visualisationOptions,
                            //         edges: {
                            //             ...state.visualisationOptions.edges,
                            //             color: state.darkMode ? state.visualisationOptions.darkMode.edgeColor : state.visualisationOptions.edges.color,
                            //         }
                            //     }} //Options from global state
                            //     events={events}
                            //     style={{ width: "100%", height: "100%" }}
                            //     getNetwork={(network) => {
                            //         //  if you want access to vis.js network api you can set the state in a parent component using this property
                            //     }}
                            // />
                            <div className={classes.graphDiv}>
                                <ParentSize>
                                    {parent => (
                                        <Graph
                                            width={parent.width}
                                            height={parent.height}
                                            graph={showLongestPath(
                                                        state.selectedSentenceVisualisation,
                                                        path
                                                    )}
                                            adjacentLinks={determineAdjacentLinks(state.selectedSentenceVisualisation)}
                                            graphFormatCode={graphFormatCode}
                                        />
                                    )}
                                </ParentSize>
                            </div>
                        ) : null}
                    </div>
                ))}
            </AutoPlaySwipeableViews>
            <MobileStepper
                steps={maxSteps}
                position="static"
                variant="text"
                activeStep={activeStep}
                nextButton={
                    <Button
                        size="small"
                        onClick={handleNext}
                        disabled={activeStep === maxSteps - 1}
                        color="primary"
                        variant="contained"
                        disableElevation
                    >
                        Next
                        {theme.direction === "rtl" ? (
                            <KeyboardArrowLeft />
                        ) : (
                            <KeyboardArrowRight />
                        )}
                    </Button>
                }
                backButton={
                    <Button size="small" onClick={handleBack} disabled={activeStep === 0} color="primary" variant="contained" disableElevation>
                        {theme.direction === "rtl" ? (
                            <KeyboardArrowRight />
                        ) : (
                            <KeyboardArrowLeft />
                        )}
                        Back
                    </Button>
                }
            />
        </div>
    );
}

export default LongestPathVisualisation;
