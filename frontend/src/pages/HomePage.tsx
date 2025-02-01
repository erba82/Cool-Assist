import React from 'react';
import { Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';

const HomePage = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Welcome to Cool-Assist
      </Typography>
      <Typography variant="subtitle1" paragraph>
        Your AI-powered HVAC Assistant
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">AI Chat Assistant</Typography>
              <Typography variant="body2">
                Get instant answers to your HVAC questions using our AI-powered chat system.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary" href="/chat">
                Start Chat
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">HVAC Calculator</Typography>
              <Typography variant="body2">
                Calculate load requirements and system specifications.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary" href="/calculator">
                Open Calculator
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Knowledge Base</Typography>
              <Typography variant="body2">
                Access comprehensive HVAC documentation and guides.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary" href="/knowledge">
                Browse Knowledge
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default HomePage;