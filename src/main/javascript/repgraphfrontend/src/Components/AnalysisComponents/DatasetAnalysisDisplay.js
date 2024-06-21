import React from "react";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import {Button} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import {Tooltip, Typography} from "@material-ui/core";

import {cloneDeep} from "lodash";

import {AppContext} from "../../Store/AppContextProvider";
import LongestPathVisualisation from "../Main/LongestPathVisualisation";
import IconButton from "@material-ui/core/IconButton";
import InfoIcon from "@material-ui/icons/Info";
import Popover from "@material-ui/core/Popover";
import {ParentSize} from "@visx/responsive";
import {Graph} from "../Graph/Graph";
import {determineAdjacentLinks} from "../../LayoutAlgorithms/layoutHierarchy";
import {layoutFlat} from "../../LayoutAlgorithms/layoutFlat";
import {useHistory} from "react-router-dom";


const useStyles = makeStyles({
    table: {
        minWidth: 650
    },
    graphDiv: {
        height: "60vh",
        //border: "1px solid red",
        flex: "1",
        width: "100%"
    }
});

//Function to create row data for the formal tests results table
function createData(test, result) {
    return {test, result};
}

export default function DatasetAnalysisFormDisplay(props) {
    const classes = useStyles();

    const {state, dispatch} = React.useContext(AppContext); //Provide access to global state
    const response = state.datasetAnalysis; //Get the test results from the global state
    const history = useHistory(); //Provide access to router history

    let newRows = [];

    //Add the rows to the table of results - in consistent order
    try {
        const keys = Object.keys(response).sort();
        for (const newRow of keys) {
            if (newRow.includes("Total") || newRow.includes("Average")){
                newRows.push(createData(newRow, response[newRow]));
            }else{
                newRows.push(createData(newRow, response[newRow]+"%"));
            }

        }
    } catch (e) {
         //Log the error to the console
        history.push("/404"); //Take the user to the error page
    }

    return (
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Test</TableCell>
                        <TableCell align="right">Result</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {newRows.map((row) => (
                        <TableRow
                            hover
                            key={row.test}
                        >
                            <TableCell component="th" scope="row">
                                {row.test}
                            </TableCell>
                            <TableCell align="right">{JSON.stringify(row.result).replaceAll('"',"")}</TableCell>
                            <TableCell>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
