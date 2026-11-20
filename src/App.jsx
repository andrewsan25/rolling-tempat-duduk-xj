import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import {
  getSavedUser,
  saveLoggedUser,
  saveCustomNameForRole,
  attachCustomName,
} from './utils/authRoles';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getSavedUser());
  const [activeTab, setActiveTab] = useState(
    () => getSavedUser()?.allowedTabs?.[0] || 'seats'
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogin = (roleObj) => {
    const withName = attachCustomName(roleObj);
    saveLoggedUser(withName);
    setCurrentUser(withName);
    if (withName?.allowedTabs?.length) {
      setActiveTab(withName.allowedTabs[0]);
    }
  };

  const handleLogout = () => {
    saveLoggedUser(null);
    setCurrentUser(null);
    setIsSettingsOpen(false);
  };

  const handleUpdateUserName = (newName) => {
    if (!currentUser) return;
    const savedName = saveCustomNameForRole(currentUser.id, newName);
    setCurrentUser((prev) => (prev ? { ...prev, customName: savedName } : null));
  };

  return (
    <Router>
      <div className="relative min-h-screen bg-[#FAF5EE] text-[#2C1E14] flex flex-col overflow-x-hidden">
        {/* Warm Soft Brown to Cream Ambient Orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        >
          <div className="absolute -top-32 -left-24 w-[36rem] h-[36rem] rounded-full bg-[#D7B899]/35 blur-[120px]" />
          <div className="absolute top-1/4 -right-28 w-[34rem] h-[34rem] rounded-full bg-[#C89F78]/25 blur-[130px]" />
          <div className="absolute -bottom-32 left-1/3 w-[32rem] h-[32rem] rounded-full bg-[#E8D5BE]/45 blur-[110px]" />
          <div className="absolute inset-0 bg-dot-grid opacity-75" />
        </div>

        <Navbar
          currentUser={currentUser}
          onLogout={handleLogout}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          onUpdateUserName={handleUpdateUserName}
        />
        <main className="relative z-10 flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  currentUser={currentUser}
                  onLogin={handleLogin}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              }
            />
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  currentUser={currentUser}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
