import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EntryForm } from './components/EntryForm';
import { DailyReport } from './components/DailyReport';
import { VehicleDatabase } from './components/VehicleDatabase';
import { RegisteredVehicle, LogEntry } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('entry');
  
  const [registeredVehicles, setRegisteredVehicles] = useState<RegisteredVehicle[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Fetch data from Supabase
  const fetchData = async () => {
    setIsLoading(true);
    setDbError(null);

    if (!isSupabaseConfigured) {
      console.warn("Supabase connection skipped: Missing environment variables.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch Vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .order('added_at', { ascending: false });

      if (vehiclesError) throw vehiclesError;

      // Map snake_case (DB) to camelCase (App)
      const formattedVehicles: RegisteredVehicle[] = (vehiclesData || []).map((v: any) => ({
        id: v.id,
        plateNumber: v.plate_number,
        ownerName: v.owner_name,
        department: v.department,
        addedAt: v.added_at
      }));
      setRegisteredVehicles(formattedVehicles);

      // 2. Fetch Logs
      const { data: logsData, error: logsError } = await supabase
        .from('logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (logsError) throw logsError;

      const formattedLogs: LogEntry[] = (logsData || []).map((l: any) => ({
        id: l.id,
        plateNumber: l.plate_number,
        direction: l.direction,
        vehicleType: l.vehicle_type,
        timestamp: l.timestamp,
        note: l.note,
        imageUrl: l.image_url
      }));
      setLogs(formattedLogs);

    } catch (error: any) {
      const errorMsg = error.message || JSON.stringify(error);
      console.error("Error fetching data:", errorMsg);
      setDbError("ไม่สามารถเชื่อมต่อฐานข้อมูลได้: " + errorMsg);
      // alert("เกิดข้อผิดพลาด: " + errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchData();
  }, []);

  const handleAddLog = async (log: LogEntry) => {
    // Optimistic Update (Show immediately)
    setLogs(prev => [log, ...prev]);

    if (!isSupabaseConfigured) return;

    try {
      const { error } = await supabase.from('logs').insert({
        plate_number: log.plateNumber,
        direction: log.direction,
        vehicle_type: log.vehicleType,
        timestamp: log.timestamp,
        image_url: log.imageUrl
      });

      if (error) {
        console.error("Error adding log:", error);
        alert("บันทึกข้อมูลลงฐานข้อมูลไม่สำเร็จ: " + error.message);
        fetchData(); // Revert/Refresh
      }
    } catch (err: any) {
      console.error(err);
      alert("Error: " + (err.message || "Unknown"));
    }
  };

  const handleAddVehicle = async (vehicle: RegisteredVehicle) => {
    if (!isSupabaseConfigured) {
      // Demo mode local update
      setRegisteredVehicles(prev => [vehicle, ...prev]);
      return;
    }

    try {
      // Insert into DB
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          plate_number: vehicle.plateNumber,
          owner_name: vehicle.ownerName,
          department: vehicle.department,
          added_at: vehicle.addedAt
        })
        .select(); // Return the inserted row to get ID

      if (error) throw error;

      if (data) {
        const newVehicle = {
          id: data[0].id,
          plateNumber: data[0].plate_number,
          ownerName: data[0].owner_name,
          department: data[0].department,
          addedAt: data[0].added_at
        };
        setRegisteredVehicles(prev => [newVehicle, ...prev]);
      }
    } catch (error: any) {
      console.error("Error adding vehicle:", error);
      alert("ไม่สามารถเพิ่มข้อมูลรถได้: " + (error.message || "Unknown error"));
    }
  };

  const handleRemoveVehicle = async (id: string) => {
    // Optimistic remove
    const originalVehicles = [...registeredVehicles];
    setRegisteredVehicles(prev => prev.filter(v => v.id !== id));

    if (!isSupabaseConfigured) return;

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;

    } catch (error: any) {
      console.error("Error deleting vehicle:", error);
      alert("ลบข้อมูลไม่สำเร็จ: " + error.message);
      setRegisteredVehicles(originalVehicles); // Revert
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-slate-500 gap-4">
        <div className="w-12 h-12 border-4 border-security-500 border-t-transparent rounded-full animate-spin"></div>
        <p>กำลังเชื่อมต่อฐานข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Setup Warning Banner */}
      {!isSupabaseConfigured && (
        <div className="bg-yellow-100 border-b border-yellow-200 text-yellow-800 px-4 py-2 text-sm text-center">
          ⚠️ <strong>Demo Mode:</strong> ยังไม่ได้เชื่อมต่อฐานข้อมูล Supabase ข้อมูลจะไม่ถูกบันทึกถาวร (กรุณาตั้งค่า .env)
        </div>
      )}

      {/* Error Banner */}
      {dbError && isSupabaseConfigured && (
        <div className="bg-red-100 border-b border-red-200 text-red-800 px-4 py-2 text-sm text-center flex justify-between items-center">
          <span>🚨 {dbError}</span>
          <button onClick={fetchData} className="underline ml-2 hover:text-red-900">ลองใหม่</button>
        </div>
      )}
      
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