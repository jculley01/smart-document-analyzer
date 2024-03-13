import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Grid, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { UserProvider, useUser } from './UserContext';
import FileUpload from './FileUpload';
import Documents from './components/Documents';
import Sentiment from './components/Sentiment';
import OAuthLogin from './components/OAuthLogin';
import credentials from './credentials.json';
import { jwtDecode } from 'jwt-decode'; // Corrected import statement

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

const AppContent = () => {
  const [uploadTrigger, setUploadTrigger] = React.useState(false);
  const { user, login, logout } = useUser();

  const handleUploadSuccess = () => {
    setTimeout(() => {
      setUploadTrigger(prev => !prev);
    }, 5000); // 5000 milliseconds = 5 seconds
  };

  const handleAuthSuccess = (response) => {
    const decodedToken = jwtDecode(response.credential);
    login({
      sub: decodedToken.sub,
      name: decodedToken.name,
      email: decodedToken.email,
    });
  };

  const handleAuthFailure = (error) => {
    console.error('Authentication failed:', error);
    logout(); // Use logout from context
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Document Management System
          </Typography>
          {!user ? (
            <OAuthLogin onSuccess={handleAuthSuccess} onFailure={handleAuthFailure} />
          ) : (
            <Button color="inherit" onClick={logout}>Logout</Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        {user && (
          <>
            <Typography
              variant="h4" // Changed for a slightly larger size
              gutterBottom
              sx={{
                mt: 2,
                textAlign: 'center',
                color: 'deepSkyBlue',
                fontFamily: 'Arial', 
                fontWeight: 'bold',
              }}
            >
              Welcome, {user.name}!
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}><FileUpload onUploadSuccess={handleUploadSuccess} /></Grid>
              <Grid item xs={12}><Sentiment /></Grid>
              <Grid item xs={12}><Documents uploadTrigger={uploadTrigger} /></Grid>
            </Grid>
          </>
        )}
      </Container>


    </ThemeProvider>
  );
};

const App = () => (
  <GoogleOAuthProvider clientId={credentials.web.client_id}>
    <UserProvider> {/* UserProvider wraps AppContent now */}
      <AppContent />
    </UserProvider>
  </GoogleOAuthProvider>
);

export default App;
