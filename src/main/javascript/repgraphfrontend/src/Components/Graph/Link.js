import React, {useContext, useState} from "react";
import {Group} from "@visx/visx";
import uuid from "react-uuid";
import {AppContext} from "../../Store/AppContextProvider";
import {lighten, darken} from "@material-ui/core";

export const Link = ({
                         link,
                         graphFormatCode,
                         tooltipData,
                         adjacentLinks,
                         tooltipOpen,
                         events
                     }) => {
    const [highlighted, setHighlighted] = useState(false);
    const {state, dispatch} = useContext(AppContext); //Provide access to global state

    const styles = state.graphStyles; //Use AppContext styles

    const handleOnClick = (event) => {

        if (events && events.hasOwnProperty('select')) {

            if (events.select === "subset") {
                //nothing to do?
            } else if (events.select === "subgraph") {

                try {
                    const newLinks = state.selectedSentenceVisualisation.links.map(oldLink => ({
                        ...oldLink,
                        selected: oldLink.type === "link" ? oldLink.id === link.id ? !oldLink.selected : oldLink.selected : oldLink.selected
                    }));

                    dispatch({
                        type: "SET_SENTENCE_VISUALISATION",
                        payload: {
                            selectedSentenceVisualisation: {
                                ...state.selectedSentenceVisualisation,
                                links: newLinks
                            }
                        }
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        }
    };

    let mouseStartX,
        mouseStartY,
        ElementStartX,
        ElementStartY;

    const onMouseDown = (event) => {
        mouseStartX = event.clientX;
        mouseStartY = event.clientY;
        ElementStartX = link.x1;
        ElementStartY = link.y1;
        document.addEventListener("mousemove",onMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseUp = (event) => {
       // document.getElementById(`dot${link.id}`).style.visibility = "hidden";
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("mousemove",onMove);
    };

    const onMove = (event) => {
        let changeX = mouseStartX - event.clientX;
        let changeY = mouseStartY - event.clientY;
        link.x1 = ElementStartX - changeX;
        link.y1 = ElementStartY - changeY;
        setHighlighted(true);
        setHighlighted(false);
    };

    const onClickLabel = (event) => {
        document.removeEventListener("mousemove",onMoveLabel);
        document.removeEventListener("click", onClickLabel);
    };

    const onMoveLabel = (event) => {
        let changeX = mouseStartX - event.clientX;
        let changeY = mouseStartY - event.clientY;
        link.labelOffsetX = ElementStartX - changeX;
        link.labelOffsetY = ElementStartY - changeY;
        setHighlighted(true);
        setHighlighted(false);
    };

    const onMouseDownLabel = (event) => {
        mouseStartX = event.clientX;
        mouseStartY = event.clientY;
        ElementStartX = link.labelOffsetX;
        ElementStartY = link.labelOffsetY;
        document.addEventListener("mousemove",onMoveLabel);
        document.addEventListener("click", onClickLabel);
    };

    let strokeColor = null;

    if (link.selected && events && events.hasOwnProperty("select")) {
        strokeColor = styles.linkStyles.selectedColour;
    } else if (highlighted) {
        if(link.type === "topLink"){
            strokeColor = darken(styles.nodeStyles.topNodeColour, 0.3);
        }else{
            strokeColor = styles.linkStyles.hoverColour;
        }

    } else if (
        (graphFormatCode === "hierarchicalLongestPath" ||
            graphFormatCode === "treeLongestPath" ||
            graphFormatCode === "flatLongestPath") &&
        link.group === "longestPath"
    ) {
        strokeColor = styles.longestPathStyles.linkColour;
    } else if (
        adjacentLinks?.get(tooltipData.extraInformation.id)?.includes(link.id) &&
        tooltipOpen
    ) {
        strokeColor = styles.linkStyles.hoverColour;
    } else if (graphFormatCode === "hierarchicalCompare" || graphFormatCode === "treeCompare" || graphFormatCode === "flatCompare") {

        switch (link.group) {
            case "similar":
                strokeColor = styles.compareStyles.linkColourSimilar;
                break;
            case "dissimilar":
                strokeColor = styles.compareStyles.linkColourDissimilar;
                break;
            default:
                strokeColor = styles.linkStyles.linkColour;
                break;
        }

    } else if (graphFormatCode === "planar") {
        switch (link.group) {
            case "linkColourCross":
                strokeColor = styles.planarStyles.linkColourCross;
                break;
            default:
                strokeColor = styles.linkStyles.linkColour;
                break;
        }
    } else if(link.type === "topLink"){
        strokeColor = styles.nodeStyles.topNodeColour;
    }
    else {
        strokeColor = styles.linkStyles.linkColour;
    }

    return (
        <Group
            onMouseEnter={(event) => {
                setHighlighted(true);
            }}
            onMouseLeave={(event) => {
                setHighlighted(false);
            }}
            onClick={handleOnClick}
        >
            {EdgeLayout(link, strokeColor,onMouseDown, onMouseDownLabel)}
        </Group>
    );
};

function EdgeLayout(link, strokeColor, onMouseDown, onMouseDownLabel) {

    const t = 0.5;

    const x0 = link.source.x;
    const y0 = link.source.y;
    const x1 = link.x1;
    const y1 = link.y1;
    const x2 = link.x1;
    const y2 = link.y1;
    const x3 = link.target.x;
    const y3 = link.target.y;

    const xMid =
        Math.pow(1 - t, 3) * x0 +
        Math.pow(1 - t, 2) * 3 * t * x1 +
        (1 - t) * 3 * t * t * x2 +
        Math.pow(t, 3) * x3;
    const yMid =
        Math.pow(1 - t, 3) * y0 +
        Math.pow(1 - t, 2) * 3 * t * y1 +
        (1 - t) * 3 * t * t * y2 +
        Math.pow(t, 3) * y3;


    const textPathID = uuid();

    if (link.type === "tokenLink") {
        return (
            <path
                id={`edge${link.id}${textPathID}`}
                d={`M ${link.source.x} ${link.source.y} C  ${link.x1} ${link.y1} ${link.x1} ${link.y1} ${link.target.x} ${link.target.y}`}
                stroke={strokeColor}
                strokeWidth="2"
                fill="none"
                strokeDasharray="10,10"
            />
        );
    } else if (link.type === "topLink") {
        return (
            <path
                id={`edge${link.id}${textPathID}`}
                d={`M ${link.source.x} ${link.source.y} C  ${link.x1} ${link.y1} ${link.x1} ${link.y1} ${link.target.x} ${link.target.y}`}
                stroke={strokeColor}
                strokeWidth="2"
                fill="none"
                onMouseDown={onMouseDown}
                cursor="move"
            />
        );
    }else {
        return (
            <Group rel="stylesheet" href="../../styles.css" className="unselectable">
                <path
                    id={`edge${link.id}${textPathID}`}
                    d={`M ${link.source.x} ${link.source.y} C  ${link.x1} ${link.y1} ${link.x1} ${link.y1} ${link.target.x} ${link.target.y}`}
                    stroke={strokeColor}
                    strokeWidth="2"
                    fill="none"
                />
                <path
                    id={`edge${link.id}${textPathID}2`}
                    d={`M ${link.source.x} ${link.source.y} C  ${link.x1} ${link.y1} ${link.x1} ${link.y1} ${link.target.x} ${link.target.y}`}
                    stroke="rgba(0, 0, 0, 0)"
                    strokeWidth="20"
                    fill="none"
                    onMouseDown={onMouseDown}
                    cursor="move"
                />
                <text textAnchor="middle" dy="-1.5px">
                    <textPath
                        href={`#edge${link.id}${textPathID}`}
                        startOffset={`50%`}
                        side="left"
                        stroke={strokeColor}
                        fill={strokeColor}
                        fontSize="25px"
                        dominantBaseline="central"
                        onMouseDown={onMouseDown}
                        cursor="move"
                    >
                        ➤
                    </textPath>
                </text>
                <text
                    textAnchor="middle"
                    fill={strokeColor}
                    x={xMid}
                    y={yMid}
                    dy={`${link.labelOffsetY}px`}
                    dx={`${link.labelOffsetX}px`}
                    fontWeight="bold"
                    onMouseDown={onMouseDownLabel}
                    cursor="move"
                >
                    {link.label}
                </text>
                {/*<circle*/}
                {/*    id={`dot${link.id}`}*/}
                {/*    cx={link.x1}*/}
                {/*    cy={link.y1}*/}
                {/*    r="5"*/}
                {/*    fill="red"*/}
                {/*    visibility="hidden"*/}
                {/*    onMouseDown={onMouseDown}*/}
                {/*    cursor="move"*/}
                {/*></circle>*/}
            </Group>
        );
    }
}

export default Link;
