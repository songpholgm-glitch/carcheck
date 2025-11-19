import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EntryForm } from './components/EntryForm';
import { DailyReport } from './components/DailyReport';
import { VehicleDatabase } from './components/VehicleDatabase';
import { RegisteredVehicle, LogEntry } from './types';
import { databaseService } from './services/databaseService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('entry');
  
  const [registeredVehicles, setRegisteredVehicles] = useState<RegisteredVehicle[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from Supabase
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [vehiclesData, logsData] = await Promise.all([
        databaseService.getVehicles(),
        databaseService.getLogs()
      ]);
      setRegisteredVehicles(vehiclesData);
      setLogs(logsData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddLog = async (log: LogEntry) => {
    // Optimistic UI update (optional) or Wait for DB
    // Here we wait for DB to ensure data integrity
    const newLog = await databaseService.addLog(log);
    if (newLog) {
      setLogs(prev => [newLog, ...prev]);
    } else {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล");
    }
  };

  const handleAddVehicle = async (vehicle: RegisteredVehicle) => {
    const newVehicle = await databaseService.addVehicle(vehicle);
    if (newVehicle) {
      setRegisteredVehicles(prev => [newVehicle, ...prev]);
    } else {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลรถ");
    }
  };

  const handleRemoveVehicle = async (id: string) => {
    const success = await databaseService.removeVehicle(id);
    if (success) {
      setRegisteredVehicles(prev => prev.filter(v => v.id !== id));
    } else {
      alert("ไม่สามารถลบข้อมูลได้");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-slate-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-security-600 mb-4"></div>
        Loading System...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-red-500">
        <div className="text-xl font-bold mb-2">Error</div>
        {error}
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-security-600 text-white rounded hover:bg-security-700"
        >
          Retry
        </button>
      </div>
    );
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