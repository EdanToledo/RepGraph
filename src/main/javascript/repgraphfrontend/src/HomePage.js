import React, {useState, useContext} from "react";
import {Card, Typography, Button, Grid} from "@material-ui/core";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import {Link, useHistory} from "react-router-dom";
import {DropzoneArea} from "material-ui-dropzone";
import {AppContext} from "./Store/AppContextProvider.js";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import ToggleButton from "@material-ui/lab/ToggleButton";
import uuid from 'react-uuid'

import {dmrsData, edsData, ptgData, uccaData, amrData} from "./Store/demoData";
import Box from "@material-ui/core/Box";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";

import { makeStyles, useTheme } from '@material-ui/core/styles';
import Tooltip from "@material-ui/core/Tooltip";

import Popover from 'material-ui-popup-state/HoverPopover'
import {
    usePopupState,
    bindHover,
    bindPopover,
} from 'material-ui-popup-state/hooks'

import {Link as  MaterialLink}from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: "column",
        alignItems: "center"

    },
    actions: {
        display: 'flex',
        flexDirection: "column",
        alignItems: "center"
    },
}));

export default function HomePage(props) {
    const [fileObjects, setFileObjects] = useState([]);
    const [open, setOpen] = React.useState(false);
    const history = useHistory();
    const [framework, setFramework] = useState("1");
    const {state, dispatch} = useContext(AppContext);

    const classes = useStyles();
    const theme = useTheme();

    const popupStateSkip = usePopupState({
        variant: 'popover',
        popupId: 'skipPopover',
    })

    const popupStateFramework = usePopupState({
        variant: 'popover',
        popupId: 'frameworkPopover',
    })


    //Handle close for the alert shown to user
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    //Handle change when user selects a file
    function handleChange(files) {
        setFileObjects([...files]);
    }

    function handleUpload() {
        let userID = uuid();
        dispatch({type: "SET_USER_ID", payload: {userID: userID}}); //Show loading animation while awaiting response

        if (fileObjects.length > 0) {
            let formData = new FormData();

            formData.append("data", fileObjects[0]);

            let myHeaders = new Headers();
            myHeaders.append("X-USER", userID);

            let requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: formData,
                redirect: "follow"
            };

            dispatch({type: "SET_LOADING", payload: {isLoading: true}}); //Show loading animation while awaiting response

            //Upload the file chosen by the user
            fetch(
                state.APIendpoint + "/UploadData?FileName=SupremeLeaderJanBuys&Framework=" + state.framework,
                requestOptions
            )
                .then((response) => {
                    console.log(response);
                    if (!response.ok) {
                        throw "Uploaded File Response not OK";
                    }
                    return response.text();
                })
                .then((result) => {
                    const jsonResult = JSON.parse(result);
                    console.log(jsonResult); //Debugging
                    console.log(jsonResult.response); //Debugging

                    dispatch({type: "SET_DATASET", payload: {dataSet: jsonResult.data}}); //Store the data-set (ids and inputs stored in backend)
                    dispatch({type: "SET_DATASET_FILENAME", payload: {dataSetFileName: fileObjects[0].name}}); //store name of data-set uploaded
                    dispatch({type: "SET_DATASET_RESPONSE", payload: {dataSetResponse: jsonResult.response}}); //store response from back-end

                    //Reset state data for new dataset
                    dispatch({type: "SET_SENTENCE_GRAPHDATA", payload: {selectedSentenceGraphData: null}});
                    dispatch({type: "SET_SENTENCE_VISUALISATION", payload: {selectedSentenceVisualisation: null}});
                    dispatch({type: "SET_SELECTED_SENTENCE_ID", payload: {selectedSentenceID: null}});
                    dispatch({type: "SET_DATASET_ANALYSIS", payload: {datasetAnalysis: null}});


                    dispatch({type: "SET_LOADING", payload: {isLoading: false}}); //Stop the loading animation


                    // if(framework === "5"){
                    //     request_AMR_align(userID);
                    // }else{
                    //     request_Token_Process(userID);
                    // }


                    history.push("/main"); //Take user to the main page

                })
                .catch((error) => {
                    console.log("error", error);
                    dispatch({type: "SET_LOADING", payload: {isLoading: false}});
                    history.push("/404"); //Take user to error page
                });
        } else {
            setOpen(true);
        }
    }

    const request_Token_Process = (userID) =>{

            let myHeaders = new Headers();
            myHeaders.append("X-USER", userID);

            let requestOptions = {
                method: 'PATCH',
                headers: myHeaders,
                redirect: 'follow'
            };

            fetch(state.APIendpoint+"/ParseTokens", requestOptions)
                .then(response => response.text())
                .then(result => console.log(result))
                .catch(error => console.log('error', error));

    }

    const request_AMR_align = (userID) =>{

            let myHeaders = new Headers();
            myHeaders.append("X-USER", userID);

            let requestOptions = {
                method: 'PATCH',
                headers: myHeaders,
                redirect: 'follow'
            };

            fetch(state.APIendpoint+"/AlignAMR", requestOptions)
                .then(response => response.text())
                .then(result => console.log(result))
                .catch(error => console.log('error', error));

    }

    function handleSkip() {

        let userID = uuid();
        dispatch({type: "SET_USER_ID", payload: {userID: userID}}); //Show loading animation while awaiting response

        let myHeaders = new Headers();
        myHeaders.append("X-USER", userID);
        myHeaders.append("Content-Type", "application/json");

        let raw = null;
        let dataSetFileName = null;

        switch (framework) {
            case "1":
                raw = JSON.stringify({"data": dmrsData});
                dataSetFileName = "DMRS Demo Data";
                break;
            case "2":
                raw = JSON.stringify({"data": edsData});
                dataSetFileName = "EDS Demo Data";
                break;
            case "3":
                raw = JSON.stringify({"data": ptgData});
                dataSetFileName = "PTG Demo Data";
                break;
            case "4":
                raw = JSON.stringify({"data": uccaData});
                dataSetFileName = "UCCA Demo Data";
                break;
            case "5":
                raw = JSON.stringify({"data": amrData});
                dataSetFileName = "AMR Demo Data";
                break;
        }

        let requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        dispatch({type: "SET_LOADING", payload: {isLoading: true}}); //Show loading animation while awaiting response

        fetch(state.APIendpoint+"/UploadDemo?Framework="+ framework, requestOptions)
            .then((response) => {
                        console.log(response);
                        if (!response.ok) {
                            throw "Uploaded File Response not OK";
                        }
                        return response.text();
                    })
            .then((result) => {
                    const jsonResult = JSON.parse(result);
                    console.log(jsonResult); //Debugging


                    dispatch({type: "SET_DATASET", payload: {dataSet: jsonResult.data}}); //Store the data-set (ids and inputs stored in backend)
                    dispatch({type: "SET_DATASET_FILENAME", payload: {dataSetFileName: dataSetFileName}}); //store name of data-set uploaded
                    dispatch({type: "SET_DATASET_RESPONSE", payload: {dataSetResponse: jsonResult.response}}); //store response from back-end

                    dispatch({type: "SET_SENTENCE_GRAPHDATA", payload: {selectedSentenceGraphData: null}});
                    dispatch({type: "SET_SENTENCE_VISUALISATION", payload: {selectedSentenceVisualisation: null}});
                    dispatch({type: "SET_SELECTED_SENTENCE_ID", payload: {selectedSentenceID: null}});
                    dispatch({type: "SET_DATASET_ANALYSIS", payload: {datasetAnalysis: null}});

                    dispatch({type: "SET_LOADING", payload: {isLoading: false}}); //Stop the loading animation
                    history.push("/main"); //Take user to the main page

                }).catch((error) => {
                        console.log("error", error);
                        dispatch({type: "SET_LOADING", payload: {isLoading: false}});
                        history.push("/404"); //Take user to error page
                    });

    }

    const handleFormatChange = (event, newFormat) => {
        if (newFormat !== null) {
            setFramework(newFormat);
            dispatch({type: "SET_FRAMEWORK", payload: {framework: newFormat}}); //Show loading animation while awaiting response
        }
    }

    const preventDefault = (event) => event.preventDefault();

    return (

        // <Box height="100vh" bgcolor="grey.300" style={{border:"1px solid red"}}/>
        <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            style={{height:"100vh"}}
        >
            <Card raised={false} elevation={0}>
                <CardContent className={classes.root}>
                    <Grid container
                          direction="column"
                          justify="center"
                          alignItems="center"
                    spacing={2}>
                        <Grid item>
                            <Typography color="primary" component="div">
                                <Box  fontWeight={500} m={1} fontSize="h2.fontSize">
                                Welcome to RepGraph
                                </Box>
                            </Typography>
                        </Grid>
                        <Grid item>
                            <ToggleButtonGroup
                                value={framework}
                                exclusive
                                onChange={handleFormatChange}
                                aria-label="Framework formats"
                                {...bindHover(popupStateFramework)}
                            >
                                <ToggleButton color="primary" value="1" aria-label="DMRS">
                                    <Typography color="textPrimary">DMRS</Typography>
                                </ToggleButton>
                                <ToggleButton color="primary" value="2" aria-label="EDS">
                                    <Typography color="textPrimary">EDS</Typography>
                                </ToggleButton>
                                <ToggleButton color="primary" value="3" aria-label="PTG">
                                    <Typography color="textPrimary">PTG</Typography>
                                </ToggleButton>
                                <ToggleButton color="primary" value="4" aria-label="UCCA">
                                    <Typography color="textPrimary">UCCA</Typography>
                                </ToggleButton>
                                <ToggleButton color="primary" value="5" aria-label="AMR">
                                    <Typography color="textPrimary">AMR</Typography>
                                </ToggleButton>
                            </ToggleButtonGroup>
                                <Popover
                                    {...bindPopover(popupStateFramework)}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'center',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'center',
                                    }}
                                    disableRestoreFocus
                                >
                                    <Typography style={{ margin: 10 }}>
                                        <MaterialLink rel="noopener noreferrer" href="http://mrp.nlpl.eu/2020/index.php?page=14" target="_blank">
                                        Select your desired MRP 2020 framework that uses the Uniform Graph Interchange Format.
                                        </MaterialLink>
                                    </Typography>
                                </Popover>
                        </Grid>
                        <Grid item>
                            <Typography variant="h5">Please upload a data-set to begin</Typography>
                        </Grid>
                        <Grid item style={{width:"100%"}}>
                            <DropzoneArea
                                acceptedFiles={[".dmrs", ".eds", ".amr", ".ptg", ".ucca", ".mrp"]}
                                dropzoneText={"Drag and drop"}
                                icon={<CloudUploadIcon/>}
                                filesLimit={1}
                                onChange={(files) => {

                                    handleChange(files);
                                }}

                                onDelete={() => {setFileObjects([]);}}
                            />
                        </Grid>
                        <Grid item>
                            <Button onClick={handleUpload} color="primary" variant="contained" disableElevation
                                    startIcon={<CloudUploadIcon/>} size="large">Upload
                            </Button>
                        </Grid>
                        <Grid item>

                            <Button onClick={handleSkip} color="primary" variant="contained" disableElevation
                                    startIcon={<ArrowForwardIcon/>} size="large" {...bindHover(popupStateSkip)}>Skip and Use Demo Data
                            </Button>
                                <Popover
                                    {...bindPopover(popupStateSkip)}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'center',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'center',
                                    }}
                                    disableRestoreFocus
                                >
                                    <Typography style={{ margin: 10 }} color="primary">
                                        A Demo MRP Data-set for the Selected Framework Will Be Uploaded for You.
                                    </Typography>
                                </Popover>

                        </Grid>


                    </Grid>

                </CardContent>
            </Card>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <MuiAlert elevation={6} variant="filled" onClose={handleClose} severity="warning">
                    Please select a data-set first.
                </MuiAlert>
            </Snackbar>
        </Grid>
    );
}
