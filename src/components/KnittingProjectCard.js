import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

function KnittingProjectCard({ project, onEdit, onDelete }) {
    return (
        <Card sx={{ minWidth: 275, m: 1 }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    {project.name}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Pattern: {project.pattern || 'Not specified'}
                </Typography>
                <Typography variant="body2">
                    Status: {project.status}
                </Typography>
                <Typography variant="body2">
                    Needle Size: {project.needleSize}
                </Typography>
                <Typography variant="body2">
                    Yarn: {project.yarn}
                </Typography>
                {project.notes && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Notes: {project.notes}
                    </Typography>
                )}
            </CardContent>
            <CardActions>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => onEdit(project)}
                    >
                        Edit
                    </Button>
                    <Button 
                        size="small" 
                        color="error" 
                        startIcon={<DeleteIcon />}
                        onClick={() => onDelete(project.id)}
                    >
                        Delete
                    </Button>
                </Box>
            </CardActions>
        </Card>
    );
}

export default KnittingProjectCard;
