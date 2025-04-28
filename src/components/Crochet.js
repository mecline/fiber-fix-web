import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button,
  Fade
} from '@mui/material';
import { 
  Construction as ConstructionIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  Palette as PaletteIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { theme as customTheme } from '../theme';

function Crochet() {
  const featureCards = [
    {
      title: "Pattern Library",
      icon: <PaletteIcon fontSize="large" />,
      description: "Save and organize your favorite crochet patterns in one place. Track your progress and add notes.",
      comingSoon: true
    },
    {
      title: "Stitch Counter",
      icon: <TimerIcon fontSize="large" />,
      description: "Keep track of your stitch count with our easy-to-use counter tools. Multiple counters for complex patterns.",
      comingSoon: true
    },
    {
      title: "Crochet Calculator",
      icon: <ConstructionIcon fontSize="large" />,
      description: "Calculate yarn requirements, gauge, and project dimensions with our handy calculators.",
      comingSoon: true
    }
  ];

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
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                color: customTheme.colors.primary,
                fontWeight: 600,
                mb: 2
              }}
            >
              Crochet Tools
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                maxWidth: 700, 
                mx: 'auto', 
                mb: 5, 
                color: customTheme.colors.textLight 
              }}
            >
              Organize your crochet projects, manage your yarn inventory, and more with our upcoming tools.
            </Typography>
            
            <Grid container spacing={3} justifyContent="center">
              {featureCards.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: customTheme.boxShadow.md
                      },
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {feature.comingSoon && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: -30,
                          transform: 'rotate(45deg)',
                          width: 120,
                          textAlign: 'center',
                          padding: '4px 0',
                          backgroundColor: customTheme.colors.accent,
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          zIndex: 1
                        }}
                      >
                        COMING SOON
                      </Box>
                    )}
                    <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          mb: 2,
                          '& .MuiSvgIcon-root': {
                            color: customTheme.colors.primary,
                            fontSize: '3rem'
                          }
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography 
                        variant="h5" 
                        component="h2" 
                        gutterBottom 
                        sx={{ 
                          textAlign: 'center',
                          fontWeight: 600,
                          mb: 2
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        color="textSecondary"
                        sx={{ 
                          textAlign: 'center',
                          mb: 3,
                          flexGrow: 1
                        }}
                      >
                        {feature.description}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        fullWidth
                        disabled={feature.comingSoon}
                      >
                        {feature.comingSoon ? 'Coming Soon' : 'Get Started'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 8, mb: 4, p: 3, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: customTheme.borderRadius.lg }}>
              <EmojiEmotionsIcon 
                sx={{ 
                  fontSize: '3rem', 
                  color: customTheme.colors.accent,
                  mb: 2
                }} 
              />
              <Typography variant="h5" gutterBottom>
                We're Working On It!
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: 700, mx: 'auto' }}>
                The Crochet section is currently under development. We're working hard to bring you helpful tools for all your crochet projects. Check back soon for updates!
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
}

export default Crochet;