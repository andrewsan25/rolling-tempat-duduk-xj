import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-[#F4F6FB] text-slate-900 flex flex-col overflow-x-hidden">
        {/* Ambient Mesh Background Orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        >
          <div className="absolute -top-32 -left-24 w-[34rem] h-[34rem] rounded-full bg-blue-400/20 blur-[110px]" />
          <div className="absolute top-1/4 -right-28 w-[32rem] h-[32rem] rounded-full bg-indigo-400/20 blur-[120px]" />
          <div className="absolute -bottom-32 left-1/3 w-[30rem] h-[30rem] rounded-full bg-sky-300/20 blur-[110px]" />
          <div className="absolute inset-0 bg-dot-grid opacity-70" />
        </div>

        <Navbar />
        <main className="relative z-10 flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
