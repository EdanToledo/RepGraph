import React, {useContext, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import InboxIcon from "@material-ui/icons/Inbox";
import DraftsIcon from "@material-ui/icons/Drafts";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Grid from "@material-ui/core/Grid";

import MaskedInput from "react-text-mask";
import PropTypes from "prop-types";
import Input from "@material-ui/core/Input";

import {RgbaStringColorPicker} from "react-colorful";
import {Typography} from "@material-ui/core";

import ColorizeIcon from "@material-ui/icons/Colorize";

import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import NumberFormat from "react-number-format";

import LinearScaleIcon from "@material-ui/icons/LinearScale";
import FormatLineSpacingIcon from "@material-ui/icons/FormatLineSpacing";
import VerticalAlignBottomIcon from "@material-ui/icons/VerticalAlignBottom";
import {mdiArrowExpandHorizontal, mdiArrowExpandVertical} from "@mdi/js";
import Icon from "@mdi/react";
import {AppContext, defaultGraphStyles, defaultGraphLayoutSpacing} from "../../Store/AppContextProvider";
import {useHistory} from "react-router-dom";
import Button from "@material-ui/core/Button";
import {layoutHierarchy} from "../../LayoutAlgorithms/layoutHierarchy";
import {layoutTree} from "../../LayoutAlgorithms/layoutTree";
import {layoutFlat} from "../../LayoutAlgorithms/layoutFlat";
import ButtonGroup from "@material-ui/core/ButtonGroup";

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
        backgroundColour: theme.palette.background.paper
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular
    }
}));

const styleCodes = {
    general: {
        backgroundColour: "Background Colour"
    },
    nodeStyles: {
        abstractNodeColour: "Abstract Node Colour",
        surfaceNodeColour: "Surface Node Colour",
        abstractNodeHoverColour: "Abstract Node Hover Colour",
        surfaceNodeHoverColour: "Surface Node Hover Colour",
        dummyNodeColour: "Dummy Node Colour",
        topNodeColour: "Top Node Colour",
        topNodeHoverColour: "Top Node Hover Colour",
        spanColour: "Span Colour",
        selectedColour: "Selected Colour",
        labelColour: "Label Colour"
    },
    linkStyles: {
        linkColour: "Edge Colour",
        hoverColour: "Hover Colour",
        selectedColour: "Selected Colour",
    },
    tokenStyles: {
        tokenColour: "Token Colour",
        hoverColour: "Hover Colour",
        selectedColour: "Selected Colour",
        labelColour: "Label Colour",
    },
    spacings: {
        nodeHeight: "Node Height",
        nodeWidth: "Node Width",
        interLevelSpacing: "Inter-level Spacing",
        intraLevelSpacing: "Intra-level Spacing",
        tokenLevelSpacing: "Token Level Spacing"
    }
}

const hexRegEx = /[a-fA-F0-9]/;

///^rgba\((\d{1,3}%?),\s*(\d{1,3}%?),\s*(\d{1,3}%?),\s*(\d*(?:\.\d+)?)\)$/

