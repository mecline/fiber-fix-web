import React, { useState } from 'react';
import { 
  CardContent, 
  CardActions, 
  Typography, 
  Box, 
  IconButton, 
  Tooltip,
  LinearProgress,
  Grid,
  Divider,
  Collapse,
  Avatar,
  CardHeader,
  Chip
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Timer as TimerIcon,
  StraightenOutlined as StraightenOutlinedIcon,
  ColorLens as ColorLensIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import RowCounter from './RowCounter';
import { theme as customTheme } from '../theme';

function KnittingProjectCard({ project, onEdit, onDelete, onRowCounterUpdate }) {
  const [rowCounterOpen, setRowCounterOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(project.id);
    } else {
      setConfirmDelete(true);
      // Auto-reset after 3 seconds
      setTimeout(() => {
        setConfirmDelete(false);
      }, 3000);
    }
  };

  const getProgressPercentage = () => {
    if (!project.rowTarget || project.rowTarget <= 0) return 0;
    return Math.min(100, Math.round((project.rowCount / project.rowTarget) * 100));
  };
  
  const progressPercentage = getProgressPercentage();
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return customTheme.colors.success;
      case 'In Progress':
        return customTheme.colors.warning;
      default:
        return customTheme.colors.textLight;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircleIcon fontSize="small" />;
      case 'In Progress':
        return <HourglassEmptyIcon fontSize="small" />;
      default:
        return <CancelIcon fontSize="small" />;
    }
  };

  console.log("Cover image URL:", project.coverImageUrl);

  return (
    <>
<CardHeader
  avatar={
    project.coverImageUrl ? (
      <Avatar 
        src={project.coverImageUrl} 
        variant="rounded"
        sx={{ width: 56, height: 56 }}
        alt={project.name}
      />
    ) : (
      <Avatar
        sx={{ 
          width: 56, 
          height: 56, 
          bgcolor: customTheme.colors.primaryLight
        }}
      >
        {project.name ? project.name.charAt(0).toUpperCase() : 'P'}
      </Avatar>
    )
  }
  title={project.name}
  subheader={
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
      <Chip 
        size="small"
        label={project.status}
        icon={getStatusIcon(project.status)}
        sx={{ 
          bgcolor: `${getStatusColor(project.status)}20`,
          color: getStatusColor(project.status),
          fontWeight: 500,
          border: `1px solid ${getStatusColor(project.status)}40`
        }}
      />
    </Box>
  }
/>

      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        {project.rowTarget > 0 && (
          <Box sx={{ mt: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="textSecondary">
                Progress
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {project.rowCount} / {project.rowTarget} rows ({progressPercentage}%)
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage}
              sx={{ 
                height: 8, 
                borderRadius: 1,
                backgroundColor: 'rgba(0,0,0,0.05)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: progressPercentage === 100 
                    ? customTheme.colors.success 
                    : customTheme.colors.primary
                }
              }}
            />
          </Box>
        )}

        <Grid container spacing={1} sx={{ mt: 1 }}>
          {project.needleSize && (
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StraightenOutlinedIcon fontSize="small" color="action" />
                <Typography variant="body2" noWrap>
                  {project.needleSize}
                </Typography>
              </Box>
            </Grid>
          )}
          
          {project.yarn && (
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ColorLensIcon fontSize="small" color="action" />
                <Typography variant="body2" noWrap>
                  {project.yarn}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            {project.pattern && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Pattern
                </Typography>
                <Typography variant="body2">
                  {project.pattern}
                </Typography>
              </Box>
            )}
            
            {project.notes && (
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Notes
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {project.notes}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>

      <Box sx={{ flexGrow: 0 }}>
        <Divider />
        <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
          <Box>
            <Tooltip title={expanded ? "Show less" : "Show more"}>
              <IconButton onClick={toggleExpand} size="small">
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Row Counter">
              <IconButton
                size="small"
                onClick={() => setRowCounterOpen(true)}
                color="primary"
              >
                <TimerIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => onEdit(project)}
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={confirmDelete ? "Click to confirm delete" : "Delete"}>
              <IconButton
                size="small"
                onClick={handleDelete}
                color={confirmDelete ? "error" : "default"}
                sx={{
                  transition: 'all 0.2s',
                  ...(confirmDelete && {
                    backgroundColor: 'error.light',
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: 'error.main',
                      color: 'white',
                    }
                  })
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardActions>
      </Box>

      <RowCounter
        open={rowCounterOpen}
        onClose={() => setRowCounterOpen(false)}
        projectId={project.id}
        initialCount={project.rowCount || 0}
        initialTarget={project.rowTarget || 0}
        onSave={onRowCounterUpdate}
        project={project}
      />
    </>
  );
}

export default KnittingProjectCard;