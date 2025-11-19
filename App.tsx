import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EntryForm } from './components/EntryForm';
import { DailyReport } from './components/DailyReport';
import { VehicleDatabase } from './components/VehicleDatabase';
import { RegisteredVehicle, LogEntry } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('entry');
  
  // Simulated Database State (In a real app, these would fetch from Postgres via API)
  const [registeredVehicles, setRegisteredVehicles] = useState<RegisteredVehicle[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount (Mocking DB load)
  useEffect(() => {
    try {
      const savedVehicles = localStorage.getItem('security_registered_vehicles');
      const savedLogs = localStorage.getItem('security_logs');
      
      if (savedVehicles) setRegisteredVehicles(JSON.parse(savedVehicles));
      else {
        // Seed initial data
        setRegisteredVehicles([
           { id: '1', plateNumber: '1กก 9999', ownerName: 'ผอ. สมชาย', department: 'บริหาร', addedAt: new Date().toISOString() }
        ]);
      }

      if (savedLogs) setLogs(JSON.parse(savedLogs));
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist data changes (Mocking DB save)
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('security_registered_vehicles', JSON.stringify(registeredVehicles));
    }
  }, [registeredVehicles, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('security_logs', JSON.stringify(logs));
    }
  }, [logs, isLoading]);

  const handleAddLog = (log: LogEntry) => {
    setLogs(prev => [log, ...prev]);
  };

  const handleAddVehicle = (vehicle: RegisteredVehicle) => {
    setRegisteredVehicles(prev => [...prev, vehicle]);
  };

  const handleRemoveVehicle = (id: string) => {
    setRegisteredVehicles(prev => prev.filter(v => v.id !== id));
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-500">Loading System...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="pt-6">
        {activeTab === 'entry' && (
          <EntryForm 
            registeredVehicles={registeredVehicles} 
            onAddLog={handleAddLog} 
          />
        )}
        
        {activeTab === 'report' && (
          <DailyReport logs={logs} />
        )}
        
        {activeTab === 'database' && (
          <VehicleDatabase 
            vehicles={registeredVehicles}
            onAddVehicle={handleAddVehicle}
            onRemoveVehicle={handleRemoveVehicle}
          />
        )}
      </main>
    </div>
  );
};

export default App;