import React, { useState, useMemo, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { TextField, IconButton, Popover, Button, Tooltip, Box } from '@mui/material';
import { createWorker } from 'tesseract.js';
import { auth } from '../firebase';
import { initializeUserFloss, updateFlossCount } from '../firebase/db';
import { HexColorPicker } from 'react-colorful';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import dmcData from '../data/dmc_floss_data.json';
import { calculateColorDifference, isValidHex } from '../utils/colorUtils';
import PatternAnalysisDialog from './PatternAnalysisDialog';

function Embroidery() {
    const [searchColor, setSearchColor] = useState('');
    const [error, setError] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [flossCounts, setFlossCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [patternDialogOpen, setPatternDialogOpen] = useState(false);
    const [patternFlossNumbers, setPatternFlossNumbers] = useState([]);
    const [processingFile, setProcessingFile] = useState(false);

    useEffect(() => {
        const loadFlossCounts = async () => {
            if (auth.currentUser) {
                const counts = await initializeUserFloss(auth.currentUser.uid);
                setFlossCounts(counts);
                setLoading(false);
            }
        };
        loadFlossCounts();
    }, []);

    const handleFlossCount = async (flossNumber, increment) => {
        if (auth.currentUser) {
            const newCount = await updateFlossCount(auth.currentUser.uid, flossNumber, increment);
            setFlossCounts(prev => ({
                ...prev,
                [flossNumber]: newCount
            }));
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
            .slice(0, 3)
            .map(color => color.floss);
    }, [searchColor]);

    const handleColorSearch = (event) => {
        const value = event.target.value;
        if (value.length <= 7) {  // Allow up to 7 characters (#FFFFFF)
            setSearchColor(value);
            setError('');
        }
        if (value.length === 7 && !isValidHex(value)) {
            setError('Please enter a valid hex color (e.g., FF0000 or #FF0000)');
        }
    };

    const columns = [
        { field: 'floss', headerName: 'DMC Number', width: 130 },
        { field: 'name', headerName: 'Color Name', width: 200 },
        {
            field: 'hex',
            headerName: 'Color',
            width: 130,
            renderCell: (params) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                        style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: params.value,
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    />
                    {params.value}
                </div>
            ),
        },
        {
            field: 'count',
            headerName: 'Inventory',
            width: 130,
            renderCell: (params) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Button
                        onClick={() => handleFlossCount(params.row.floss, -1)}
                        style={{ minWidth: '30px', padding: '2px 8px' }}
                    >
                        {'<'}
                    </Button>
                    <span>{flossCounts[params.row.floss] || 0}</span>
                    <Button
                        onClick={() => handleFlossCount(params.row.floss, 1)}
                        style={{ minWidth: '30px', padding: '2px 8px' }}
                    >
                        {'>'}
                    </Button>
                </div>
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

    const handlePatternUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setProcessingFile(true);
        try {
            const worker = await createWorker({
                logger: m => console.log(m)
            });
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');

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

                const { data: { text } } = await worker.recognize(canvas);
                
                // Find DMC numbers in the text
                const dmcRegex = /\b\d{3,4}\b/g;
                const numbers = text.match(dmcRegex) || [];
                
                numbers.forEach(num => {
                    // Verify if the number exists in DMC data
                    if (dmcData.some(floss => floss.floss === num)) {
                        foundNumbers.add(num);
                    }
                });
            }

            await worker.terminate();

            // Convert found numbers to floss requirements
            const requirements = Array.from(foundNumbers).map(number => ({
                number,
                name: dmcData.find(floss => floss.floss === number)?.name || 'Unknown'
            }));

            setPatternFlossNumbers(requirements);
            setPatternDialogOpen(true);
        } catch (error) {
            console.error('Error processing PDF:', error);
            // You might want to show an error message to the user here
        } finally {
            setProcessingFile(false);
        }
    };

    return (
        <div className="content-container">
            <div className="craft-section">
                <h1>DMC Floss Colors</h1>
                <Box sx={{ mb: 2 }}>
                    <input
                        accept="application/pdf"
                        style={{ display: 'none' }}
                        id="pattern-file-upload"
                        type="file"
                        onChange={handlePatternUpload}
                        disabled={processingFile}
                    />
                    <label htmlFor="pattern-file-upload">
                        <Button
                            variant="contained"
                            component="span"
                            disabled={processingFile}
                        >
                            {processingFile ? 'Processing...' : 'Upload Pattern PDF'}
                        </Button>
                    </label>
                </Box>
                <div className="color-search" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <TextField
                        label="Search by HEX color or floss number"
                        value={searchColor}
                        onChange={handleColorSearch}
                        error={!!error}
                        helperText={error}
                        placeholder="Enter hex color (e.g., FF0000)"
                        sx={{ marginBottom: 2, width: '300px' }}
                    />
                    <IconButton
                        onClick={handleColorPickerClick}
                        sx={{
                            mt: 1,
                            backgroundColor: searchColor || '#fff',
                            '&:hover': { backgroundColor: searchColor || '#f0f0f0' }
                        }}
                    >
                        <Tooltip title="Select HEX color here">
                            <ColorLensIcon />
                        </Tooltip>
                    </IconButton>
                    <Popover
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleColorPickerClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <HexColorPicker
                            color={searchColor || '#ffffff'}
                            onChange={(color) => {
                                setSearchColor(color);
                                setError('');
                            }}
                        />
                    </Popover>
                </div>
                <div style={{ height: '60vh', width: '100%' }}>
                    <DataGrid
                        rows={dmcData.map((item, index) => ({
                            id: index,
                            ...item,
                            sortPriority: closestColors.includes(item.floss) ?
                                (item.hex.toLowerCase() === (searchColor.startsWith('#') ? searchColor : `#${searchColor}`).toLowerCase() ? 1 : 2)
                                : 3
                        }))
                            .sort((a, b) => a.sortPriority - b.sortPriority)}
                        columns={columns}
                        pageSize={25}
                        rowsPerPageOptions={[25]}
                        disableSelectionOnClick
                        getRowClassName={getRowClassName}
                        sx={{
                            backgroundColor: 'white',
                            '& .MuiDataGrid-cell': {
                                borderColor: '#f0f0f0'
                            },
                            '& .exact-match-row': {
                                backgroundColor: 'rgba(0, 128, 0, 0.2)',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 128, 0, 0.3)',
                                }
                            },
                            '& .close-match-row': {
                                backgroundColor: 'rgba(255, 255, 0, 0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 0, 0.2)',
                                }
                            }
                        }}
                    />
                </div>
                <PatternAnalysisDialog
                    open={patternDialogOpen}
                    onClose={() => setPatternDialogOpen(false)}
                    flossRequirements={patternFlossNumbers}
                    userInventory={flossCounts}
                />
            </div>
        </div>
    );
}

export default Embroidery;
