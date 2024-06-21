import {
    topologicalSort,
    controlPoints,
    edgeRulesSameColumn,
    edgeRulesSameRow,
    edgeRulesOther,
    setAnchors,
    createDummyNodes
} from "./layoutUtils";
import uuid from "react-uuid";
import lodash from "lodash";

export const layoutTree = (graphData, graphLayoutSpacing, framework) => {

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

        let nodeMap = new Map();
        for (let node of graphClone.nodes) {
            nodeMap.set(node.id, node);
        }
        graphClone.nodes = nodeMap;

        let children = new Map();
        let parents = new Map();

        //Assign empty neighbour arrays to each node id
        for (const nodeID of graphClone.nodes.keys()) {
            children.set(nodeID, []);
            parents.set(nodeID, []);
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
        graphClone = createDummyNodes(graphClone, parents, children, false);

        let topologicalStacks = new Map(); //Will hold each node's descendent nodes

        //Fill the topological stacks map with the number descendants each node has.
        for (const nodeOuter of graphClone.nodes.values()) {
            let stack = [];
            let visited = {};

            for (const nodeID of graphClone.nodes.keys()) {
                visited[nodeID.id] = false;
            }

            topologicalStacks.set(
                nodeOuter.id,
                topologicalSort(nodeOuter, children, visited, stack, graphClone)
            );
        }

        let nodesWithoutAnchors = []; //Array to keep track of nodes which originally had no anchors
        if (framework === "3" || framework === "5") {
            setAnchors(graphClone, children, parents, nodesWithoutAnchors);
        }

        let numLevels = 0;
        for (const stack of topologicalStacks.values()) {
            numLevels = Math.max(numLevels, stack.length);
        }

        //Group nodes together based on the number of descendents they have.
        let nodesInLevels = [];
        for (
            let numDescendents = 1;
            numDescendents < numLevels + 1;
            numDescendents++
        ) {
            let currentLevel = [];
            for (let node of graphClone.nodes.values()) {
                if (topologicalStacks.get(node.id).length === numDescendents) {
                    currentLevel.push(node);
                }
            }
            nodesInLevels.push(currentLevel);
        }

        let xPositions = new Map();
        let lowestNode = new Map();


        //Populate the xPositions map with each node's xPosition and the lowestNode map with the lowest node in each column.
        for (let level of nodesInLevels) {
            for (let n of level) {
                let column = n.anchors[0].from;
                xPositions.set(n.id, column);
                if (!lowestNode.has(column) && !nodesWithoutAnchors.includes(n.id)) {
                    lowestNode.set(column, n.id);
                }
            }
        }


        //This decides a nodes xPosition based on its neighbours/children.
        for (let level of nodesInLevels) {
            for (let n of level) {
                if (
                    !nodesWithoutAnchors.includes(n.id) &&
                    lowestNode.get(xPositions.get(n.id)) !== n.id
                ) {
                    //If the current node in the current level isn't the lowest node in its column
                    if (children.get(n.id).length === 0) {
                    } else if (children.get(n.id).length === 1) {
                        //If the current node has a single neighbour
                        xPositions.set(n.id, xPositions.get(children.get(n.id)[0])); //Set the current node's xPosition to its neighbour's
                    } else {

                        let childrenX = [];
                        for (let neighbour of children.get(n.id)) {
                            childrenX.push(xPositions.get(neighbour));
                        }
                        childrenX = childrenX.sort();
                        let middleChild = childrenX[Math.floor(childrenX.length / 2)];
                        xPositions.set(n.id, middleChild); //Set the node's x position to its middle child's
                    }
                }
            }
        }

        let nodesInFinalLevels = [];
        nodesInFinalLevels[0] = new Map();

        //Algorithm to resolve overlapping nodes.
        let nodesProcessed = new Map();
        let numNodesProcessed = 0;
        let currentLevel = 0;
        while (numNodesProcessed !== graphClone.nodes.size) {
            let nodeXPos = new Map();
            nodesInFinalLevels[currentLevel + 1] = new Map();
            if (currentLevel === nodesInLevels.length - 1) {
                nodesInLevels[currentLevel + 1] = [];
            }
            for (let n of nodesInLevels[currentLevel]) {
                let action = "stay";

                if (nodesWithoutAnchors.includes(n.id)) {
                    let lowest = lowestNode.get(xPositions.get(n.id));
                    if (!nodesProcessed.has(lowest)) {
                        action = "move";
                    } else if (nodeXPos.has(xPositions.get(n.id))) { //If this xPosition is already taken in this level
                        //Move the current occupying node up, so the anchorless node stays with its parent.
                        if (
                            topologicalStacks.get(n.id).length <
                            topologicalStacks.get(nodeXPos.get(xPositions.get(n.id))).length && nodeXPos.get(xPositions.get(n.id)) !== lowest
                        ) {
                            action = "replace";
                        } else {
                            action = "move";
                        }
                    }
                } else if (nodeXPos.has(xPositions.get(n.id))) { //If this xPosition is already taken in this level
                    if (
                        topologicalStacks.get(n.id).length <
                        topologicalStacks.get(nodeXPos.get(xPositions.get(n.id))).length
                    ) {
                        action = "replace";
                    } else {
                        action = "move";
                    }
                }

                if (action === "move") {
                    nodesInLevels[currentLevel + 1].push(n);
                } else if (action === "replace") {
                    //Set the node with the higher descendents in the next level, and remove it from this level.
                    let currentOccupyingNodeID = nodeXPos.get(xPositions.get(n.id));
                    nodeXPos.set(xPositions.get(n.id), n.id);
                    nodesInLevels[currentLevel + 1].push(graphClone.nodes.get(currentOccupyingNodeID));
                    nodesInFinalLevels[currentLevel].delete(currentOccupyingNodeID);
                    nodesInFinalLevels[currentLevel].set(n.id, n);
                } else if (action === "stay") {
                    //Designate this node as the node occupying node this xPosition on this level.
                    nodeXPos.set(xPositions.get(n.id), n.id);
                    nodesInFinalLevels[currentLevel].set(n.id, n);
                    nodesProcessed.set(n.id, true);
                    numNodesProcessed++;
                }
            }

            currentLevel++;
        }

//convert from array of maps to array of arrays
        let nodesInFinalLevelsArray = [nodesInFinalLevels.length];
        let level = 0;
        for (let i = 0; i < nodesInFinalLevels.length; i++) {
            if (nodesInFinalLevels[i].size !== 0) { //Removes levels with no nodes to create a more condensed graph.
                nodesInFinalLevelsArray[level] = [];
                for (let n of nodesInFinalLevels[i].values()) {
                    nodesInFinalLevelsArray[level].push(n);
                }
                level++;
            }
        }

        let height = nodesInFinalLevelsArray.length;

        const totalGraphHeight =
            height * nodeHeight + (height - 1) * interLevelSpacing; //number of levels times the height of each node and the spaces between them

        const tokens = graphClone.tokens.map((token) => ({
            ...token,
            id: token.index + graphClone.nodes.length,
            x: token.index * (intraLevelSpacing + nodeWidth),
            y: totalGraphHeight + tokenLevelSpacing,
            relativeX: token.index,
            label: token.form,
            type: "token",
            group: "token",
            selected: false
        }));

        for (let level = 0; level < nodesInFinalLevelsArray.length; level++) {
            nodesInFinalLevelsArray[level] = nodesInFinalLevelsArray[level].map(
                (node) => ({
                    ...node,
                    x: xPositions.get(node.id) * (intraLevelSpacing + nodeWidth),
                    y: totalGraphHeight - level * (totalGraphHeight / height),
                    relativeX: xPositions.get(node.id),
                    relativeY: level,
                    label: node.label,
                    type: "node",
                    nodeLevel: level,
                    group: "node",
                    span: false,
                    selected: false,
                    anchors: nodesWithoutAnchors.includes(node.id) ? null : node.anchors //Remove fake anchors assigned to anchorless nodes
                })
            );
        }

        const finalGraphNodes = nodesInFinalLevelsArray.flat().concat(tokens);

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

        let tokenEdges = [];
        let i = 0;
        for (let token of tokens) {
            if (lowestNode.get(token.relativeX) !== undefined) {
                let node = finalGraphNodes[
                    finalGraphNodes.findIndex(
                        (node) => node.id === lowestNode.get(token.relativeX))]
                let cp = controlPoints(
                    node,
                    token,
                    "",
                    0, graphLayoutSpacing
                );
                let temp = {
                    source: node,
                    target: token,
                    type: "tokenLink",
                    label: "",
                    x1: cp.x1,
                    y1: cp.y1
                };
                tokenEdges[i] = temp;
                i++;
                if (node.surface === true) {
                    if (node.anchors[0].from - node.anchors[0].end !== 0) {
                        for (let j = node.anchors[0].from + 1; j < node.anchors[0].end + 1; j++) {
                            let index = tokens.findIndex((token) => token.index === j);
                            cp = controlPoints(
                                node,
                                tokens[index],
                                "",
                                0,
                                graphLayoutSpacing
                            );
                            temp = {
                                source: node,
                                target: tokens[index],
                                type: "tokenLink",
                                label: "",
                                x1: cp.x1,
                                y1: cp.y1
                            };
                            tokenEdges[i] = temp;
                            i++;
                        }
                    }
                }
            }
        }

        const allEdges = finalGraphEdges.concat(tokenEdges);

        const gheight = (height+1) * (graphLayoutSpacing.nodeHeight +interLevelSpacing);
        const gwidth =  (graphLayoutSpacing.nodeWidth+graphLayoutSpacing.intraLevelSpacing)*tokens.length;

        return {nodes: finalGraphNodes, links: allEdges,graphHeight :gheight,graphWidth : gwidth };
    }
;

