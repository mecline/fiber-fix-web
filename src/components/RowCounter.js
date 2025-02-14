import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    IconButton,
    Typography,
    CircularProgress,
    TextField,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

function RowCounter({ open, onClose, projectId, initialCount = 0, initialTarget = 0, onSave }) {
    const [count, setCount] = useState(initialCount);
    const [target, setTarget] = useState(initialTarget);
    const [repeat, setRepeat] = useState(false);

    useEffect(() => {
        setCount(initialCount);
        setTarget(initialTarget);
    }, [initialCount, initialTarget]);

    const handleIncrement = () => {
        let newCount = count + 1;
        if (repeat && newCount > target) {
            newCount = 1;
        }
        setCount(newCount);
        onSave(projectId, newCount, target, repeat);
    };

    const handleDecrement = () => {
        const newCount = Math.max(0, count - 1);
        setCount(newCount);
        onSave(projectId, newCount, target, repeat);
    };

    const handleTargetChange = (e) => {
        const newTarget = parseInt(e.target.value) || 0;
        setTarget(newTarget);
        onSave(projectId, count, newTarget, repeat);
    };

    const handleRepeatChange = (e) => {
        setRepeat(e.target.checked);
        onSave(projectId, count, target, e.target.checked);
    };

    const progress = target > 0 ? (count / target) * 100 : 0;

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Row Counter</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                        <CircularProgress
                            variant="determinate"
                            value={progress}
                            size={80}
                            sx={{ color: 'primary.main' }}
                        />
                        <Box
                            sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography variant="caption" component="div" color="text.secondary">
                                {`${count}/${target}`}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <IconButton onClick={handleDecrement}>
                            <RemoveIcon />
                        </IconButton>
                        <Typography variant="h4">{count}</Typography>
                        <IconButton onClick={handleIncrement}>
                            <AddIcon />
                        </IconButton>
                    </Box>

                    <TextField
                        label="Target Rows"
                        type="number"
                        value={target}
                        onChange={handleTargetChange}
                        sx={{ mb: 2 }}
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={repeat}
                                onChange={handleRepeatChange}
                            />
                        }
                        label="Repeat pattern"
                    />
                </Box>
            </DialogContent>
        </Dialog>
    );
}

export default RowCounter;
