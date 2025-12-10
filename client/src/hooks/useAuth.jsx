import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { setAuthToken } from '../api/axios';
import { useNavigate } from 'react-router-dom';

// Fetch User Profile
const fetchUser = async () => {
  const { data } = await api.get('/me');
  return data;
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Query to get current user data (Enabled only if we have a token implies we are logged in)
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    retry: false,
    // Only run this query if we actually have a refresh token in storage
    enabled: !!localStorage.getItem('refreshToken'), 
  });

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const { data } = await api.post('/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      // 1. Store Refresh Token in LocalStorage
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // 2. Store Access Token in Memory (via Axios Headers)
      setAuthToken(data.accessToken);

      // 3. Force fetch user data
      queryClient.invalidateQueries(['user']);
      navigate('/dashboard');
    },
  });

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/logout', { token: refreshToken });
    },
    onSettled: () => {
      localStorage.removeItem('refreshToken');
      setAuthToken(null);
      queryClient.clear();
      navigate('/login');
    },
  });

  // ... inside useAuth ...

  return {
    user,
    isLoading, // Loading state for fetching user
    
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    
    // ADD THESE TWO LINES:
    loginError: loginMutation.error, // The actual error object from Axios
    isLoginError: loginMutation.isError, // Boolean: true if login failed
    
    logout: logoutMutation.mutate,
  };
};
