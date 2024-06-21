import React, {useContext, useState, useRef, useEffect} from "react";
import {Zoom} from "@visx/zoom";
import {RectClipPath} from "@visx/clip-path";
import {localPoint} from "@visx/event";
import {layoutHierarchy} from "../../LayoutAlgorithms/layoutHierarchy";
import {layoutTree} from "../../LayoutAlgorithms/layoutTree";
import {layoutFlat} from "../../LayoutAlgorithms/layoutFlat";
import {AppContext, defaultGraphLayoutSpacing} from "../../Store/AppContextProvider";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import {positions} from '@material-ui/system';
import Box from "@material-ui/core/Box";

import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import CenterFocusStrongIcon from '@material-ui/icons/CenterFocusStrong';

import GraphLegend from "./Legend";
import Tooltip from "@material-ui/core/Tooltip";


const initialTransform = {
    scaleX: 1 / 4,
    scaleY: 1 / 4,
    translateX: 200,
    translateY: 200,
    skewX: 0,
    skewY: 0
};

const ZoomPortal = (props) => {
    const {width, height, backgroundColour, graphFormatCode, graphHeight, graphWidth} = props;
    const {state, dispatch} = useContext(AppContext);
    const zoomRef = useRef(null);

    // useEffect(
    //     () => {
    //         if(zoomRef.current){
    //             zoomRef.current.center();
    //         }
    //     },
    //     [zoomRef.current],
    // );

    const handleChangeGraphSpacing = (name) => {

        let intraValue, interValue;
        if (name === "decrease") {
            intraValue = state.graphLayoutSpacing.intraLevelSpacing - 20;
            interValue = state.graphLayoutSpacing.interLevelSpacing - 10;
        } else {
            intraValue = state.graphLayoutSpacing.intraLevelSpacing + 20;
            interValue = state.graphLayoutSpacing.interLevelSpacing + 10;
        }

        if (intraValue >= 0 && interValue >= 0) {


            dispatch({
                type: "SET_GRAPH_LAYOUT_SPACING",
                payload: {
                    graphLayoutSpacing: {
                        ...state.graphLayoutSpacing,
                        ["intraLevelSpacing"]: intraValue,
                        ["interLevelSpacing"]: interValue,
                    }
                }
            });

            handleUpdateStyles({
                ...state.graphLayoutSpacing,
                ["intraLevelSpacing"]: intraValue,
                ["interLevelSpacing"]: interValue,
            });
        }
    };

    const handleUpdateStyles = (newSpacing) => {

        if (state.selectedSentenceID) {

            let graphData = null;

            switch (state.visualisationFormat) {
                case "1":
                    graphData = layoutHierarchy(state.selectedSentenceGraphData, newSpacing, state.framework);
                    break;
                case "2":
                    graphData = layoutTree(state.selectedSentenceGraphData, newSpacing, state.framework);
                    break;
                case "3":
                    graphData = layoutFlat(state.selectedSentenceGraphData, false, newSpacing, state.framework);
                    break;
                default:
                    graphData = layoutHierarchy(state.selectedSentenceGraphData, newSpacing, state.framework);
                    break;
            }

            dispatch({type: "SET_SENTENCE_VISUALISATION", payload: {selectedSentenceVisualisation: graphData}});
        }
    }

    const centerHandler = () => {
        let newgraphHeight = graphHeight + state.graphLayoutSpacing.nodeHeight + state.graphLayoutSpacing.tokenLevelSpacing;

        let scalingFactor = 0;

        if (width > graphWidth && height > newgraphHeight) {
            scalingFactor = 1;
        } else {
            if (width > graphWidth && newgraphHeight > height) {
                scalingFactor = height / newgraphHeight;
            } else if (height > newgraphHeight && graphWidth > width) {
                scalingFactor = width / graphWidth;
            } else {
                if (width / graphWidth > height / newgraphHeight) {
                    scalingFactor = height / newgraphHeight;
                } else {
                    scalingFactor = width / graphWidth;
                }
            }

        }
        scalingFactor = scalingFactor - 0.02;

        let newCenter = {
            x: graphWidth * scalingFactor / 2,
            y: newgraphHeight * scalingFactor / 2
        }

        return ({
            scaleX: scalingFactor,
            scaleY: scalingFactor,
            translateX: (Math.abs(newCenter.x - (width / 2))) + 40,
            translateY: (Math.abs(newCenter.y - (height / 2))) + (state.graphLayoutSpacing.nodeHeight + state.graphLayoutSpacing.interLevelSpacing) * scalingFactor+40,
            skewX: 0,
            skewY: 0
        });
    }

    return (
        <Zoom
            width={width}
            height={height}
            scaleXMin={0.0001}
            scaleXMax={50}
            scaleYMin={0.0001}
            scaleYMax={50}
            transformMatrix={initialTransform}
        >
            {(zoom) => {
                zoomRef.current = zoom;
                return (
                    <div style={{position: 'relative'}}>
                        <svg
                            width={width}
                            height={height}
                            style={{
                                cursor: zoom.isDragging ? "grabbing" : "grab",
                            }}
                        >
                            <rect width={width} height={height} fill={backgroundColour}/>
                            <rect
                                width={width}
                                height={height}
                                fill={backgroundColour}
                                onTouchStart={zoom.dragStart}
                                onTouchMove={zoom.dragMove}
                                onTouchEnd={zoom.dragEnd}
                                onMouseDown={zoom.dragStart}
                                onMouseMove={zoom.dragMove}
                                onMouseUp={zoom.dragEnd}
                                onMouseLeave={() => {
                                    if (zoom.isDragging) zoom.dragEnd();
                                }}
                                onDoubleClick={(event) => {
                                    //zoom.center();
                                    //zoom.reset();
                                }}
                            />
                            <g transform={zoom.toString()}>{props.children}</g>
                        </svg>
                        <Box
                            p={2}
                            position="absolute"
                            top={0}
                            right={0}
                            zIndex="modal"
                        >
                            <ButtonGroup
                                orientation="vertical"
                                color="primary"
                                aria-label="vertical contained primary button group"
                                variant="contained"
                            >
                                <Tooltip title="Increase Spacing Between Elements of the Graph" placement="left" arrow>
                                    <Button size="small" startIcon={<AddIcon/>}
                                            onClick={() => handleChangeGraphSpacing("increase")}
                                            disableElevation>Spacing</Button>
                                </Tooltip>
                                <Tooltip title="Decrease Spacing Between Elements of the Graph" placement="left" arrow>
                                    <Button size="small" startIcon={<RemoveIcon/>}
                                            onClick={() => handleChangeGraphSpacing("decrease")}
                                            disableElevation>Spacing</Button>
                                </Tooltip>
                                <Tooltip title="Bring the Graph Into View" placement="left" arrow>
                                    <Button size="small" startIcon={<CenterFocusStrongIcon/>} onClick={() => {
                                        zoom.setTransformMatrix(centerHandler());
                                    }}
                                            disableElevation>Center</Button>
                                </Tooltip>
                            </ButtonGroup>
                        </Box>
                        <GraphLegend graphFormatCode={graphFormatCode}/>
                    </div>)
            }}
        </Zoom>
    );
};

export default ZoomPortal;
