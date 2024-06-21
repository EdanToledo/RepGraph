import React, {useState, useRef, useCallback, useReducer, useContext} from "react";

import ZoomPortal from "./ZoomPortal";
import {Node} from "./Node";
import {Link} from "./Link";

import {useTooltip, useTooltipInPortal, defaultStyles} from "@visx/tooltip";
import {AppContext} from "../../Store/AppContextProvider";
import {cloneDeep} from "lodash";

export const Graph = ({
                          graph,
                          height,
                          width,
                          graphFormatCode,
                          adjacentLinks,
                          events
                      }) => {
    const {nodes, links,graphHeight,graphWidth} = graph;
    const [tooltipData, setTooltipData] = useState({extraInformation: {}});
    const {state, dispatch} = useContext(AppContext); //Provide access to global state

    const styles = state.graphStyles; //Use AppContext styles

    const {
        tooltipLeft,
        tooltipTop,
        tooltipOpen,
        showTooltip,
        hideTooltip
    } = useTooltip();

    const {containerRef, containerBounds, TooltipInPortal} = useTooltipInPortal(
        {
            // use TooltipWithBounds
            detectBounds: true,
            // when tooltip containers are scrolled, this will correctly update the Tooltip position
            scroll: true
        }
    );

    const handleMouseOver = useCallback(
        (event) => {
            // coordinates should be relative to the container in which Tooltip is rendered
            const containerX =
                ("clientX" in event ? event.clientX : 0) - containerBounds.left;
            const containerY =
                ("clientY" in event ? event.clientY : 0) - containerBounds.top;
            showTooltip({
                tooltipLeft: containerX,
                tooltipTop: containerY,
                tooltipData
            });
        },
        [showTooltip, containerBounds, tooltipData]
    );

    //Only show original, unprocessed anchors information from the data-set
    const tooltipDisplayData = cloneDeep(tooltipData);
    if (tooltipDisplayData.extraInformation.hasOwnProperty("anchorsCopy")) {
        tooltipDisplayData.extraInformation.anchors = tooltipDisplayData.extraInformation.anchorsCopy;
        delete tooltipDisplayData.extraInformation.anchorsCopy;
    }
    return (
        <div
            ref={containerRef}
            style={{
                display: "flex",
                flexDirection: "column",
                border: "0px solid red",
                height: "100%",
                // touchAction: "none"
            }}
        >
            <ZoomPortal
                width={width}
                height={height}
                backgroundColour={styles.general.backgroundColour}
                graphFormatCode={graphFormatCode}
                graphHeight = {graphHeight}
                graphWidth = {graphWidth}
            >
                {links.map((link, i) => (
                    <Link
                        key={`link-${i}`}
                        link={link}
                        graphFormatCode={graphFormatCode}
                        tooltipData={tooltipData}
                        adjacentLinks={adjacentLinks}
                        tooltipOpen={tooltipOpen}
                        events={events}
                    />
                ))}
                {nodes.map((node, i) => (
                    <Node
                        key={`node-${i}`}
                        node={node}
                        handleMouseOver={handleMouseOver}
                        hideTooltip={hideTooltip}
                        setTooltipData={setTooltipData}
                        tooltipOpen={tooltipOpen}
                        tooltipData={tooltipData}
                        graphFormatCode={graphFormatCode}
                        events={events}
                    />
                ))}
                {tooltipOpen && (
                    <TooltipInPortal
                        // set this to random so it correctly updates with parent bounds
                        key={Math.random()}
                        top={tooltipTop}
                        left={tooltipLeft}
                        style={{
                            ...defaultStyles,
                            borderRadius: "8px",
                            padding: "0.4rem",
                            zIndex: 10000
                        }}
                    >
                        <div className="tooltip">
                            <div
                                className="tooltipSection"
                                style={{
                                    marginBottom: "0.4rem"
                                }}
                            >
                                <div
                                    style={{
                                        color:
                                            tooltipDisplayData.type === "node"
                                                ? (tooltipDisplayData.surface ? styles.nodeStyles.surfaceNodeColour : styles.nodeStyles.abstractNodeColour)
                                                : tooltipDisplayData.type === "token" ? styles.tokenStyles.tokenColour : styles.nodeStyles.topNodeColour
                                    }}
                                >
                                    {tooltipDisplayData.label}
                                </div>
                            </div>
                            <div className="tooltipSection">
                                {Object.entries(tooltipDisplayData.extraInformation).map(
                                    (entry, i) => {
                                        return (
                                            entry[0] !== "extraInformation" ?
                                                (
                                                    <div
                                                        key={`extraInfo-${i}`}
                                                        className="extraInfo"
                                                        style={{
                                                            color:
                                                                tooltipDisplayData.type === "node"
                                                                    ? (tooltipDisplayData.surface ? styles.nodeStyles.surfaceNodeColour : styles.nodeStyles.abstractNodeColour)
                                                                    : tooltipDisplayData.type === "token" ? styles.tokenStyles.tokenColour : styles.nodeStyles.topNodeColour,
                                                            marginTop: "0.4rem",
                                                            width: "100%"
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                color: "black",
                                                                marginLeft: "0.4rem",
                                                                marginRight: "0.4rem",
                                                                width: "auto"
                                                            }}
                                                        >
                                                            {entry[0] === "extraInformation" ? "Additional Data" : entry[0]}:
                                                        </div>
                                                        <div style={{marginRight: "0.4rem", width: "auto"}}>
                                                            {typeof entry[1] === "object" && entry[1] !== null ?
                                                                Array.isArray(entry[1]) ? entry[1].join(", ") : JSON.stringify(entry[1]) : entry[1]}
                                                        </div>
                                                    </div>) : <div style={{width: "100%"}} key={`extraInfo-${i}`}>
                                                    <div className={"tooltipDivider"}/>
                                                    {(Object.entries(entry[1]).map((extraEntry, index) =>
                                                        <div
                                                            key={`additionalInfo-${index}`}
                                                            className="extraInfo"
                                                            style={{
                                                                color:
                                                                    tooltipDisplayData.type === "node"
                                                                        ? (tooltipDisplayData.surface ? styles.nodeStyles.surfaceNodeColour : styles.nodeStyles.abstractNodeColour)
                                                                        : tooltipDisplayData.type === "token" ? styles.tokenStyles.tokenColour : styles.nodeStyles.topNodeColour,
                                                                marginTop: "0.4rem",
                                                                width: "100%"
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    color: "black",
                                                                    marginLeft: "0.4rem",
                                                                    marginRight: "0.4rem",
                                                                    width: "auto"
                                                                }}
                                                            >
                                                                {extraEntry[0]}
                                                            </div>
                                                            <div style={{marginRight: "0.4rem", width: "auto"}}>
                                                                {extraEntry[1]}
                                                            </div>
                                                        </div>))}
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </TooltipInPortal>
                )}
            </ZoomPortal>
        </div>
    );
};

export default Graph;
