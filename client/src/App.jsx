import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CommandCenter from './pages/CommandCenter';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';
import { startKeepAlive } from './utils/keepAlive';

function App() {
  const { currentUser, loading } = useAuth();

  // Start keep-alive pinging immediately to prevent Render cold starts
  useEffect(() => { startKeepAlive(); }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-darker text-white">Initializing ORION Protocol...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {currentUser && <Navbar />}
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={currentUser ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/command-center" element={currentUser ? <CommandCenter /> : <Navigate to="/login" />} />
          <Route path="/settings" element={currentUser ? <Settings /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
