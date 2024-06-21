import React, {useContext} from "react";
import {useState} from "react";
import {Group} from "@visx/visx";
import {AppContext} from "../../Store/AppContextProvider";

export const Node = ({
                         node,
                         handleMouseOver,
                         hideTooltip,
                         setTooltipData,
                         tooltipOpen,
                         tooltipData,
                         graphFormatCode,
                         events
                     }) => {
    const [highlighted, setHighlighted] = useState(false);
    const {state, dispatch} = useContext(AppContext); //Provide access to global state

    const styles = state.graphStyles; //Use AppContext styles

    let label = (
        <text
            textAnchor="middle"
            alignmentBaseline="baseline"
            fill={node.type === "token" ? styles.tokenStyles.labelColour : styles.nodeStyles.labelColour}
            fontWeight="bold"
            // transform="translate(0,45)"
        >
            {node.label.length > 10
                ? node.label.substring(0, 7).concat("...")
                : node.label}
        </text>
    );

    //

    let bb = {
        x: 0,
        y: 0,
        width: state.graphLayoutSpacing.nodeWidth,
        height: state.graphLayoutSpacing.nodeHeight
    };

    const margin = 5;
    bb.x -= bb.width / 2;
    bb.y -= bb.height / 2 + margin;

    let fillColor = null;
    let stroke = null;
    let strokeWidth = null;

    switch (node.type) {
        case "node":

            if (node.selected && events && events.hasOwnProperty("select")) {
                fillColor = styles.nodeStyles.selectedColour;
            } else if (highlighted) {

                if (node.surface) {
                    fillColor = styles.nodeStyles.surfaceNodeHoverColour;
                } else {
                    fillColor = styles.nodeStyles.abstractNodeHoverColour;
                }

            } else if (
                (graphFormatCode === "hierarchicalLongestPath" ||
                    graphFormatCode === "treeLongestPath" ||
                    graphFormatCode === "flatLongestPath") &&
                node.group === "longestPath"
            ) {
                fillColor = styles.longestPathStyles.nodeColour;
            } else if (graphFormatCode === "hierarchicalCompare" || graphFormatCode === "treeCompare" || graphFormatCode === "flatCompare") {

                switch (node.group) {
                    case "similar":
                        fillColor = styles.compareStyles.nodeColourSimilar;
                        break;
                    case "dissimilar":
                        fillColor = styles.compareStyles.nodeColourDissimilar;
                        break;
                    default:
                        fillColor = "black";
                        break;
                }

            } else if (node.surface) {
                fillColor = styles.nodeStyles.surfaceNodeColour;
            } else {
                fillColor = styles.nodeStyles.abstractNodeColour;
            }
            if (node.dummy === true) {
                fillColor = styles.nodeStyles.surfaceNodeColour;
                if (tooltipOpen && node.label.includes(`ID:${tooltipData.extraInformation.id} `)){
                    stroke = "black"
                    strokeWidth="4"
                }
                else{
                    stroke = styles.nodeStyles.dummyNodeColour;
                    strokeWidth = "6"
                }
            }
            else {
                if (tooltipOpen && tooltipData.label.includes(`ID:${node.id} `)) {
                    stroke = "black"
                    strokeWidth="4"
                }
            }
            break;
        case "token":
            if (node.selected && events && events.hasOwnProperty("select")) {
                fillColor = styles.tokenStyles.selectedColour;
            } else if (highlighted) {
                fillColor = styles.tokenStyles.hoverColour;
            } else if (
                (graphFormatCode === "hierarchicalLongestPath" ||
                    graphFormatCode === "treeLongestPath" ||
                    graphFormatCode === "flatLongestPath") &&
                node.group === "longestPath"
            ) {
                fillColor = styles.longestPathStyles.tokenColour;
            } else if (tooltipOpen && tooltipData.extraInformation.hasOwnProperty("anchors")) {
                fillColor = styles.tokenStyles.tokenColour;
                let anchs = tooltipData.extraInformation.anchors;
                if (anchs.includes(",")) {
                    while (anchs.includes(",")) {
                        let commaIndex = anchs.indexOf(",");
                        let index = anchs.indexOf("-");
                        let lower = parseInt(anchs.slice(0, index));
                        let upper = parseInt(anchs.slice(index + 1, commaIndex));
                        if (node.index >= lower && node.index <= upper) {
                            stroke = "black"
                            strokeWidth="4"
                            break;
                        }
                        anchs = anchs.slice(commaIndex + 2);
                    }
                }
                let index = anchs.indexOf("-");
                let lower = parseInt(anchs.slice(0, index));
                let upper = parseInt(anchs.slice(index + 1));
                if (node.index >= lower && node.index <= upper) {
                    stroke = "black"
                    strokeWidth="4"
                }
            } else {
                fillColor = styles.tokenStyles.tokenColour;
            }
            break;
        case "topNode":
            if (highlighted) {
                fillColor = styles.nodeStyles.topNodeHoverColour;
            } else {
                fillColor = styles.nodeStyles.topNodeColour;
            }
            break;
        default:
            fillColor = "black"; //dunno about this
    }

    const outline = (
        <rect
            x={bb.x}
            y={bb.y}
            rx={8}
            ry={8}
            width={bb.width}
            height={bb.height}
            className="labeloutline"
            fill={fillColor}
            stroke={stroke}
            strokeWidth={strokeWidth}
        />
    );

    // const outline = <circle r={25} fill={fillColor} opacity={1} />;

    let span = null;
    if (node.type === "node" && node.span === true) {
        const fromX =
            ((node.anchors[0].from - node.anchors[0].end) / 2) * (state.graphLayoutSpacing.nodeWidth + state.graphLayoutSpacing.intraLevelSpacing) - bb.width / 2;

        const fromY = bb.y + bb.height + 10;

        const toX =
            ((node.anchors[0].end - node.anchors[0].from) / 2) * (state.graphLayoutSpacing.nodeWidth + state.graphLayoutSpacing.intraLevelSpacing) +
            bb.width / 2;
        const toY = bb.y + bb.height + 10;

        span = (
            <polyline
                points={`${fromX},${fromY + 5} ${fromX},${fromY} ${toX},${toY} ${toX},${
                    toY + 5
                }`}
                fill="none"
                strokeWidth="4"
                stroke={styles.nodeStyles.spanColour}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        );
    }

    const handleOnClick = (event) => {

        if (events && events.hasOwnProperty('select')) {

            if (events.select === "subset" && node.type === "node") {

                try {

                    const newNodes = state.selectedSentenceVisualisation.nodes.map(oldNode => ({
                        ...oldNode,
                        selected: oldNode.type === "node" && oldNode.dummy===false ? (oldNode.id === node.id ? true : false) : false
                    }));


                    dispatch({
                        type: "SET_SENTENCE_VISUALISATION",
                        payload: {
                            selectedSentenceVisualisation: {
                                ...state.selectedSentenceVisualisation,
                                nodes: newNodes
                            }
                        }
                    });

                } catch (e) {
                    console.log(e);
                }

            } else if (events.select === "subgraph" && node.type === "node") {

                try {

                    const newNodes = state.selectedSentenceVisualisation.nodes.map(oldNode => ({
                        ...oldNode,
                        selected: oldNode.type === "node" && oldNode.dummy===false ? oldNode.id === node.id ? !oldNode.selected : oldNode.selected : oldNode.selected
                    }));

                    dispatch({
                        type: "SET_SENTENCE_VISUALISATION",
                        payload: {
                            selectedSentenceVisualisation: {
                                ...state.selectedSentenceVisualisation,
                                nodes: newNodes
                            }
                        }
                    });

                } catch (e) {
                    console.log(e);
                }
            }

        }
    };

    let mouseStartX, mouseStartY, ElementStartX, ElementStartY;
    const onMouseDown = (event) => {
        mouseStartX = event.clientX;
        mouseStartY = event.clientY;
        ElementStartX = node.x;
        ElementStartY = node.y;
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseUp = (event) => {
        // document.getElementById(`dot${link.id}`).style.visibility = "hidden";
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("mousemove", onMove);
    };

    const onMove = (event) => {
        let changeX = mouseStartX - event.clientX;
        let changeY = mouseStartY - event.clientY;
        let numLevelx = Math.round(changeX / 90);
        let numLevely = Math.round(changeY / 100);
        node.x = ElementStartX - numLevelx * 90;
        node.y = ElementStartY - numLevely * 100;
        setHighlighted(true);
        setHighlighted(false);
    };

    let notAllowed = [
        "x",
        "y",
        "type",
        "group",
        "label",
        "relativeX",
        "relativeY",
        "nodeLevel",
        "span",
        "surface",
        "selected",
        "dummy",
        "ignoreID"
    ]; //Extra information object keys to be excluded from tooltip

    //Remove id property from tree-like token tooltip
    if (node.type === "token" || node.dummy === true || node.ignoreID === true) {
        notAllowed = notAllowed.concat("id");
    }

    let filteredExtraInformation = Object.entries(node)
        .filter(([key, value]) => !notAllowed.includes(key) && value !== null)
        .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});

    if (filteredExtraInformation.hasOwnProperty("anchorsCopy")) {
        filteredExtraInformation.anchorsCopy = filteredExtraInformation.anchorsCopy.map(anchor => {

            let anchorString = anchor.from + "-" + anchor.end;
            if (anchor.hasOwnProperty("text") && graphFormatCode === "flat") {
                anchorString += " : " + anchor.text;
            }
            return anchorString;

        }).join(", ");
    }

    if (filteredExtraInformation.hasOwnProperty("anchors")) {
        filteredExtraInformation.anchors = filteredExtraInformation.anchors.map(anchor => {

            let anchorString = anchor.from + "-" + anchor.end;
            if (anchor.hasOwnProperty("text") && graphFormatCode === "flat") {
                anchorString += " : " + anchor.text;
            }
            return anchorString;

        }).join(", ");
    }


    return (
        <g>
            <Group
                style={{
                    cursor: "pointer",
                }}
                onMouseEnter={(event) => {
                    //
                    setHighlighted(true);
                    setTooltipData({
                        label: node.label,
                        type: node.type,
                        surface: node.surface,
                        extraInformation: filteredExtraInformation
                    });
                }}
                onMouseLeave={(event) => {
                    //
                    setHighlighted(false);
                }}
                onMouseOver={handleMouseOver}
                onMouseOut={hideTooltip}
                onClick={handleOnClick}
                onMouseDown={onMouseDown}
                top={node.y}
                left={node.x}
            >
                {span}
                {outline}
                {label}
            </Group>
        </g>
    );
};

export default Node;
