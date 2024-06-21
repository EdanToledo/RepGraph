import React, {useContext} from "react";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import {Link, useHistory} from "react-router-dom";
import TextField from '@material-ui/core/TextField';

import {
    Grid,
    Typography
} from "@material-ui/core";

import {AppContext} from "../../Store/AppContextProvider.js";

import {Virtuoso} from "react-virtuoso";

import {layoutHierarchy, determineAdjacentLinks} from "../../LayoutAlgorithms/layoutHierarchy";
import {layoutTree} from "../../LayoutAlgorithms/layoutTree";
import {layoutFlat} from "../../LayoutAlgorithms/layoutFlat";

const styles = {
    Paper: {
        padding: 20,
        marginBottom: 10,
        height: "100%",
        overflow: "auto"
    },
    SentencePaper: {
        height: 300,
        overflow: "auto"
    }
};
/*Component that shows the uploaded sentences to the user in a virtualized list component and allows the user to select one.*/
export default function SentenceList(props) {
    const {state, dispatch} = useContext(AppContext);
    const [currentDataSet, setCurrentDataSet] = React.useState(state.dataSet);
    const history = useHistory();

    function handleSelectSentence(sentenceId) {
        //Request formatted sentence data from the back-end
        //Set the Context state accordingly through dispatch
        let myHeaders = new Headers();
        myHeaders.append("X-USER", state.userID);

        let requestOptions = {
            method: 'GET',
            headers : myHeaders,
            redirect: 'follow'
        };
        props.closeSelectSentence(); //Close the dialog
        dispatch({type: "SET_LOADING", payload: {isLoading: true}}); //Show the loading animation


        fetch(state.APIendpoint + "/GetGraph?graphID=" + sentenceId, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw "Response not OK";
                }
                return response.text();
            })
            .then((result) => {
                const jsonResult = JSON.parse(result);

                //Update the global state:

                let graphData = null;

                switch (state.visualisationFormat) {
                    case "1":
                        graphData = layoutHierarchy(jsonResult, state.graphLayoutSpacing, state.framework);
                        break;
                    case "2":
                        graphData = layoutTree(jsonResult,state.graphLayoutSpacing, state.framework);
                        break;
                    case "3":
                        graphData = layoutFlat(jsonResult, false, state.graphLayoutSpacing, state.framework);
                        break;
                    default:
                        graphData = layoutHierarchy(jsonResult, state.graphLayoutSpacing, state.framework);
                        break;
                }

                dispatch({type: "SET_SENTENCE_GRAPHDATA", payload: {selectedSentenceGraphData: jsonResult}});
                dispatch({type: "SET_SENTENCE_VISUALISATION", payload: {selectedSentenceVisualisation: graphData}});
                dispatch({type: "SET_SELECTED_SENTENCE_ID", payload: {selectedSentenceID: jsonResult.id}});
                dispatch({type: "SET_TEST_RESULTS", payload: {testResults: null}});
                dispatch({type: "SET_LOADING", payload: {isLoading: false}});
            })
            .catch((error) => {
                dispatch({type: "SET_LOADING", payload: {isLoading: false}});
                console.log("error", error);
                history.push("/404");
            });
    }


    function search(value) {
        let found = [];
        for (let x of state.dataSet) {

            if (x.input.toLowerCase().includes(value.toLowerCase().trim()) || x.id.includes(value.trim())) {
                found.push(x);
            }
        }

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
                <Grid item style={{width: "100%"}}>
                    <TextField id="outlined-basic"
                               label="Search for a Sentence or ID"
                               variant="outlined"
                               onChange={e => (search(e.target.value))}
                               fullWidth
                    />
                </Grid>
                <Grid item style={{width: "100%"}}>
                    {state.dataSet === null ? (
                        <div>No data-set has been uploaded yet</div>
                    ) : (
                        <Virtuoso
                            style={{width: "100%", height: "400px"}}
                            totalCount={currentDataSet.length}
                            item={(index) => {
                                return (
                                    <ListItem button key={currentDataSet[index].id}
                                              onClick={() => handleSelectSentence(currentDataSet[index].id)}>
                                        <Typography color={"textPrimary"}>{currentDataSet[index].input}</Typography>
                                    </ListItem>
                                );
                            }}
                            footer={() => (
                                <div style={{padding: "1rem", textAlign: "center"}}>
                                    <Typography color={"textPrimary"}>
                                        -- end of dataset --
                                    </Typography>
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
