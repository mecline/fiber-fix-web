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
    Checkbox,
    Button
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

function RowCounter({ open, onClose, projectId, initialCount = 0, initialTarget = 0, onSave, project }) {
    const [count, setCount] = useState(initialCount);
    const [target, setTarget] = useState(initialTarget);
    const [repeat, setRepeat] = useState(false);
    const [subCounters, setSubCounters] = useState(project?.subCounters || []);
    const [showAddCounter, setShowAddCounter] = useState(true);

    useEffect(() => {
        setCount(initialCount);
        setTarget(initialTarget);
        setSubCounters(project?.subCounters || []);
        setShowAddCounter(project?.subCounters?.length < 2);
    }, [initialCount, initialTarget, project]);

    const handleAddSubCounter = () => {
        const newSubCounters = [...subCounters, { count: 0, target: 0 }];
        setSubCounters(newSubCounters);
        setShowAddCounter(newSubCounters.length < 2);
        saveCounterState(count, target, repeat, newSubCounters);
    };

    const handleSubCounterIncrement = (index) => {
        const newSubCounters = [...subCounters];
        newSubCounters[index].count++;
        
        if (newSubCounters[index].count >= newSubCounters[index].target && newSubCounters[index].target > 0) {
            // Reset sub counter
            newSubCounters[index].count = 0;
            
            // Increment main counter
            let newCount = count + 1;
            if (repeat && newCount > target) {
                newCount = 1;
            }
            setCount(newCount);
        }
        
        setSubCounters(newSubCounters);
        saveCounterState(count, target, repeat, newSubCounters);
    };

    const handleSubCounterDecrement = (index) => {
        const newSubCounters = [...subCounters];
        newSubCounters[index].count = Math.max(0, newSubCounters[index].count - 1);
        setSubCounters(newSubCounters);
        saveCounterState(count, target, repeat, newSubCounters);
    };

    const handleSubCounterTargetChange = (index, value) => {
        const newSubCounters = [...subCounters];
        newSubCounters[index].target = parseInt(value) || 0;
        setSubCounters(newSubCounters);
        saveCounterState(count, target, repeat, newSubCounters);
    };

    const handleRemoveSubCounter = (index) => {
        const newSubCounters = subCounters.filter((_, i) => i !== index);
        setSubCounters(newSubCounters);
        setShowAddCounter(newSubCounters.length < 2);
        saveCounterState(count, target, repeat, newSubCounters);
    };

    const saveCounterState = (mainCount, mainTarget, repeatPattern, subCountersState) => {
        onSave(projectId, {
            count: mainCount,
            target: mainTarget,
            repeat: repeatPattern,
            subCounters: subCountersState
        });
    };

    const handleIncrement = () => {
        let newCount = count + 1;
        if (repeat && newCount > target) {
            newCount = 1;
        }
        setCount(newCount);
        saveCounterState(newCount, target, repeat, subCounters);
    };

    const handleDecrement = () => {
        const newCount = Math.max(0, count - 1);
        setCount(newCount);
        saveCounterState(newCount, target, repeat, subCounters);
    };

    const handleTargetChange = (e) => {
        const newTarget = parseInt(e.target.value) || 0;
        setTarget(newTarget);
        saveCounterState(count, newTarget, repeat, subCounters);
    };

    const handleRepeatChange = (e) => {
        setRepeat(e.target.checked);
        saveCounterState(count, target, e.target.checked, subCounters);
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

                    {showAddCounter && (
                        <Button
                            variant="outlined"
                            onClick={handleAddSubCounter}
                            sx={{ mt: 2 }}
                        >
                            Add Sub Counter
                        </Button>
                    )}

                    {subCounters.map((subCounter, index) => (
                        <Box key={index} sx={{ 
                            mt: 3, 
                            p: 2, 
                            border: '1px solid #ccc', 
                            borderRadius: 1,
                            position: 'relative'
                        }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                Sub Counter {index + 1}
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => handleRemoveSubCounter(index)}
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                            >
                                <RemoveIcon />
                            </IconButton>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <IconButton onClick={() => handleSubCounterDecrement(index)}>
                                    <RemoveIcon />
                                </IconButton>
                                <Typography variant="h5">{subCounter.count}</Typography>
                                <IconButton onClick={() => handleSubCounterIncrement(index)}>
                                    <AddIcon />
                                </IconButton>
                            </Box>
                            <TextField
                                label="Target"
                                type="number"
                                value={subCounter.target}
                                onChange={(e) => handleSubCounterTargetChange(index, e.target.value)}
                                size="small"
                            />
                        </Box>
                    ))}
                </Box>
            </DialogContent>
        </Dialog>
    );
}

export default RowCounter;
