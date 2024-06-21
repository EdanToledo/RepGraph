import React, {useContext} from 'react';
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import FormHelperText from "@material-ui/core/FormHelperText";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from "@material-ui/core/styles";
import {AppContext} from "../../Store/AppContextProvider";
import {useHistory} from "react-router-dom";
import {Typography} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root: {
        height: "100%",
        width: "100%"
    }

}));

function DatasetAnalysisTool(props) {
    const {state, dispatch} = useContext(AppContext); //Provide access to global state
    const history = useHistory(); //Provide access to router history

    const classes = useStyles(); //Use styles created above
    //Local state for checkboxes of which tests to perform

    //Handle request to perform formal tests
    function handleDatasetAnalysis() {
        let myHeaders = new Headers();
        myHeaders.append("X-USER", state.userID);

        let requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        dispatch({type: "SET_LOADING", payload: {isLoading: true}});
        fetch(state.APIendpoint +"/GetModelAnalysis", requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw "Response not OK";
                }
                return response.text();
            })
            .then((result) => {
                const jsonResult = JSON.parse(result);
                 //Debugging
                dispatch({type: "SET_LOADING", payload: {isLoading: false}}); //Stop the loading animation
                dispatch({type: "SET_DATASET_ANALYSIS", payload: {datasetAnalysis: jsonResult}}); //Store the analysis results in global state
            })
            .catch((error) => {
                dispatch({type: "SET_LOADING", payload: {isLoading: false}}); //Stop the loading animation
                console.log("error", error); //Log the error to the console
                history.push("/404"); //Take the user to the error page
            });
    }

    return (
        <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            className={classes.root}
        >
            <FormControl component="fieldset">
                <FormLabel component="legend"><Typography color={"textPrimary"}> Dataset Analysis</Typography></FormLabel>
                    <Button
                        disabled={state.dataset === null}
                        variant="contained"
                        color="primary"
                        disableElevation
                        endIcon={<ArrowForwardIcon/>}
                        onClick={handleDatasetAnalysis}
                    >
                        Run Analysis
                    </Button>
                <FormHelperText/>
            </FormControl>
        </Grid>
    );

}

export default DatasetAnalysisTool;
