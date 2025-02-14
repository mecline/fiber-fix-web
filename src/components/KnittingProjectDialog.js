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
    Typography,
    Box
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';

function KnittingProjectDialog({ open, onClose, onSave, project = null }) {
    const [patternFile, setPatternFile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        pattern: '',
        status: 'Not Started',
        needleSize: '',
        yarn: '',
        notes: ''
    });

    useEffect(() => {
        if (project) {
            setFormData(project);
        }
    }, [project]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        onSave(formData, patternFile);
        onClose();
        setPatternFile(null);
    };

    const handleFileChange = (event) => {
        if (event.target.files[0]) {
            setPatternFile(event.target.files[0]);
        }
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
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<UploadIcon />}
                            >
                                Upload Pattern
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                            </Button>
                            {(patternFile || project?.patternFileName) && (
                                <Typography variant="body2">
                                    {patternFile ? patternFile.name : project.patternFileName}
                                </Typography>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default KnittingProjectDialog;
