import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EntryForm } from './components/EntryForm';
import { DailyReport } from './components/DailyReport';
import { VehicleDatabase } from './components/VehicleDatabase';
import { RegisteredVehicle, LogEntry } from './types';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('entry');
  
  const [registeredVehicles, setRegisteredVehicles] = useState<RegisteredVehicle[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูลจาก Supabase
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // ดึงข้อมูลรถ (Mapping snake_case to camelCase)
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .order('added_at', { ascending: false });

      if (vehiclesError) throw vehiclesError;

      const formattedVehicles: RegisteredVehicle[] = (vehiclesData || []).map((v: any) => ({
        id: v.id,
        plateNumber: v.plate_number,
        ownerName: v.owner_name,
        department: v.department,
        addedAt: v.added_at
      }));

      setRegisteredVehicles(formattedVehicles);

      // ดึงข้อมูล Log
      const { data: logsData, error: logsError } = await supabase
        .from('logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100); // ดึง 100 รายการล่าสุดเพื่อประสิทธิภาพ

      if (logsError) throw logsError;

      const formattedLogs: LogEntry[] = (logsData || []).map((l: any) => ({
        id: l.id,
        plateNumber: l.plate_number,
        direction: l.direction,
        vehicleType: l.vehicle_type,
        timestamp: l.timestamp,
        note: l.note,
        imageUrl: l.image_data
      }));

      setLogs(formattedLogs);

    } catch (error) {
      console.error("Error fetching data:", error);
      // ไม่ alert ถ้ารันครั้งแรกแล้วยังไม่มี config เพื่อไม่ให้รบกวน user มากเกินไป
      if (process.env.SUPABASE_URL) {
         alert("ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบการตั้งค่า");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleAddLog = async (log: LogEntry) => {
    // Optimistic update
    const tempLog = { ...log, id: 'temp-' + Date.now() };
    setLogs(prev => [tempLog, ...prev]);

    try {
      const { data, error } = await supabase.from('logs').insert([{
        plate_number: log.plateNumber,
        direction: log.direction,
        vehicle_type: log.vehicleType,
        timestamp: log.timestamp,
        image_data: log.imageUrl, 
        note: log.note
      }]).select();

      if (error) throw error;

      // ถ้าบันทึกสำเร็จ ให้โหลดข้อมูลใหม่เพื่อให้ได้ ID จริงและข้อมูลล่าสุด
      if (data) {
        fetchData();
      }
    } catch (error) {
      console.error("Error adding log:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลลง Server");
      // Revert optimistic update (optional: complex to implement perfectly in simple demo)
      setLogs(prev => prev.filter(l => l.id !== tempLog.id));
    }
  };

  const handleAddVehicle = async (vehicle: RegisteredVehicle) => {
    // Optimistic update
    const tempVehicle = { ...vehicle, id: 'temp-' + Date.now() };
    setRegisteredVehicles(prev => [tempVehicle, ...prev]);

    try {
      const { data, error } = await supabase.from('vehicles').insert([{
        plate_number: vehicle.plateNumber,
        owner_name: vehicle.ownerName,
        department: vehicle.department,
        added_at: vehicle.addedAt
      }]).select();

      if (error) throw error;

      if (data) {
        fetchData(); // Reload to get the real UUID
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลรถ");
      setRegisteredVehicles(prev => prev.filter(v => v.id !== tempVehicle.id));
    }
  };

  const handleRemoveVehicle = async (id: string) => {
    // Optimistic update
    const previousVehicles = [...registeredVehicles];
    setRegisteredVehicles(prev => prev.filter(v => v.id !== id));

    try {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Error removing vehicle:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      setRegisteredVehicles(previousVehicles); // Revert
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-slate-500">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <div>กำลังโหลดข้อมูล...</div>
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