const rgbaRegEx = /\b(1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\b/g;

function HexTextMask(props) {
    const {inputRef, ...other} = props;

    return (
        <MaskedInput
            {...other}
            ref={(ref) => {
                inputRef(ref ? ref.inputElement : null);
            }}
            mask={[hexRegEx, hexRegEx, hexRegEx, hexRegEx, hexRegEx]}
        />
    );
}

//[hexRegEx, hexRegEx, hexRegEx, hexRegEx, hexRegEx]

// <TextField inputProps={{ pattern: "[a-z]" }} />

// [
//   "rgba(",
//   rgbaRegEx,
//   ",",
//   rgbaRegEx,
//   ",",
//   rgbaRegEx,
//   ",",
//   /^(?:0*(?:\.\d+)?|1(\.0*)?)$/gm,
//   ")"
// ];

//rgba(0,172,237,1)

HexTextMask.propTypes = {
    inputRef: PropTypes.func.isRequired
};

function NumberFormatSpacingInput(props) {
    const {inputRef, onChange, ...other} = props;

    return (
        <NumberFormat
            {...other}
            getInputRef={inputRef}
            onValueChange={(values) => {
                onChange({
                    target: {
                        name: props.name,
                        value: values.value
                    }
                });
            }}
            allowNegative={false}
        />
    );
}

NumberFormatSpacingInput.propTypes = {
    inputRef: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

function NumberFormatDecimalInput(props) {
    const {inputRef, onChange, ...other} = props;

    return (
        <NumberFormat
            {...other}
            getInputRef={inputRef}
            onValueChange={(values) => {
                onChange({
                    target: {
                        name: props.name,
                        value: values.value
                    }
                });
            }}
            allowNegative={false}
            decimalScale={2}
        />
    );
}

NumberFormatSpacingInput.propTypes = {
    inputRef: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

const NumberInput = (props) => {
    const {name, values, onChange} = props;

    return (
        <TextField
            {...props}
            value={values[name]}
            onChange={onChange}
            name={name}
            InputProps={{
                inputComponent: NumberFormatSpacingInput,
                inputProps: {
                    min: 0
                }
            }}
        />
    );
};

const RgbaInput = (props) => {
    const {name, values, onChange} = props;

    return (
        <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="center"
            spacing={2}
        >
            <Grid item>
                <NumberInput label={"R"} {...props} />
            </Grid>
            <Grid item>
                <NumberInput label={"G"} {...props} />
            </Grid>
            <Grid item>
                <NumberInput label={"B"} {...props} />
            </Grid>
        </Grid>
    );
};

const MaskedColourPicker = (props) => {
    const {name, values, onChange} = props;

    const handleChange = (value) => {
        onChange({target: {name, value}});
    };

    return (
        <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            spacing={2}
        >
            <Grid item>
                <RgbaStringColorPicker
                    color={values[name]}
                    onChange={handleChange}
                />
            </Grid>
            {/* <Grid item>
        <Input
          name={name}
          value={values[name]}
          onChange={onChange}
          inputComponent={HexTextMask}
        />
      </Grid> */}
        </Grid>
    );
};

const graphSpacingIcons = {
    nodeHeight: <Icon path={mdiArrowExpandVertical} size={1}/>,
    nodeWidth: <Icon path={mdiArrowExpandHorizontal} size={1}/>,
    interLevelSpacing: <FormatLineSpacingIcon/>,
    intraLevelSpacing: <LinearScaleIcon/>,
    tokenLevelSpacing: <VerticalAlignBottomIcon/>
};


export default function SettingsTool() {
    const classes = useStyles();
    const {state, dispatch} = useContext(AppContext); //Provide access to global state
    const history = useHistory(); //Use routing history

    const [valuesNodes, setValuesNodes] = useState(state.graphStyles.nodeStyles);

    const [valuesLinks, setValuesLinks] = useState(state.graphStyles.linkStyles);

    const [valuesTokens, setValuesTokens] = useState(state.graphStyles.tokenStyles);

    const [valuesGraphSpacing, setValuesGraphSpacing] = useState(state.graphLayoutSpacing);

    const [valuesGeneral, setValuesGeneral] = useState(state.graphStyles.general);

    const handleChangeNodes = (event) => {
        setValuesNodes({
            ...valuesNodes,
            [event.target.name]: event.target.value
        });

        dispatch({
            type: "SET_GRAPH_STYLES",
            payload: {
                graphStyles: {
                    ...state.graphStyles,
                    nodeStyles: {
                        ...valuesNodes,
                        [event.target.name]: event.target.value
                    }
                }
            }
        });

        handleUpdateStyles(valuesGraphSpacing);
    };

    const handleChangeTokens = (event) => {
        setValuesTokens({
            ...valuesTokens,
            [event.target.name]: event.target.value
        });

        dispatch({
            type: "SET_GRAPH_STYLES",
            payload: {
                graphStyles: {
                    ...state.graphStyles,
                    tokenStyles: {
                        ...valuesTokens,
                        [event.target.name]: event.target.value
                    }
                }
            }
        });
        handleUpdateStyles(valuesGraphSpacing);
    };

    const handleChangeLinks = (event) => {
        setValuesLinks({
            ...valuesLinks,
            [event.target.name]: event.target.value
        });

        dispatch({
            type: "SET_GRAPH_STYLES",
            payload: {
                graphStyles: {
                    ...state.graphStyles,
                    linkStyles: {
                        ...valuesLinks,
                        [event.target.name]: event.target.value
                    }
                }
            }
        });
        handleUpdateStyles(valuesGraphSpacing);
    };

    const handleChangeGeneral = (event) => {
        setValuesGeneral({
            ...valuesGeneral,
            [event.target.name]: event.target.value
        });

        dispatch({
            type: "SET_GRAPH_STYLES",
            payload: {
                graphStyles: {
                    ...state.graphStyles,
                    general: {
                        ...valuesGeneral,
                        [event.target.name]: event.target.value
                    }
                }
            }
        });
        handleUpdateStyles(valuesGraphSpacing);
    };

    const handleChangeGraphSpacing = (event) => {

        const parsedValue = parseInt(event.target.value);
        const newValue = isNaN(parsedValue) ? 0 : parsedValue;

        setValuesGraphSpacing({
            ...valuesGraphSpacing,
            [event.target.name]: newValue
        });


        dispatch({
            type: "SET_GRAPH_LAYOUT_SPACING",
            payload: {
                graphLayoutSpacing: {
                    ...valuesGraphSpacing,
                    [event.target.name]: newValue
                }
            }
        });

        handleUpdateStyles({
            ...valuesGraphSpacing,
            [event.target.name]: newValue
        });
    };

    const handleUpdateStyles = (newSpacing) => {

        if (state.selectedSentenceID) {

            let graphData = null;

            switch (state.visualisationFormat) {
                case "1":
                    graphData = layoutHierarchy(state.selectedSentenceGraphData, newSpacing, state.framework);
                    break;
                case "2":
                    graphData = layoutTree(state.selectedSentenceGraphData, newSpacing, state.framework);
                    break;
                case "3":
                    graphData = layoutFlat(state.selectedSentenceGraphData, false, newSpacing, state.framework);
                    break;
                default:
                    graphData = layoutHierarchy(state.selectedSentenceGraphData, newSpacing, state.framework);
                    break;
            }

            dispatch({type: "SET_SENTENCE_VISUALISATION", payload: {selectedSentenceVisualisation: graphData}});
        }
    }

    const handleResetDefaultGraphStyles = () => {
        setValuesNodes(defaultGraphStyles.nodeStyles);
        setValuesLinks(defaultGraphStyles.linkStyles);
        setValuesTokens(defaultGraphStyles.tokenStyles);
        setValuesGeneral(defaultGraphStyles.general)

        dispatch({
            type: "SET_GRAPH_STYLES",
            payload: {
                graphStyles: defaultGraphStyles
            }
        });

        if (state.selectedSentenceID) {
            let graphData = null;

            switch (state.visualisationFormat) {
                case "1":
                    graphData = layoutHierarchy(state.selectedSentenceGraphData, valuesGraphSpacing, state.framework);
                    break;
                case "2":
                    graphData = layoutTree(state.selectedSentenceGraphData, valuesGraphSpacing, state.framework);
                    break;
                case "3":
                    graphData = layoutFlat(state.selectedSentenceGraphData, false, valuesGraphSpacing, state.framework);
                    break;
                default:
                    graphData = layoutHierarchy(state.selectedSentenceGraphData, valuesGraphSpacing, state.framework);
                    break;
            }

            dispatch({type: "SET_SENTENCE_VISUALISATION", payload: {selectedSentenceVisualisation: graphData}});
        }
    }

    const handleResetGraphLayoutSpacing = () => {
        setValuesGraphSpacing(defaultGraphLayoutSpacing);

        dispatch({
            type: "SET_GRAPH_LAYOUT_SPACING",
            payload: {
                graphLayoutSpacing: defaultGraphLayoutSpacing
            }
        });

        if (state.selectedSentenceID) {
            let graphData = null;

            switch (state.visualisationFormat) {
                case "1":
                    graphData = layoutHierarchy(state.selectedSentenceGraphData, defaultGraphLayoutSpacing, state.framework);
                    break;
                case "2":
                    graphData = layoutTree(state.selectedSentenceGraphData, defaultGraphLayoutSpacing, state.framework);
                    break;
                case "3":
                    graphData = layoutFlat(state.selectedSentenceGraphData, false, defaultGraphLayoutSpacing, state.framework);
                    break;
                default:
                    graphData = layoutHierarchy(state.selectedSentenceGraphData, defaultGraphLayoutSpacing, state.framework);
                    break;
            }

            dispatch({type: "SET_SENTENCE_VISUALISATION", payload: {selectedSentenceVisualisation: graphData}});
        }
    }

    return (
        <div className={classes.root}>
            <Grid
                container
                direction="column"
                justify="center"
                alignItems="center"
                style={{width: "100%"}}
            >

                <Grid item style={{width: "100%"}}>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon/>}
                        >
                            <Typography className={classes.heading}>Node Styles</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List
                                component="nav"
                                style={{width: "100%"}}
                            >
                                {Object.keys(valuesNodes).map((key, index) => (
                                    <ListItem key={`${key}${index}`}>
                                        <Grid
                                            container
                                            direction="column"
                                            justify="center"
                                            alignItems="center"
                                            spacing={2}
                                        >
                                            <Grid item>
                                                <ListItemIcon>
                                                    <ColorizeIcon/>
                                                </ListItemIcon>
                                            </Grid>
                                            <Grid item>
                                                <Typography>{styleCodes.nodeStyles[key]}</Typography>
                                            </Grid>
                                            <Grid item>
                                                <MaskedColourPicker
                                                    name={key}
                                                    values={valuesNodes}
                                                    onChange={handleChangeNodes}
                                                />
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon/>}
                        >
                            <Typography className={classes.heading}>Token Styles</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List
                                component="nav"
                                style={{width: "100%"}}
                            >
                                {Object.keys(valuesTokens).map((key, index) => (
                                    <ListItem key={`${key}${index}`}>
                                        <Grid
                                            container
                                            direction="column"
                                            justify="center"
                                            alignItems="center"
                                            spacing={2}
                                        >
                                            <Grid item>
                                                <ListItemIcon>
                                                    <ColorizeIcon/>
                                                </ListItemIcon>
                                            </Grid>
                                            <Grid item>
                                                <Typography>{styleCodes.tokenStyles[key]}</Typography>
                                            </Grid>
                                            <Grid item>
                                                <MaskedColourPicker
                                                    name={key}
                                                    values={valuesTokens}
                                                    onChange={handleChangeTokens}
                                                />
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon/>}
                        >
                            <Typography className={classes.heading}>Edge Styles</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List
                                component="nav"
                                style={{width: "100%"}}
                            >
                                {Object.keys(valuesLinks).map((key, index) => (
                                    <ListItem key={`${key}${index}`}>
                                        <Grid
                                            container
                                            direction="column"
                                            justify="center"
                                            alignItems="center"
                                            spacing={2}
                                        >
                                            <Grid item>
                                                <ListItemIcon>
                                                    <ColorizeIcon/>
                                                </ListItemIcon>
                                            </Grid>
                                            <Grid item>
                                                <Typography>{styleCodes.linkStyles[key]}</Typography>
                                            </Grid>
                                            <Grid item>
                                                <MaskedColourPicker
                                                    name={key}
                                                    values={valuesLinks}
                                                    onChange={handleChangeLinks}
                                                />
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon/>}
                        >
                            <Typography className={classes.heading}>
                                Graph Layout Spacing
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List
                                component="nav"
                                style={{width: "100%"}}
                            >
                                {Object.keys(valuesGraphSpacing).map((key, index) => (
                                    <ListItem key={`${key}${index}`}>
                                        <Grid
                                            container
                                            direction="column"
                                            justify="center"
                                            alignItems="center"
                                            spacing={1}
                                        >
                                            <Grid
                                                item
                                                container
                                                direction="row"
                                                justify="center"
                                                alignItems="center"
                                            >
                                                <Grid item>
                                                    <ListItemIcon>{graphSpacingIcons[key]}</ListItemIcon>
                                                </Grid>
                                                <Grid item>
                                                    <Typography>{styleCodes.spacings[key]}</Typography>
                                                </Grid>
                                            </Grid>
                                            <Grid item>
                                                <NumberInput
                                                    name={key}
                                                    values={valuesGraphSpacing}
                                                    onChange={handleChangeGraphSpacing}
                                                />
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon/>}
                        >
                            <Typography className={classes.heading}>General</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List
                                component="nav"
                                style={{width: "100%"}}
                            >
                                {Object.keys(valuesGeneral).map((key, index) => (
                                    <ListItem key={`${key}${index}`}>
                                        <Grid
                                            container
                                            direction="column"
                                            justify="center"
                                            alignItems="center"
                                            spacing={2}
                                        >
                                            <Grid item>
                                                <ListItemIcon>
                                                    <ColorizeIcon/>
                                                </ListItemIcon>
                                            </Grid>
                                            <Grid item>
                                                <Typography>{styleCodes.general[key]}</Typography>
                                            </Grid>
                                            <Grid item>
                                                <MaskedColourPicker
                                                    name={key}
                                                    values={valuesGeneral}
                                                    onChange={handleChangeGeneral}
                                                />
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
                <Grid item style={{marginTop: 10}}>
                    <ButtonGroup
                        orientation="vertical"
                        color="primary"
                        aria-label="vertical contained primary button group"
                        variant="contained"
                        disableElevation
                    >
                        <Button onClick={handleResetDefaultGraphStyles}>
                            Reset Graph Styles
                        </Button>
                        <Button onClick={handleResetGraphLayoutSpacing}>
                            Reset Graph Layout Spacing
                        </Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
        </div>
    );
}


