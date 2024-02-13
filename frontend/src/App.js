import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Grid, Card, CardContent, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import FileUpload from './FileUpload';
import Documents from './components/Documents';
import Sentiment from './components/Sentiment';

const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
  },
});

const App = () => {
  const [uploadTrigger, setUploadTrigger] = useState(false);

  const handleUploadSuccess = () => {
    setUploadTrigger(prev => !prev);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            Document Management System
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  File Upload Portal
                </Typography>
                <FileUpload onUploadSuccess={handleUploadSuccess} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Find Paragraphs and Sentences:
                </Typography>
                <Sentiment />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Documents Section
                </Typography>
                <Documents uploadTrigger={uploadTrigger} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
};

export default App;
