import React from 'react';
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
    Typography
} from '@mui/material';

function PatternAnalysisDialog({ open, onClose, flossRequirements, userInventory }) {
    if (!flossRequirements) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Pattern Floss Requirements</DialogTitle>
            <DialogContent>
                <Paper style={{ marginTop: '1rem' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>DMC Number</TableCell>
                                <TableCell>Color Name</TableCell>
                                <TableCell>Required</TableCell>
                                <TableCell>Your Inventory</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {flossRequirements.map((floss) => {
                                const inventory = userInventory[floss.number] || 0;
                                const status = inventory >= 1 ? "✓" : "Needed";
                                
                                return (
                                    <TableRow key={floss.number}>
                                        <TableCell>{floss.number}</TableCell>
                                        <TableCell>{floss.name}</TableCell>
                                        <TableCell>Yes</TableCell>
                                        <TableCell>{inventory}</TableCell>
                                        <TableCell>
                                            <Typography
                                                color={inventory >= 1 ? "success.main" : "error.main"}
                                            >
                                                {status}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Paper>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

export default PatternAnalysisDialog;
