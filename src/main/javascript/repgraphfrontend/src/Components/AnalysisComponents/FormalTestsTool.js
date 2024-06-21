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

function FormalTestsTool(props) {
    const {state, dispatch} = useContext(AppContext); //Provide access to global state
    const history = useHistory(); //Provide access to router history

    const classes = useStyles(); //Use styles created above
    //Local state for checkboxes of which tests to perform
    const [tests, setTests] = React.useState({
        planar: false,
        connected: false,
        longestPathDirected: false,
        longestPathUndirected: false
    });

    //Handle change to checkboxes for formal tests
    const handleChange = (event) => {
        setTests({...tests, [event.target.name]: event.target.checked});
    };

    //Handle request to perform formal tests
    function handleFormalTests() {
        let myHeaders = new Headers();
        myHeaders.append("X-USER", state.userID);
        let requestOptions = {
            method: 'GET',
            headers : myHeaders,
            redirect: 'follow'
        };

        dispatch({type: "SET_LOADING", payload: {isLoading: true}}); //Show loading animation

        //Fetch formal test results from backend
        fetch(state.APIendpoint + "/TestGraph?graphID=" + state.selectedSentenceID + "&planar=" + tests.planar + "&connected=" + tests.connected + "&longestPathDirected=" + tests.longestPathDirected + "&longestPathUndirected=" + tests.longestPathUndirected , requestOptions)
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
                dispatch({type: "SET_TEST_RESULTS", payload: {testResults: jsonResult}}); //Store the test results in global state
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
                <FormLabel component="legend"><Typography color={"textPrimary"}> Graph Properties: </Typography></FormLabel>
                <FormGroup>
                    <FormControlLabel
                        control={<Checkbox checked={tests.planar} onChange={handleChange} color="secondary"
                                           name="planar"/>}
                        label={<Typography color={"textPrimary"}> Graph Planar?</Typography>}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={tests.connected} onChange={handleChange} color="secondary"
                                           name="connected"/>}
                        label={<Typography color={"textPrimary"}> Graph Connected?</Typography>}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={tests.longestPathDirected} onChange={handleChange} color="secondary"
                                           name="longestPathDirected"/>}

                        label={<Typography color={"textPrimary"}> Find The Longest Directed Path</Typography>}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={tests.longestPathUndirected} onChange={handleChange}
                                           color="secondary" name="longestPathUndirected"/>}
                        label={<Typography color={"textPrimary"}> Find The Longest Undirected Path</Typography>}
                    />
                    <Button
                        disabled={state.selectedSentenceID === null}
                        variant="contained"
                        color="primary"
                        disableElevation
                        endIcon={<ArrowForwardIcon/>}
                        onClick={() => {
                             //Debugging
                            handleFormalTests();
                        }}
                    >
                        Run Tests
                    </Button>
                </FormGroup>
                <FormHelperText/>
            </FormControl>
        </Grid>
    );

}

export default FormalTestsTool;
