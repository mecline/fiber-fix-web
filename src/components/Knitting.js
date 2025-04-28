import React, { useState, useEffect } from 'react';
import {
  Button,
  Grid,
  Typography,
  Box,
  Paper,
  Fab,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Fade,
  LinearProgress,
  Card, Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon, CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { auth } from '../firebase';
import { createKnittingProject, updateKnittingProject, deleteKnittingProject, getKnittingProjects, updateRowCounter } from '../firebase/db';
import KnittingProjectCard from './KnittingProjectCard';
import KnittingProjectDialog from './KnittingProjectDialog';
import { theme as customTheme } from '../theme';

function Knitting() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Latest');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    const applyFiltersAndSort = () => {
        let result = [...projects];
        
        if (activeFilter !== 'All') {
          result = result.filter(project => project.status === activeFilter);
        }
        
        switch (activeSort) {
          case 'Latest':
            result.sort((a, b) => new Date(b.createdAt?.toDate?.() || b.createdAt) - new Date(a.createdAt?.toDate?.() || a.createdAt));
            break;
          case 'Oldest':
            result.sort((a, b) => new Date(a.createdAt?.toDate?.() || a.createdAt) - new Date(b.createdAt?.toDate?.() || b.createdAt));
            break;
          case 'A-Z':
            result.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'Z-A':
            result.sort((a, b) => b.name.localeCompare(a.name));
            break;
          default:
            break;
        }
        setFilteredProjects(result);
      };
      
      applyFiltersAndSort();
  }, [projects, activeFilter, activeSort]);

  const loadProjects = async () => {
    setLoading(true);
    if (auth.currentUser) {
      try {
        const projectsData = await getKnittingProjects(auth.currentUser.uid);
        setProjects(projectsData);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    if (auth.currentUser) {
      try {
        await createKnittingProject(auth.currentUser.uid, {
          ...projectData,
          coverImageKey: projectData.coverImageKey || '',
          coverImageUrl: projectData.coverImageUrl || ''
        });
        loadProjects();
      } catch (error) {
        console.error('Error creating project:', error);
      }
    }
  };

  const handleUpdateProject = async (projectData) => {
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

  const handleRowCounterUpdate = async (projectId, counterData) => {
    if (auth.currentUser) {
      await updateRowCounter(auth.currentUser.uid, projectId, counterData);
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

  const handleFilterClick = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleSortClick = (event) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortMenuAnchor(null);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    handleFilterClose();
  };

  const handleSortChange = (sort) => {
    setActiveSort(sort);
    handleSortClose();
  };

  return (
    <Fade in={true} timeout={500}>
      <Paper 
        elevation={3}
        sx={{ 
          p: { xs: 2, sm: 3 },
          borderRadius: customTheme.borderRadius.lg,
          height: 'calc(100vh - 115px)',
          backgroundColor: customTheme.colors.containerBackground,
          position: 'relative',
          overflow: 'auto'
        }}
      >
        {loading && (
          <LinearProgress 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0,
              height: '3px', 
              bgcolor: 'transparent'
            }} 
          />
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h4" component="h1" sx={{ color: customTheme.colors.primary }}>
            Knitting Projects
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Filter Projects">
              <IconButton 
                onClick={handleFilterClick}
                color={activeFilter !== 'All' ? 'primary' : 'default'}
                sx={{ border: activeFilter !== 'All' ? `1px solid ${customTheme.colors.primary}` : 'none' }}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={filterMenuAnchor}
              open={Boolean(filterMenuAnchor)}
              onClose={handleFilterClose}
            >
              {['All', 'Not Started', 'In Progress', 'Completed'].map((filter) => (
                <MenuItem 
                  key={filter} 
                  onClick={() => handleFilterChange(filter)}
                  selected={activeFilter === filter}
                >
                  <ListItemText>{filter}</ListItemText>
                  {activeFilter === filter && (
                    <ListItemIcon sx={{ minWidth: 'auto' }}>
                      <CheckCircleIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                  )}
                </MenuItem>
              ))}
            </Menu>
            
            <Tooltip title="Sort Projects">
              <IconButton onClick={handleSortClick}>
                <SortIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={sortMenuAnchor}
              open={Boolean(sortMenuAnchor)}
              onClose={handleSortClose}
            >
              {['Latest', 'Oldest', 'A-Z', 'Z-A'].map((sort) => (
                <MenuItem 
                  key={sort} 
                  onClick={() => handleSortChange(sort)}
                  selected={activeSort === sort}
                >
                  <ListItemText>{sort}</ListItemText>
                  {activeSort === sort && (
                    <ListItemIcon sx={{ minWidth: 'auto' }}>
                      <CheckCircleIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                  )}
                </MenuItem>
              ))}
            </Menu>
            
            {!isMobile && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setDialogOpen(true)}
                sx={{
                  bgcolor: customTheme.colors.primary,
                  '&:hover': {
                    bgcolor: customTheme.colors.primaryDark
                  }
                }}
              >
                New Project
              </Button>
            )}
          </Box>
        </Box>

        {activeFilter !== 'All' && (
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={`Filter: ${activeFilter}`}
              onDelete={() => setActiveFilter('All')}
              color="primary"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            <Chip 
              label={`Sort: ${activeSort}`}
              variant="outlined"
              sx={{ color: customTheme.colors.textLight }}
            />
          </Box>
        )}
        
        {filteredProjects.length === 0 && !loading ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              bgcolor: 'rgba(0,0,0,0.02)',
              borderRadius: customTheme.borderRadius.md
            }}
          >
            <Typography variant="h6" color="textSecondary">
              {activeFilter !== 'All' 
                ? `No ${activeFilter} projects found` 
                : 'No knitting projects yet'}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, maxWidth: 400 }}>
              {activeFilter !== 'All' 
                ? `Try changing the filter or add a new project` 
                : 'Start tracking your knitting projects by creating your first project'}
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
        ) : (
          <Grid container spacing={3}>
            {filteredProjects.map(project => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card 
                  elevation={2}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: customTheme.borderRadius.md,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: customTheme.boxShadow.md
                    }
                  }}
                >
                  <KnittingProjectCard
                    project={project}
                    onEdit={handleEdit}
                    onDelete={handleDeleteProject}
                    onRowCounterUpdate={handleRowCounterUpdate}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {isMobile && (
          <Fab 
            color="primary" 
            aria-label="add"
            onClick={() => setDialogOpen(true)}
            sx={{ 
              position: 'fixed',
              bottom: 20,
              right: 20,
              bgcolor: customTheme.colors.primary,
              '&:hover': {
                bgcolor: customTheme.colors.primaryDark
              }
            }}
          >
            <AddIcon />
          </Fab>
        )}

        <KnittingProjectDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onSave={selectedProject ? handleUpdateProject : handleCreateProject}
          project={selectedProject}
        />
      </Paper>
    </Fade>
  );
}

export default Knitting;