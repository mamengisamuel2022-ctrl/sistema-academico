import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Função para decodificar o token JWT manualmente
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };

  // Verificar se o token é válido
  const isTokenValido = (token) => {
    if (!token) return false;
    
    const decoded = parseJwt(token);
    if (!decoded) return false;
    
    // Verificar expiração
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  };

  // Configurar axios
  useEffect(() => {
    if (token && isTokenValido(token)) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      carregarUsuario();
    } else {
      logout();
    }
  }, [token]);

  const carregarUsuario = async () => {
    try {
      const { data } = await axios.get('https://sistema-academico-w5ov.onrender.com/api/auth/perfil');
      setUsuario(data.usuario);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    try {
      const { data } = await axios.post('https://sistema-academico-w5ov.onrender.com/api/auth/login', {
        email,
        senha
      });
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUsuario(data.usuario);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao fazer login'
      };
    }
  };

  const registrar = async (dados) => {
    try {
      const { data } = await axios.post('https://sistema-academico-w5ov.onrender.com/api/auth/registrar', dados);
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUsuario(data.usuario);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao registrar'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUsuario(null);
    setLoading(false);
  };

  const value = {
    usuario,
    login,
    registrar,
    logout,
    loading,
    isAuthenticated: !!usuario,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;