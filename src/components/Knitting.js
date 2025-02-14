import React, { useState, useEffect } from 'react';
import { Button, Grid, Typography, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { auth } from '../firebase';
import { createKnittingProject, updateKnittingProject, deleteKnittingProject, getKnittingProjects } from '../firebase/db';
import KnittingProjectCard from './KnittingProjectCard';
import KnittingProjectDialog from './KnittingProjectDialog';

function Knitting() {
    const [projects, setProjects] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        if (auth.currentUser) {
            const projectsData = await getKnittingProjects(auth.currentUser.uid);
            setProjects(projectsData);
        }
    };

    const handleCreateProject = async (projectData, patternFile) => {
        if (auth.currentUser) {
            await createKnittingProject(auth.currentUser.uid, projectData, patternFile);
            loadProjects();
        }
    };

    const handleUpdateProject = async (projectData, patternFile) => {
        if (auth.currentUser) {
            await updateKnittingProject(auth.currentUser.uid, selectedProject.id, projectData);
            loadProjects();
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (auth.currentUser) {
            await deleteKnittingProject(auth.currentUser.uid, projectId);
            loadProjects();
        }
    };

    const handleEdit = (project) => {
        setSelectedProject(project);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedProject(null);
    };

    return (
        <div className="content-container">
            <div className="craft-section">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Knitting Projects
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setDialogOpen(true)}
                    >
                        New Project
                    </Button>
                </Box>

                <Grid container spacing={2}>
                    {projects.map(project => (
                        <Grid item xs={12} sm={6} md={4} key={project.id}>
                            <KnittingProjectCard
                                project={project}
                                onEdit={handleEdit}
                                onDelete={handleDeleteProject}
                                onRowCounterUpdate={async (projectId, count, target, repeat) => {
                                    if (auth.currentUser) {
                                        await updateRowCounter(auth.currentUser.uid, projectId, count, target, repeat);
                                        loadProjects();
                                    }
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>

                <KnittingProjectDialog
                    open={dialogOpen}
                    onClose={handleCloseDialog}
                    onSave={selectedProject ? handleUpdateProject : handleCreateProject}
                    project={selectedProject}
                />
            </div>
        </div>
    );
}

export default Knitting;
