import React, { useState, useMemo, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
    TextField,
    IconButton,
    Button,
    Tooltip,
    Box,
    Paper,
    Typography,
    InputAdornment,
    LinearProgress,
    Chip,
    Badge,
    Fade,
    Collapse,
    Alert,
    Card,
    CardContent,
    Grid,
    Divider
} from '@mui/material';
import { createWorker, createScheduler } from 'tesseract.js';
import { auth } from '../firebase';
import { initializeUserFloss, updateFlossCount } from '../firebase/db';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import InventoryIcon from '@mui/icons-material/Inventory';
import dmcData from '../data/dmc_floss_data.json';
import { calculateColorDifference, isValidHex } from '../utils/colorUtils';
import PatternAnalysisDialog from './PatternAnalysisDialog';
import ColorPickerPopover from './ColorPickerPopover';
import { theme as customTheme } from '../theme';

function Embroidery() {
    const [searchColor, setSearchColor] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [flossCounts, setFlossCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [patternDialogOpen, setPatternDialogOpen] = useState(false);
    const [patternFlossNumbers, setPatternFlossNumbers] = useState([]);
    const [processingFile, setProcessingFile] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [selectedFloss, setSelectedFloss] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);

    useEffect(() => {
        const loadFlossCounts = async () => {
            if (auth.currentUser) {
                try {
                    const counts = await initializeUserFloss(auth.currentUser.uid);
                    setFlossCounts(counts);
                } catch (error) {
                    console.error("Error loading floss counts:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        loadFlossCounts();
    }, []);

    const handleFlossCount = async (flossNumber, increment) => {
        if (auth.currentUser) {
            try {
                const newCount = await updateFlossCount(auth.currentUser.uid, flossNumber, increment);
                setFlossCounts(prev => ({
                    ...prev,
                    [flossNumber]: newCount
                }));
            } catch (error) {
                console.error("Error updating floss count:", error);
            }
        }
    };

    const handleColorPickerClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleColorPickerClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    // Find closest colors when a valid hex is entered
    const closestColors = useMemo(() => {
        if (!searchColor || !isValidHex(searchColor)) return [];

        const normalizedSearchColor = searchColor.startsWith('#') ? searchColor : `#${searchColor}`;

        return dmcData
            .map(color => ({
                ...color,
                difference: calculateColorDifference(normalizedSearchColor, color.hex)
            }))
            .sort((a, b) => a.difference - b.difference)
            .slice(0, 5)
            .map(color => color.floss);
    }, [searchColor]);

    const handleColorSearch = (event) => {
        const value = event.target.value;
        if (value.length <= 7) {  // Allow up to 7 characters (#FFFFFF)
            setSearchColor(value);
            setError('');
        }
        if (value.length > 0 && value.length === 7 && !isValidHex(value)) {
            setError('Please enter a valid hex color (e.g., FF0000 or #FF0000)');
        }
    };

    const handleColorSelected = (color) => {
        setSearchColor(color);
        setError('');
    };

    const handleSearchTermChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredData = useMemo(() => {
        let result = [...dmcData];

        // Apply search term filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item =>
                item.floss.toLowerCase().includes(term) ||
                item.name.toLowerCase().includes(term)
            );
        }

        // Apply color search
        if (searchColor && isValidHex(searchColor)) {
            const normalizedSearchColor = searchColor.startsWith('#') ? searchColor : `#${searchColor}`;

            // Find exact or close matches
            result = result.map(item => {
                let priority = 999;

                // Exact floss match
                if (item.floss === searchColor.replace('#', '')) {
                    priority = 1;
                }
                // Exact hex match
                else if (item.hex.toLowerCase() === normalizedSearchColor.toLowerCase()) {
                    priority = 2;
                }
                // Close color match
                else if (closestColors.includes(item.floss)) {
                    // Find position in closestColors to determine priority
                    priority = 3 + closestColors.indexOf(item.floss);
                }

                return {
                    ...item,
                    priority
                };
            }).sort((a, b) => a.priority - b.priority);
        }

        return result;
    }, [searchTerm, searchColor, closestColors]);

    const handlePatternUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setProcessingFile(true);
        setUploadError('');

        try {
            const scheduler = createScheduler();
            const worker = await createWorker();
            await scheduler.addWorker(worker);

            // Convert PDF to images and process each page
            const pdfjs = await import('pdfjs-dist');
            const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
            pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

            const pdf = await pdfjs.getDocument(URL.createObjectURL(file)).promise;
            const foundNumbers = new Set();

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                const { data: { text } } = await scheduler.addJob('recognize', canvas);

                // Find DMC numbers in the text
                const dmcRegex = /\b\d{1,4}\b/g;  // Match 1-4 digit numbers
                const numbers = text.match(dmcRegex) || [];

                numbers.forEach(num => {
                    // Verify if the number exists in DMC data
                    if (dmcData.some(floss => floss.floss === num)) {
                        foundNumbers.add(num);
                    }
                });
            }

            await scheduler.terminate();

            // Convert found numbers to floss requirements
            const requirements = Array.from(foundNumbers).map(number => ({
                number,
                name: dmcData.find(floss => floss.floss === number)?.name || 'Unknown'
            }));

            if (requirements.length === 0) {
                setUploadError('No DMC floss numbers were detected in the PDF. Try a different file or enter your floss needs manually.');
            } else {
                setPatternFlossNumbers(requirements);
                setPatternDialogOpen(true);
            }
        } catch (error) {
            console.error('Error processing PDF:', error);
            setUploadError('There was an error processing your PDF. Please try again with a different file.');
        } finally {
            setProcessingFile(false);
        }
    };

    const handleRowClick = (params) => {
        setSelectedFloss(params.row);
    };

    const columns = [
        {
            field: 'floss',
            headerName: 'DMC#',
            width: 100,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <Typography fontWeight="bold">DMC #</Typography>
            ),
        },
        {
            field: 'name',
            headerName: 'Color Name',
            flex: 1,
            minWidth: 150,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <Typography fontWeight="bold">Color Name</Typography>
            ),
        },
        {
            field: 'hex',
            headerName: 'Color',
            width: 130,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <Typography fontWeight="bold">Color</Typography>
            ),
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: params.value,
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)'
                        }}
                    />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {params.value}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'count',
            headerName: 'Inventory',
            width: 180,
            headerAlign: 'center',
            align: 'center',
            renderHeader: () => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <InventoryIcon fontSize="small" />
                    <Typography fontWeight="bold">Inventory</Typography>
                </Box>
            ),
            renderCell: (params) => (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2, 
                    width: '100%',
                    px: 2 
                }}>
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFlossCount(params.row.floss, -1);
                        }}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(0,0,0,0.05)',
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Badge
                        badgeContent={flossCounts[params.row.floss] > 0 ? flossCounts[params.row.floss] : 0}
                        color={flossCounts[params.row.floss] === 0 || !flossCounts[params.row.floss] ? "default" : "primary"}
                        showZero
                        sx={{
                            '& .MuiBadge-badge': {
                                fontSize: '0.75rem',
                                height: '22px',
                                minWidth: '22px',
                                padding: '0 6px',
                                marginRight: '5px'
                            }
                        }}
                    >
                        <Box sx={{ width: 10 }} />
                    </Badge>
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFlossCount(params.row.floss, 1);
                        }}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(0,0,0,0.05)',
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>
                </Box>
            ),
        }
    ];

    const getRowClassName = (params) => {
        if (!searchColor || !isValidHex(searchColor)) return '';

        const isExactMatch = params.row.hex.toLowerCase() === (searchColor.startsWith('#') ? searchColor : `#${searchColor}`).toLowerCase();
        const isCloseMatch = closestColors.includes(params.row.floss);

        if (isExactMatch) return 'exact-match-row';
        if (isCloseMatch) return 'close-match-row';
        return '';
    };

    return (
        <Fade in={true} timeout={500}>
            <Box sx={{ height: '100%' }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 2, sm: 3 },
                        borderRadius: customTheme.borderRadius.lg,
                        height: 'calc(100vh - 115px)',
                        backgroundColor: customTheme.colors.containerBackground,
                        position: 'relative',
                        overflow: 'hidden'
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

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h4" component="h1" sx={{ color: customTheme.colors.primary }}>
                            DMC Floss Colors
                        </Typography>
                    </Box>

                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={6}>
                            <Card elevation={2} sx={{ height: '100%', borderRadius: customTheme.borderRadius.md }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <SearchIcon fontSize="small" />
                                        Search Floss
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        label="Search by floss number or name"
                                        variant="outlined"
                                        value={searchTerm}
                                        onChange={handleSearchTermChange}
                                        placeholder="Enter floss number or name"
                                        sx={{ mb: 2 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card elevation={2} sx={{ height: '100%', borderRadius: customTheme.borderRadius.md }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ColorLensIcon fontSize="small" />
                                        Color Matching
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <TextField
                                            fullWidth
                                            label="Search by HEX color"
                                            variant="outlined"
                                            value={searchColor}
                                            onChange={handleColorSearch}
                                            error={!!error}
                                            helperText={error}
                                            placeholder="e.g., #FF0000"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Box
                                                            sx={{
                                                                width: 16,
                                                                height: 16,
                                                                borderRadius: '4px',
                                                                backgroundColor: isValidHex(searchColor) ? searchColor : '#ccc',
                                                                border: '1px solid #ddd'
                                                            }}
                                                        />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <IconButton
                                            onClick={handleColorPickerClick}
                                            sx={{
                                                p: 1.5,
                                                bgcolor: searchColor && isValidHex(searchColor) ? searchColor : 'rgba(0,0,0,0.04)',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                color: searchColor && isValidHex(searchColor) ?
                                                    (parseInt(searchColor.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff') :
                                                    'rgba(0,0,0,0.6)'
                                            }}
                                        >
                                            <ColorLensIcon />
                                        </IconButton>

                                        <ColorPickerPopover
                                            open={open}
                                            anchorEl={anchorEl}
                                            onClose={handleColorPickerClose}
                                            initialColor={isValidHex(searchColor) ? searchColor : '#ffffff'}
                                            onColorChange={handleColorSelected}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                            {searchColor && isValidHex(searchColor) && (
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={`Color: ${searchColor}`}
                                        onDelete={() => setSearchColor('')}
                                        sx={{
                                            bgcolor: `${searchColor}33`,
                                            borderColor: `${searchColor}66`,
                                            border: '1px solid',
                                            '& .MuiChip-deleteIcon': {
                                                color: `${searchColor}cc`
                                            },
                                            color: parseInt(searchColor.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff'
                                        }}
                                    />
                                    {closestColors.length > 0 && (
                                        <Typography variant="body2" sx={{ alignSelf: 'center', color: 'text.secondary' }}>
                                            {closestColors.length > 1 ? 'Closest matches:' : 'Closest match:'} {closestColors.join(', ')}
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Box>

                        <Box>
                            <input
                                accept="application/pdf"
                                style={{ display: 'none' }}
                                id="pattern-file-upload"
                                type="file"
                                onChange={handlePatternUpload}
                                disabled={processingFile}
                            />
                            <label htmlFor="pattern-file-upload">
                                <Tooltip title="Upload a pattern PDF to detect DMC floss numbers">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        disabled={processingFile}
                                        startIcon={processingFile ? <LinearProgress size={20} /> : <FileUploadIcon />}
                                        sx={{ ml: 1 }}
                                    >
                                        {processingFile ? 'Processing...' : 'Scan Pattern'}
                                    </Button>
                                </Tooltip>
                            </label>
                        </Box>
                    </Box>

                    <Collapse in={!!uploadError}>
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUploadError('')}>
                            {uploadError}
                        </Alert>
                    </Collapse>

                    <Grid container spacing={3}>
                        <Grid item xs={12} lg={8}>
                            <Paper
                                elevation={1}
                                sx={{
                                    height: 'calc(95vh - 400px)',
                                    minHeight: '400px',
                                    borderRadius: customTheme.borderRadius.md,
                                    overflow: 'hidden'
                                }}
                            >
                                <DataGrid
                                    rows={filteredData.map((item, index) => ({
                                        id: index,
                                        ...item
                                    }))}
                                    columns={columns}
                                    pageSize={pageSize}
                                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                                    page={page}
                                    onPageChange={(newPage) => setPage(newPage)}
                                    rowsPerPageOptions={[10, 25, 50, 100]}
                                    disableSelectionOnClick
                                    getRowClassName={getRowClassName}
                                    onRowClick={handleRowClick}
                                    loading={loading}
                                    sx={{
                                        '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                            outline: 'none',
                                        },
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                                        },
                                        '& .exact-match-row': {
                                            backgroundColor: `${customTheme.colors.success}20`,
                                            '&:hover': {
                                                backgroundColor: `${customTheme.colors.success}30`,
                                            }
                                        },
                                        '& .close-match-row': {
                                            backgroundColor: `${customTheme.colors.warning}15`,
                                            '&:hover': {
                                                backgroundColor: `${customTheme.colors.warning}25`,
                                            }
                                        },
                                        '& .MuiDataGrid-row:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                        },
                                        '& .MuiDataGrid-row.Mui-selected': {
                                            backgroundColor: `${customTheme.colors.primary}20`,
                                            '&:hover': {
                                                backgroundColor: `${customTheme.colors.primary}30`,
                                            }
                                        },
                                        // Added styles for center alignment
                                        '& .MuiDataGrid-cell': {
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        },
                                        '& .MuiDataGrid-columnHeader': {
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }
                                    }}
                                />
                            </Paper>
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <Card
                                elevation={2}
                                sx={{
                                    height: 'calc(95vh - 400px)',
                                    minHeight: '400px',
                                    borderRadius: customTheme.borderRadius.md,
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                {selectedFloss ? (
                                    <>
                                        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                                            <Typography variant="h6">Floss Details</Typography>
                                        </Box>
                                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 80,
                                                        height: 80,
                                                        backgroundColor: selectedFloss.hex,
                                                        borderRadius: customTheme.borderRadius.md,
                                                        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.1)',
                                                        border: '1px solid rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                                <Box>
                                                    <Typography variant="h5">DMC {selectedFloss.floss}</Typography>
                                                    <Typography variant="subtitle1" color="textSecondary">{selectedFloss.name}</Typography>
                                                </Box>
                                            </Box>

                                            <Divider />

                                            <Box>
                                                <Typography variant="subtitle2" gutterBottom>Inventory Management</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        startIcon={<RemoveIcon />}
                                                        onClick={() => handleFlossCount(selectedFloss.floss, -1)}
                                                        disabled={flossCounts[selectedFloss.floss] <= 0}
                                                    >
                                                        Remove
                                                    </Button>
                                                    <Typography variant="h6">
                                                        {flossCounts[selectedFloss.floss] || 0}
                                                    </Typography>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        startIcon={<AddIcon />}
                                                        onClick={() => handleFlossCount(selectedFloss.floss, 1)}
                                                    >
                                                        Add
                                                    </Button>
                                                </Box>
                                            </Box>

                                            <Divider />

                                            <Box>
                                                <Typography variant="subtitle2" gutterBottom>Color Information</Typography>
                                                <Grid container spacing={1} sx={{ mt: 0.5 }}>
                                                <Grid item xs={6}>
                                                <Typography variant="body2" sx={{ mt: 1 }}>HEX</Typography>
                                                        <Typography variant="body1">
                                                        {selectedFloss.hex}
                                                        </Typography>
                                                    </Grid>
                                                
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" color="textSecondary">RGB</Typography>
                                                        <Typography variant="body1">
                                                            {selectedFloss.r}, {selectedFloss.g}, {selectedFloss.b}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </CardContent>
                                    </>
                                ) : (
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '100%',
                                        p: 3,
                                        textAlign: 'center'
                                    }}>
                                        <ColorLensIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                        <Typography variant="h6" gutterBottom>Select a Floss</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Click on a floss in the table to view details and manage your inventory
                                        </Typography>
                                    </Box>
                                )}
                            </Card>
                        </Grid>
                    </Grid>

                    <PatternAnalysisDialog
                        open={patternDialogOpen}
                        onClose={() => setPatternDialogOpen(false)}
                        flossRequirements={patternFlossNumbers}
                        userInventory={flossCounts}
                    />
                </Paper>
            </Box>
        </Fade>
    );
}

export default Embroidery;