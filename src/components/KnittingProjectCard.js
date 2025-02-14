import React, { useState } from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Calculate as CalculateIcon } from '@mui/icons-material';
import RowCounter from './RowCounter';

function KnittingProjectCard({ project, onEdit, onDelete, onRowCounterUpdate }) {
    const [rowCounterOpen, setRowCounterOpen] = useState(false);
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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', gap: 1 }}>
                    <IconButton
                        size="small"
                        onClick={() => setRowCounterOpen(true)}
                        title="Row Counter"
                    >
                        <CalculateIcon />
                    </IconButton>
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
            <RowCounter
                open={rowCounterOpen}
                onClose={() => setRowCounterOpen(false)}
                projectId={project.id}
                initialCount={project.rowCount || 0}
                initialTarget={project.rowTarget || 0}
                onSave={onRowCounterUpdate}
            />
        </Card>
    );
}

export default KnittingProjectCard;
