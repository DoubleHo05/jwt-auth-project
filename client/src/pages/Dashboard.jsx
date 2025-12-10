import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="card dashboard-container">
      <h1>Dashboard</h1>
      
      {user ? (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ 
            width: '80px', height: '80px', background: '#e0e7ff', 
            borderRadius: '50%', margin: '0 auto 15px', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', fontSize: '2rem' 
          }}>
            👤
          </div>
          <h2 style={{ margin: 0 }}>{user.name}</h2>
          <p style={{ color: '#6b7280' }}>{user.email}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}

      <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h4 style={{ marginBottom: '5px' }}>🔒 Protected Session</h4>
        <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>
          You are successfully authenticated. This data is retrieved using your secure Access Token.
        </p>
      </div>

      <button onClick={() => logout()} style={{ background: '#ef4444', marginTop: '20px' }}>
        Log Out
      </button>
    </div>
  );
};

export default Dashboard;