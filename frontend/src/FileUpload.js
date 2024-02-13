import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Snackbar } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const FileUpload = (props) => { // Explicitly include props here
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleFileInput = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            setSnackbarMessage('Please select a file first!');
            setSnackbarOpen(true);
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData,
            });

            setUploading(false);

            if (response.ok) {
                const data = await response.json();
                setSnackbarMessage('File successfully uploaded!');
                setSnackbarOpen(true);
                // Use props to access onUploadSuccess function
                props.onUploadSuccess(); // Call the function passed through props
                console.log(data);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'File upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setSnackbarMessage(error.message);
            setSnackbarOpen(true);
            setUploading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" gutterBottom>
                Upload File
            </Typography>
            <input
                accept="*/*"
                type="file"
                onChange={handleFileInput}
                style={{ display: 'none' }}
                id="upload-file"
            />
            <label htmlFor="upload-file">
                <Button variant="contained" component="span" startIcon={<AttachFileIcon />} sx={{ mt: 2, mb: 2 }}>
                    Choose File
                </Button>
            </label>
            {uploading ? (
                <CircularProgress />
            ) : (
                <Button variant="contained" onClick={handleFileUpload} startIcon={<CloudUploadIcon />} disabled={!selectedFile}>
                    Upload
                </Button>
            )}
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} message={snackbarMessage} />
        </Box>
    );
};

export default FileUpload;
