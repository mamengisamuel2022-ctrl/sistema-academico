import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Login from './pages/Login';
import Registrar from './pages/Registrar';
import ReclamacaoForm from './components/Reclamacao/ReclamacaoForm';
import ReclamacaoList from './components/Reclamacao/ReclamacaoList';
import ReclamacaoDetalhes from './pages/ReclamacaoDetalhes';
import Dashboard from './pages/Dashboard';

import GerenciarTickets from './pages/GerenciarTickets';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

// Componente de rota protegida
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componente principal com rotas
function AppRoutes() {
  const { usuario, isAuthenticated } = useAuth();

  console.log('🔐 Auth State:', { isAuthenticated, tipo: usuario?.tipo, nome: usuario?.nome });

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/registrar" element={!isAuthenticated ? <Registrar /> : <Navigate to="/" replace />} />
        
        {/* Rota principal */}
        <Route path="/" element={
          <PrivateRoute>
            <ReclamacaoList />
          </PrivateRoute>
        } />
        
        {/* ✅ Nova Reclamação - APENAS ESTUDANTE */}
        <Route path="/nova-reclamacao" element={
          <PrivateRoute>
            {usuario?.tipo === 'estudante' ? (
              <ReclamacaoForm />
            ) : (
              <Navigate to="/" replace />
            )}
          </PrivateRoute>
        } />

        <Route path="/tickets" element={
          <PrivateRoute>
            {['admin', 'coordenador', 'atendente'].includes(usuario?.tipo) ? (
              <GerenciarTickets />
            ) : (
              <Navigate to="/" replace />
            )}
          </PrivateRoute>
        } />
        
        {/* Lista de reclamações */}
        <Route path="/reclamacoes" element={
          <PrivateRoute>
            <ReclamacaoList />
          </PrivateRoute>
        } />
        
        {/* Detalhes */}
        <Route path="/reclamacao/:id" element={
          <PrivateRoute>
            <ReclamacaoDetalhes />
          </PrivateRoute>
        } />
        
        {/* Dashboard - APENAS ADMIN */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            {usuario?.tipo === 'admin' ? (
              <Dashboard />
            ) : (
              <Navigate to="/" replace />
            )}
          </PrivateRoute>
        } />
        
        {/* Tickets */}
        <Route path="/tickets" element={
          <PrivateRoute>
            {['admin', 'coordenador', 'atendente'].includes(usuario?.tipo) ? (
              <ReclamacaoList />
            ) : (
              <Navigate to="/" replace />
            )}
          </PrivateRoute>
        } />
        
        {/* Rota não encontrada */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;