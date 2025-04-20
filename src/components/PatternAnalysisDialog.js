import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    Chip,
    useMediaQuery,
    useTheme,
    IconButton,
    Divider,
    Alert,
    TableContainer,
    TablePagination,
    CircularProgress,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Close as CloseIcon,
    Search as SearchIcon,
    ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { theme as customTheme } from '../theme';

function PatternAnalysisDialog({ open, onClose, flossRequirements, userInventory }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    if (!flossRequirements) return null;

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0); // Reset to first page when searching
    };

    const filteredRequirements = flossRequirements.filter(floss => 
        floss.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
        floss.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const requiredCount = flossRequirements.length;
    const availableCount = flossRequirements.filter(floss => (userInventory[floss.number] || 0) >= 1).length;
    const neededCount = requiredCount - availableCount;
    
    // For pagination
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Calculate which floss to display based on pagination
    const displayedFloss = filteredRequirements
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            fullScreen={fullScreen}
            PaperProps={{
                sx: {
                    borderRadius: fullScreen ? 0 : customTheme.borderRadius.lg,
                    overflowY: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                p: 2
            }}>
                <Typography variant="h5" component="div">Pattern Floss Requirements</Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress 
                                variant="determinate" 
                                value={availableCount / requiredCount * 100 || 0}
                                size={40}
                                thickness={4}
                                sx={{ 
                                    color: availableCount === requiredCount ? customTheme.colors.success : customTheme.colors.primary,
                                    '& .MuiCircularProgress-circle': {
                                        strokeLinecap: 'round',
                                    }
                                }}
                            />
                            <Box>
                                <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                                    {availableCount} of {requiredCount}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Colors Available
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Divider orientation="vertical" flexItem />
                        
                        <Box>
                            <Chip 
                                label={`${neededCount} Colors Needed`}
                                color={neededCount > 0 ? "warning" : "success"}
                                icon={neededCount > 0 ? <ShoppingCartIcon /> : <CheckCircleIcon />}
                                variant={neededCount > 0 ? "filled" : "outlined"}
                            />
                        </Box>
                    </Box>
                    
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search floss numbers or names..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
                
                <Alert severity="info" sx={{ mx: 2, mt: 2 }}>
                    Note: If you have uploaded the entire pattern rather than just the DMC floss chart, please double check the needed threads to make sure 
                    that values are correct. (ex. row 1 should not say you should buy DMC floss 1)
                </Alert>
                
                <TableContainer 
                    component={Paper} 
                    elevation={0}
                    sx={{ 
                        flex: '1 1 auto',
                        mt: 2,
                        mx: 2,
                        borderRadius: customTheme.borderRadius.md,
                        border: '1px solid rgba(0,0,0,0.1)',
                        overflow: 'auto'
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                <TableCell>DMC Number</TableCell>
                                <TableCell>Color Name</TableCell>
                                <TableCell align="center">Your Inventory</TableCell>
                                <TableCell align="center">Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayedFloss.map((floss) => {
                                const inventory = userInventory[floss.number] || 0;
                                const isAvailable = inventory >= 1;
                                
                                return (
                                    <TableRow 
                                        key={floss.number}
                                        sx={{ 
                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                                            bgcolor: isAvailable ? `${customTheme.colors.success}08` : 'inherit'
                                        }}
                                    >
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">
                                                {floss.number}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{floss.name}</TableCell>
                                        <TableCell align="center">
                                            <Chip 
                                                label={inventory}
                                                size="small"
                                                color={isAvailable ? "primary" : "default"}
                                                variant={isAvailable ? "filled" : "outlined"}
                                                sx={{ minWidth: '60px' }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                {isAvailable ? (
                                                    <CheckCircleIcon sx={{ color: customTheme.colors.success }} fontSize="small" />
                                                ) : (
                                                    <WarningIcon sx={{ color: customTheme.colors.warning }} fontSize="small" />
                                                )}
                                                <Typography
                                                    variant="body2"
                                                    color={isAvailable ? "success.main" : "warning.main"}
                                                >
                                                    {isAvailable ? "Available" : "Needed"}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            
                            {displayedFloss.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                        <Typography color="textSecondary">
                                            {searchTerm ? "No floss matching your search" : "No floss requirements found"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                <TablePagination
                    component="div"
                    count={filteredRequirements.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}
                />
            </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <Button 
                    onClick={onClose}
                    variant="contained"
                    color="primary"
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default PatternAnalysisDialog;