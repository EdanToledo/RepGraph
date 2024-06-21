import React, {useContext} from 'react';
import Grid from "@material-ui/core/Grid";
import {makeStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import LocationSearchingIcon from '@material-ui/icons/LocationSearching';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import {AppContext} from "../../Store/AppContextProvider.js";
import {useHistory} from "react-router-dom";
import CompareTwoGraphsVisualisation from "../Main/CompareTwoGraphsVisualisation";
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import InfoIcon from '@material-ui/icons/Info';
import IconButton from "@material-ui/core/IconButton";
import PopupState, {bindPopover, bindPopper, bindToggle, bindTrigger} from "material-ui-popup-state";
import Popper from "@material-ui/core/Popper";
import Fade from "@material-ui/core/Fade";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Popover from "@material-ui/core/Popover";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles((theme) => ({
    root: {
        height: "100%"
    }
}));

function CompareTwoGraphsTool(props) {
    const {state, dispatch} = useContext(AppContext); //Provide access to global state
    const history = useHistory();
    const [open, setOpen] = React.useState(false);


    //Handle click open for dialog
    const handleClickOpen = () => {
        setOpen(true);
    };

    //Handle close for dialog
    const handleClose = () => {
        setOpen(false);
    };

    const classes = useStyles(); //Use styles created above

    return (
        <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            className={classes.root}
        >
            <Button
                variant="contained" color="primary" disableElevation onClick={handleClickOpen}
                endIcon={<CompareArrowsIcon/>}
                disabled={state.dataSet === null}
            >
                Compare Two Graphs
            </Button>

            <Dialog
                open={open}
                fullWidth={true}
                maxWidth="xl"
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Compare Two Graphs"}
                    <PopupState variant="popover" popupId="demo-popup-popover">
                        {(popupState) => (
                            <>
                                <IconButton color="primary" component="span" {...bindTrigger(popupState)}>
                                    <InfoIcon/>
                                </IconButton>
                                <Popover
                                    {...bindPopover(popupState)}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                >
                                    <Box p={2} width={"50vw"}>
                                        <Typography>Non-strict comparison simply compares node labels and their respective edges, whereas strict comparison compares each node's labels and the phrase they span for equality.</Typography>
                                    </Box>
                                </Popover>
                            </>
                        )}
                    </PopupState>

                </DialogTitle>
                <DialogContent>
                    <CompareTwoGraphsVisualisation/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="contained" color="primary" disableElevation autoFocus>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );

}

export default CompareTwoGraphsTool;
