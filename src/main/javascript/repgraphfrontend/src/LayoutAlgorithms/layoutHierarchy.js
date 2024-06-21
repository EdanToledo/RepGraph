import lodash from "lodash";
import {
    edgeRulesSameColumn,
    edgeRulesSameRow,
    edgeRulesOther,
    setAnchors,
    controlPoints,
    createDummyNodes
} from "./layoutUtils"
import uuid from "react-uuid";

export const layoutHierarchy = (graphData, graphLayoutSpacing, framework) => {


        const {nodeHeight, nodeWidth, interLevelSpacing, intraLevelSpacing, tokenLevelSpacing} = graphLayoutSpacing;

        let addTopNode = false;

        switch (framework) {
            case "1":
                addTopNode = true;
                break;
            case "2":
                addTopNode = true;
                break;
            case "3":
                addTopNode = true;
                break;
            case "4":
                addTopNode = true;
                break;
            case "5":
                addTopNode = true;
                break;
            default:
        }

        let graphClone = lodash.cloneDeep(graphData);

        graphClone.nodes = graphClone.nodes.map(node => ({...node,anchorsCopy : node.anchors===null ? null : graphData.nodes.find(n=>n.id===node.id).anchors}))

        let children = new Map();
        let parents = new Map();

        //Assign empty neighbour arrays to each node id
        for (const node of graphClone.nodes) {
            children.set(node.id, []);
            parents.set(node.id, []);
        }

        //Fill in children node id's and parent node ids for each node.
        for (const e of graphClone.edges) {
            let temp = children.get(e.source);
            temp.push(e.target);
            children.set(e.source, temp);

            temp = parents.get(e.target);
            temp.push(e.source);
            parents.set(e.target, temp);
        }


        let nodeMap = new Map();
        for (let node of graphClone.nodes) {
            nodeMap.set(node.id, node);
        }
        graphClone.nodes = nodeMap;

        let nodesWithoutAnchors = []; //Array to keep track of nodes which originally had no anchors

        if (framework === "3" || framework === "5") {
            setAnchors(graphClone, children, parents, nodesWithoutAnchors);
        }


        graphClone = createDummyNodes(graphClone, parents, children, false);
        console.log(graphClone)

//Determine span lengths of each node
        const graphNodeSpanLengths = Array.from(graphClone.nodes.values())
            .map((node) => node.anchors[0])
            .map((span) => span.end - span.from);

//Determine unique span lengths of all the node spans
        let uniqueSpanLengths = [];
        const map = new Map();
        for (const item of graphNodeSpanLengths) {
            if (!map.has(item)) {
                map.set(item, true); // set any value to Map
                uniqueSpanLengths.push(item);
            }
        }

        uniqueSpanLengths.sort((a, b) => a - b); //sort unique spans ascending

//Sort the nodes into each level based on their spans
        let nodesInLevels = [];
        let nodeArray = Array.from(graphClone.nodes.values());

        for (const level of uniqueSpanLengths) {
            let currentLevel = [];

            for (
                let spanIndex = 0;
                spanIndex < graphNodeSpanLengths.length;
                spanIndex++
            ) {
                if (graphNodeSpanLengths[spanIndex] === level) {
                    currentLevel.push(nodeArray[spanIndex]);
                }
            }
            nodesInLevels.push(currentLevel);
        }

//Find the nodes in each level with the same span and group them together
//Find the unique spans in each level
        let uniqueSpansInLevels = [];
        for (let level of nodesInLevels) {
            let uniqueSpans = []; //Stores the "stringified" objects
            const spanMap = new Map();
            for (const node of level) {
                if (!spanMap.has(JSON.stringify(node.anchors))) {
                    spanMap.set(JSON.stringify(node.anchors), true); // set any value to Map
                    uniqueSpans.push(JSON.stringify(node.anchors));
                }
            }
            uniqueSpansInLevels.push(uniqueSpans);
        }

//Iterate through the unique spans in each level and group the same ones together
        for (let level = 0; level < nodesInLevels.length; level++) {
            let newLevelOfGroups = [];
            for (let uniqueSpan of uniqueSpansInLevels[level]) {
                //find the nodes in the level that have the same span and group them together
                let nodesWithCurrentSpan = nodesInLevels[level].filter(
                    (node) => JSON.stringify(node.anchors) === uniqueSpan
                );
                newLevelOfGroups.push(nodesWithCurrentSpan);
            }
            nodesInLevels[level] = newLevelOfGroups;
        }

//LevelTopology size mirrors the number of tokens there are
        const levelTopology = new Array(graphClone.tokens.length);
        levelTopology.fill(0);

        const minTokenIndex = Math.min(
            ...graphClone.tokens.map((token) => token.index)
        );

        const newNodesInLevels = [];
        for (const level of nodesInLevels) {
            let newLevel = [];
            for (const uniqueSpanArr of level) {
                const newUniqueSpanArr = uniqueSpanArr.map((node, i) => {
                    
                    return {
                        ...node,
                        x: node.anchors[0].from - minTokenIndex,
                        y:
                            Math.max(
                                ...levelTopology.slice(
                                    node.anchors[0].from - minTokenIndex,
                                    node.anchors[0].end - minTokenIndex + 1
                                )
                            ) + i,
                        relativeX: node.anchors[0].from - minTokenIndex,
                        relativeY:
                            Math.max(
                                ...levelTopology.slice(
                                    node.anchors[0].from - minTokenIndex,
                                    node.anchors[0].end - minTokenIndex + 1
                                )
                            ) + i
                    };
                });
                newLevel.push(newUniqueSpanArr);

                for (
                    let index = uniqueSpanArr[0].anchors[0].from - minTokenIndex;
                    index < uniqueSpanArr[0].anchors[0].end - minTokenIndex + 1;
                    index++
                ) {
                    levelTopology[index] += uniqueSpanArr.length;
                }
            }
            newNodesInLevels.push(newLevel);
        }


        const levelTopologyMax = Math.max(...levelTopology);
        const nodeSectionHeight =
            levelTopologyMax * nodeHeight + (levelTopologyMax - 1) * interLevelSpacing;



        const nodes = newNodesInLevels.flat(2).map((node) => ({
            ...node,
            x:
                (node.x + (node.anchors[0].end - node.anchors[0].from) / 2) *
                (nodeWidth + intraLevelSpacing),
            y: (levelTopologyMax - node.y - 1) * (nodeHeight + interLevelSpacing),
            type: "node",
            group: "node",
            label: node.label,
            anchors: nodesWithoutAnchors.includes(node.id) ? null : node.anchors, //Remove fake anchors assigned to anchorless nodes
            selected: false,
            span: nodesWithoutAnchors.includes(node.id) ? false : true
        }));


        const tokens = graphClone.tokens.map((token) => ({
            ...token,
            x: (token.index - minTokenIndex) * (nodeWidth + intraLevelSpacing),
            y: nodeSectionHeight + tokenLevelSpacing,
            label: token.form,
            type: "token",
            group: "token"
        }));


        const finalGraphNodes = nodes.concat(tokens);

        //Add top node and corresponding link to graphData
        if (addTopNode) {
            //Get top node's associated node
            const associatedNode = finalGraphNodes.find(node => node.id === graphClone.tops);
            //

            if (associatedNode) {
                //Add the top node to the array of nodes
                finalGraphNodes.push({
                    id: "TOP",
                    x: associatedNode.x,
                    y: 0 - (nodeHeight + interLevelSpacing),
                    type: "topNode",
                    group: "top",
                    label: "TOP",
                    anchors: associatedNode.anchors,
                    span: false
                });

                const addedTopNode = finalGraphNodes.find(node => node.id === "TOP")

                //Add the top node link
                graphClone.edges.push({
                    id: "TOPLINK",
                    source: addedTopNode.id,
                    target: associatedNode.id,
                    label: "",
                    type: "topLink",
                });

            }
        }

        const finalGraphEdges = graphClone.edges.map((edge, index) => {
            const sourceNodeIndex = finalGraphNodes.findIndex(
                (node) => node.id === edge.source
            );
            const targetNodeIndex = finalGraphNodes.findIndex(
                (node) => node.id === edge.target
            );

            const source = finalGraphNodes[sourceNodeIndex];
            const target = finalGraphNodes[targetNodeIndex];

            let cp;

            if (source.y === target.y) {
                cp = edgeRulesSameRow(
                    edge,
                    source,
                    target,
                    finalGraphNodes,
                    graphClone.edges,
                    graphLayoutSpacing
                );
            } else if (source.x === target.x) {
                cp = edgeRulesSameColumn(
                    edge,
                    source,
                    target,
                    finalGraphNodes,
                    graphClone.edges,
                    graphLayoutSpacing
                );
            } else {
                cp = edgeRulesOther(
                    edge,
                    source,
                    target,
                    finalGraphNodes,
                    graphClone.edges,
                    graphLayoutSpacing
                );
            }

            return {
                id: index,
                source: finalGraphNodes[sourceNodeIndex],
                target: finalGraphNodes[targetNodeIndex],
                label: edge.label,
                labelOffsetX: cp.offsetX,
                labelOffsetY: cp.offsetY,
                x1: cp.x1,
                y1: cp.y1,
                type: edge.id === "TOPLINK" ? "topLink" : "link",
                group: "link",
                selected: false
            };
        });


        const gheight = (graphLayoutSpacing.nodeHeight + graphLayoutSpacing.interLevelSpacing) * (levelTopologyMax + 1)
        const gwidth = (graphLayoutSpacing.nodeWidth + graphLayoutSpacing.intraLevelSpacing) * tokens.length;

        return {nodes: finalGraphNodes, links: finalGraphEdges, graphHeight: gheight, graphWidth: gwidth};
    }
;

//Can ultimately have this information placed within the returned graph data
export const determineAdjacentLinks = (graphClone) => {
    let adjacentLinkMap = new Map();

    for (const node of graphClone.nodes) {
        adjacentLinkMap.set(node.id, []);
    }

    for (const link of graphClone.links) {
        if (link.type === "link") {
            adjacentLinkMap.set(
                link.source.id,
                adjacentLinkMap.get(link.source.id).concat(link.id)
            );
            adjacentLinkMap.set(
                link.target.id,
                adjacentLinkMap.get(link.target.id).concat(link.id)
            );
        }
    }

    return adjacentLinkMap;
};
