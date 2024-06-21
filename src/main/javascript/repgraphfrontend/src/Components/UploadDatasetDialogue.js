import {DropzoneDialogBase} from "material-ui-dropzone";
import React from "react";
import Button from "@material-ui/core/Button";
import CloudUploadRoundedIcon from '@material-ui/icons/CloudUploadRounded';

function DropZoneUploadDataset(props){
    const [open, setOpen] = React.useState(false);
    const [fileObjects, setFileObjects] = React.useState([]);

    return (<div>
        <Button color="inherit" onClick={() => setOpen(true)}>
            Upload a Data-set
        </Button>
        <DropzoneDialogBase
            acceptedFiles={['.dmrs']}
            fileObjects={fileObjects}
            cancelButtonText={"cancel"}
            submitButtonText={"submit"}
            maxFileSize={5000000}
            open={open}
            onAdd={newFileObjs => {

                setFileObjects([].concat(fileObjects, newFileObjs));
            }}
            onDelete={deleteFileObj => {

            }}
            onClose={() => {
                setOpen(false)}}
            onSave={() => {
                //Fired when the user clicks the Submit button
                props.handleUploadDataset(fileObjects[0]);

                setOpen(false);}}
            showPreviews={true}
            showFileNamesInPreview={true}
        />
    </div>);
}

export default DropZoneUploadDataset;