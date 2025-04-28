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
    CircularProgress,
    Divider
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
    coverImageUrl: '',
    patternDocKey: '',
    patternDocUrl: ''
};

function KnittingProjectDialog({ open, onClose, onSave, project = null }) {
    const [formData, setFormData] = useState(initialFormData);
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [isPatternUploading, setIsPatternUploading] = useState(false);

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

    const handleImageUpload = (fileData) => {
        setFormData(prev => ({
            ...prev,
            coverImageKey: fileData.key,
            coverImageUrl: fileData.url
        }));
    };
    
    // Add a new handler for pattern documents
    const handlePatternUpload = (fileData) => {
        setFormData(prev => ({
            ...prev,
            patternDocKey: fileData.key,
            patternDocUrl: fileData.url,
            // You might want to update the pattern name based on the file name
            pattern: fileData.name || prev.pattern
        }));
    };

    const handleSubmit = () => {
        onSave(formData);
        onClose();
    };

    // Define accepted file types
    const imageFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const patternFileTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'text/plain'
    ];

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
                            onFileUpload={handleImageUpload}
                            onError={(msg) => console.error(msg)}
                            isLoading={isImageUploading}
                            setIsLoading={setIsImageUploading}
                            fileType="image"
                            acceptedFileTypes={imageFileTypes}
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
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle1" gutterBottom>Pattern Document</Typography>
                        <FileUploader
                            onFileUpload={handlePatternUpload}
                            onError={(msg) => console.error(msg)}
                            isLoading={isPatternUploading}
                            setIsLoading={setIsPatternUploading}
                            fileType="pattern"
                            acceptedFileTypes={patternFileTypes}
                        />
                        
                        {formData.patternDocUrl && (
                            <Box mt={2} textAlign="center">
                                <Typography variant="body2">
                                    Pattern file: {formData.pattern}
                                </Typography>
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    href={formData.patternDocUrl} 
                                    target="_blank"
                                    sx={{ mt: 1 }}
                                >
                                    View Document
                                </Button>
                            </Box>
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Pattern Name/Link"
                            name="pattern"
                            value={formData.pattern}
                            onChange={handleChange}
                            helperText="Enter pattern name or link. This will be updated if you upload a pattern document."
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
                    disabled={isImageUploading || isPatternUploading}
                >
                    {(isImageUploading || isPatternUploading) ? <CircularProgress size={24} /> : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default KnittingProjectDialog;