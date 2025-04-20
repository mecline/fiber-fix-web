import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider, 
  Avatar, 
  useMediaQuery, 
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  EmojiNature,
  Create as CreateIcon,
  Fingerprint as FingerprintIcon,
  ExitToApp as LogoutIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { theme as customTheme } from '../theme';

function NavBar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const userMenuOpen = Boolean(userMenuAnchor);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      handleUserMenuClose();
      if (drawerOpen) setDrawerOpen(false);
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navItems = [
    { name: 'Embroidery', path: '/embroidery', icon: <EmojiNature /> },
    { name: 'Knitting', path: '/knitting', icon: <CreateIcon /> },
    { name: 'Crochet', path: '/crochet', icon: <FingerprintIcon /> }
  ];

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const drawerContent = (
    <Box
      sx={{
        width: 250,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}
      role="presentation"
    >
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          bgcolor: customTheme.colors.primary,
          color: 'white'
        }}
      >
        <Typography variant="h6" component="div">
          Fiber Fix
        </Typography>
        <IconButton 
          color="inherit" 
          onClick={handleDrawerToggle}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.name}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{
              bgcolor: isActive(item.path) ? customTheme.colors.primaryLight + '40' : 'transparent',
              '&:hover': {
                bgcolor: customTheme.colors.primaryLight + '30'
              }
            }}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? customTheme.colors.primary : customTheme.colors.textLight }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.name} 
              sx={{ 
                color: isActive(item.path) ? customTheme.colors.primary : customTheme.colors.text 
              }}
            />
          </ListItem>
        ))}
      </List>
      <Divider />
      {user ? (
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: customTheme.colors.primary, mr: 2 }}>
              {getInitials(user.email)}
            </Avatar>
            <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
              {user.email}
            </Typography>
          </Box>
          <Button 
            fullWidth 
            variant="outlined" 
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            color="primary"
          >
            Logout
          </Button>
        </Box>
      ) : (
        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            fullWidth
            component={Link}
            to="/login"
            onClick={handleDrawerToggle}
          >
            Login
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth
            component={Link}
            to="/register"
            onClick={handleDrawerToggle}
          >
            Register
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" color="default" elevation={3} sx={{ bgcolor: customTheme.colors.background }}>
        <Toolbar>
          {isMobile ? (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          ) : null}
          
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              fontFamily: customTheme.font.family.heading,
              fontWeight: customTheme.font.weight.bold,
              textDecoration: 'none',
              color: customTheme.colors.primary
            }}
          >
            Fiber Fix
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, mx: 2 }}>
              {navItems.map((item) => (
                <Button 
                  key={item.name}
                  component={Link}
                  to={item.path}
                  color="inherit"
                  sx={{ 
                    minWidth: 100,
                    position: 'relative',
                    color: isActive(item.path) ? customTheme.colors.primary : customTheme.colors.textLight,
                    '&:hover': {
                      bgcolor: 'transparent',
                      color: customTheme.colors.primary
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '10%',
                      width: isActive(item.path) ? '80%' : '0%',
                      height: '2px',
                      bgcolor: customTheme.colors.primary,
                      transition: customTheme.transition.medium
                    },
                    '&:hover::after': {
                      width: '80%'
                    }
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>
          )}

          {/* User Menu (Desktop) */}
          {!isMobile && user ? (
            <Box>
              <Button
                color="inherit"
                onClick={handleUserMenuOpen}
                startIcon={
                  <Avatar sx={{ width: 28, height: 28, bgcolor: customTheme.colors.primary }}>
                    {getInitials(user.email)}
                  </Avatar>
                }
                sx={{ textTransform: 'none' }}
              >
                {user.email}
              </Button>
              <Menu
                anchorEl={userMenuAnchor}
                open={userMenuOpen}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          ) : !isMobile && !user ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button 
                variant="contained" 
                sx={{ 
                  bgcolor: customTheme.colors.primary,
                  '&:hover': {
                    bgcolor: customTheme.colors.primaryDark
                  }
                }} 
                component={Link} 
                to="/register"
              >
                Register
              </Button>
            </Box>
          ) : null}
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export default NavBar;