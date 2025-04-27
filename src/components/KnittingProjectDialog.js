import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    Box,
    Typography,
    CircularProgress
} from '@mui/material';
import FileUploader from './FileUploader'; 

const initialFormData = {
    name: '',
    pattern: '',
    status: 'Not Started',
    needleSize: '',
    yarn: '',
    notes: '',
    coverImageKey: '', 
    coverImageUrl: '' 
};

function KnittingProjectDialog({ open, onClose, onSave, project = null }) {
    const [formData, setFormData] = useState(initialFormData);
    const [isUploading, setIsUploading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);

    useEffect(() => {
        if (project) {
            setFormData(project);
        } else {
            setFormData(initialFormData);
        }
    }, [project, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileUpload = (fileData) => {
        setFormData(prev => ({
            ...prev,
            coverImageKey: fileData.key,
            coverImageUrl: fileData.url
        }));
    };

    const handleImageUploadSuccess = (file) => {
        setFormData(prev => ({
            ...prev,
            coverImageKey: file.key,
            coverImageUrl: file.location
        }));
        setImageUploading(false);
    };

    const handleImageUploadError = (error) => {
        console.error("Image upload error:", error);
        setImageUploading(false);
    };

    const handleSubmit = () => {
        onSave(formData);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{project ? 'Edit Project' : 'New Project'}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Project Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>Cover Image</Typography>

                        <FileUploader
                            onFileUpload={handleFileUpload}
                            onError={(msg) => console.error(msg)}
                            isLoading={isUploading}
                            setIsLoading={setIsUploading}
                        />

                        {formData.coverImageUrl && (
                            <Box mt={2} textAlign="center">
                                <img
                                    src={formData.coverImageUrl}
                                    alt="Cover"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '200px',
                                        objectFit: 'cover',
                                        borderRadius: '8px'
                                    }}
                                />
                            </Box>
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Pattern"
                            name="pattern"
                            value={formData.pattern}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <MenuItem value="Not Started">Not Started</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Completed">Completed</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Needle Size"
                            name="needleSize"
                            value={formData.needleSize}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Yarn"
                            name="yarn"
                            value={formData.yarn}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            multiline
                            rows={4}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={imageUploading}
                >
                    {imageUploading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default KnittingProjectDialog;