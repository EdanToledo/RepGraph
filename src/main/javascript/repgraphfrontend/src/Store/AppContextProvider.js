import React, {useReducer} from "react";
import {dmrsDebugData} from "./demoData";

export const AppContext = React.createContext();

export const defaultGraphStyles = {
    general: {
    backgroundColour: "rgba(239,239,239,1)"
    },
    nodeStyles: {
        abstractNodeColour: "rgba(0,172,237,1)",
        abstractNodeHoverColour: "rgb(47,145,183)",
        surfaceNodeColour: "rgba(255,194,34,1)",
        surfaceNodeHoverColour: "rgba(229,188,79,1)",
        dummyNodeColour: "rgba(255,137,100,1)",
        topNodeColour: "rgba(255,137,100,1)",
        topNodeHoverColour: "rgba(198,140,120,1)",
        spanColour: "rgba(0,0,0,0.3)",
        selectedColour: "rgba(61, 230, 140, 1)",
        labelColour: "rgba(255,255,255,1)"
    },
    linkStyles: {
        linkColour: "rgba(120,120,120,1)",
        hoverColour: "rgba(0,0,0,1)",
        selectedColour: "rgba(61, 230, 140, 1)"
    },
    tokenStyles: {
        tokenColour: "rgba(0,192,114, 1)",
        hoverColour: "rgb(31,155,105)",
        selectedColour: "rgba(61, 230, 140, 1)",
        labelColour: "rgba(0,0,0,1)"
    },

    longestPathStyles: {
        linkColour: "rgba(225, 9, 9, 1)",
        nodeColour: "rgba(225, 9, 9, 1)",
        hoverColour: "rgba(248, 84, 84, 1)"
    },
    compareStyles: {
        linkColourDissimilar: "rgba(225, 9, 9, 1)",
        linkColourSimilar: "rgba(67, 220, 24, 1)",
        nodeColourDissimilar: "rgba(225, 9, 9, 1)",
        nodeColourSimilar: "rgba(67, 220, 24, 1)",
        hoverNodeColourSimilar: "rgba(125, 237, 94, 1)",
        hoverNodeColourDissimilar: "rgba(248, 84, 84, 1)",
        hoverLinkColourSimilar: "rgba(125, 237, 94, 1)",
        hoverLinkColourDissimilar: "rgba(248, 84, 84, 1)"
    },
    planarStyles: {
        linkColourCross: "rgba(225, 9, 9, 1)",
        hoverColour: "rgba(248, 84, 84, 1)"
    }
};

export const defaultGraphLayoutSpacing = {
    nodeHeight: 40,
    nodeWidth: 80,
    interLevelSpacing: 80,
    intraLevelSpacing: 50,
    tokenLevelSpacing: 200
};

const initialState = {
    dataSet: null,
    dataSetFileName: null,
    dataSetResponse: null,
    selectedSentenceID: null,
    selectedSentenceGraphData: null,
    selectedSentenceVisualisation: null,
    isLoading: false,
    APIendpoint: "https://repgraph-backend.herokuapp.com",
    testResults: null,
    longestPathVisualisation: null,
    visualisationFormat: "1",
    framework: "1",
    userID: 1,
    graphStyles: defaultGraphStyles,
    graphLayoutSpacing: defaultGraphLayoutSpacing,
    datasetAnalysis : null
};

const reducer = (state, action) => {
    switch (action.type) {
        case "SET_DATASET":
            return {...state, dataSet: action.payload.dataSet};
        case "SET_DATASET_FILENAME":
            return {...state, dataSetFileName: action.payload.dataSetFileName};
        case "SET_DATASET_RESPONSE":
            return {...state, dataSetResponse: action.payload.dataSetResponse};
        case "SET_SENTENCE_GRAPHDATA":
            return {...state, selectedSentenceGraphData: action.payload.selectedSentenceGraphData};
        case "SET_SENTENCE_VISUALISATION":
            return {...state, selectedSentenceVisualisation: action.payload.selectedSentenceVisualisation};
        case "SET_LONGEST_VISUALISATION":
            return {...state, longestPathVisualisation: action.payload.longestPathVisualisation};
        case "SET_SELECTED_SENTENCE_ID":
            return {...state, selectedSentenceID: action.payload.selectedSentenceID};
        case "SET_LOADING":
            return {...state, isLoading: action.payload.isLoading};
        case "SET_TEST_RESULTS":
            return {...state, testResults: action.payload.testResults};
        case "SET_VISUALISATION_FORMAT":
            return {...state, visualisationFormat: action.payload.visualisationFormat};
        case "SET_VISUALISATION_OPTIONS":
            return {...state, visualisationOptions: action.payload.visualisationOptions};
        case "SET_FRAMEWORK":
            return {...state, framework: action.payload.framework};
        case "SET_USER_ID":
            return {...state, userID: action.payload.userID};
        case "SET_GRAPH_STYLES":
            return {...state, graphStyles: action.payload.graphStyles};
        case "SET_GRAPH_LAYOUT_SPACING":
            return {...state, graphLayoutSpacing: action.payload.graphLayoutSpacing};
        case "SET_DATASET_ANALYSIS":
            return {...state, datasetAnalysis: action.payload.datasetAnalysis};
        default:
            break;
    }
};

export default function AppContextProvider({children}) {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <AppContext.Provider value={{state, dispatch}}>
            {children}
        </AppContext.Provider>
    );
}