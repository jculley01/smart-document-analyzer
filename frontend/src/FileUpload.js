import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Snackbar, List, ListItem, ListItemText, IconButton, Card, CardContent } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete'; // Import the delete icon
import { useUser } from './UserContext.js';

const FileUpload = (props) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const { user } = useUser();

    const handleFileInput = (e) => {
        setSelectedFiles([...e.target.files]);
    };

    const handleRemoveFile = (indexToRemove) => {
        setSelectedFiles(selectedFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleFileUpload = async () => {
        if (selectedFiles.length === 0) {
            setSnackbarMessage('Please select a file first!');
            setSnackbarOpen(true);
            return;
        }
        if (!user || !user.sub) {
            setSnackbarMessage('No valid user ID found. Please log in again.');
            setSnackbarOpen(true);
            return;
        }

        setUploading(true);
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('file', file);
        });
        formData.append('userId', user.sub);

        try {
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData,
            });

            setUploading(false);

            if (response.ok) {
                const data = await response.json();
                setSnackbarMessage('Files successfully uploaded!');
                setSnackbarOpen(true);
                props.onUploadSuccess();
                console.log(data);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'File upload failed');
            }
        } catch (error) {
            console.error('Error uploading files:', error);
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
                Upload Files
            </Typography>
            <input
                accept="*/*"
                type="file"
                onChange={handleFileInput}
                style={{ display: 'none' }}
                id="upload-files"
                multiple
            />
            <label htmlFor="upload-files">
                <Button variant="contained" component="span" startIcon={<AttachFileIcon />} sx={{ mt: 2, mb: 2 }}>
                    Choose Files
                </Button>
            </label>
            {selectedFiles.length > 0 && (
                <Card sx={{ minWidth: 275, maxWidth: 500, margin: '20px auto' }}>
                    <CardContent>
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                            Selected Files
                        </Typography>
                        <List>
                            {Array.from(selectedFiles).map((file, index) => (
                                <ListItem
                                    key={index}
                                    secondaryAction={
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFile(index)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText primary={file.name} />
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            )}
            {uploading ? (
                <CircularProgress />
            ) : (
                <Button variant="contained" onClick={handleFileUpload} startIcon={<CloudUploadIcon />} disabled={selectedFiles.length === 0}>
                    Upload
                </Button>
            )}
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} message={snackbarMessage} />
        </Box>
    );
};

export default FileUpload;
