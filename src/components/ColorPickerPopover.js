import React, { useState, useEffect, useRef } from 'react';
import { Popover, Box } from '@mui/material';
import { HexColorPicker } from 'react-colorful';

function ColorPickerPopover({ open, anchorEl, onClose, initialColor, onColorChange }) {
  // Local state for the color picker
  const [localColor, setLocalColor] = useState(initialColor || '#ffffff');
  
  // Use a ref to track if we're currently in the middle of picking
  const isPickingRef = useRef(false);
  
  // Debounce timer ref
  const debounceTimerRef = useRef(null);
  
  // Update local state when props change or when opened
  useEffect(() => {
    if (initialColor && open) {
      setLocalColor(initialColor);
    }
  }, [initialColor, open]);
  
  // Cleanup on unmount - clear any pending timers
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  // Handle the color change with debouncing to reduce update frequency
  const handleChange = (newColor) => {
    isPickingRef.current = true;
    setLocalColor(newColor);
    
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set a new timer to update the parent after a short delay
    debounceTimerRef.current = setTimeout(() => {
      if (onColorChange) {
        onColorChange(newColor);
      }
      isPickingRef.current = false;
    }, 30); // 50ms debounce - adjust as needed for smoothness vs performance
  };
  
  // When we close, ensure we pass the final selected color back
  const handleClose = () => {
    // Clear any pending timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    // Only update if we haven't just sent an update
    if (isPickingRef.current) {
      if (onColorChange) {
        onColorChange(localColor);
      }
      isPickingRef.current = false;
    }
    
    onClose();
  };
  
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      disableRestoreFocus
    >
      <Box sx={{ p: 2 }}>
        <HexColorPicker
          color={localColor}
          onChange={handleChange}
          style={{ width: 200, height: 200 }}
        />
      </Box>
    </Popover>
  );
}

export default ColorPickerPopover;