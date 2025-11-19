import { supabase } from '../lib/supabaseClient';
import { LogEntry, RegisteredVehicle, Direction, VehicleType } from '../types';

// --- Mapping Functions (DB Snake_case <-> App CamelCase) ---

const mapLogFromDB = (data: any): LogEntry => ({
  id: data.id,
  plateNumber: data.plate_number,
  direction: data.direction as Direction,
  vehicleType: data.vehicle_type as VehicleType,
  timestamp: data.timestamp,
  note: data.note,
  imageUrl: data.image_url
});

const mapVehicleFromDB = (data: any): RegisteredVehicle => ({
  id: data.id,
  plateNumber: data.plate_number,
  ownerName: data.owner_name,
  department: data.department,
  addedAt: data.added_at
});

// --- Service Methods ---

export const databaseService = {
  // 1. Get all logs
  async getLogs(): Promise<LogEntry[]> {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapLogFromDB);
  },

  // 2. Add a log
  async addLog(log: Omit<LogEntry, 'id'>): Promise<LogEntry | null> {
    const { data, error } = await supabase
      .from('logs')
      .insert([{
        plate_number: log.plateNumber,
        direction: log.direction,
        vehicle_type: log.vehicleType,
        timestamp: log.timestamp,
        note: log.note,
        image_url: log.imageUrl
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding log:', error);
      return null;
    }
    return mapLogFromDB(data);
  },

  // 3. Get all registered vehicles
  async getVehicles(): Promise<RegisteredVehicle[]> {
    const { data, error } = await supabase
      .from('registered_vehicles')
      .select('*')
      .order('added_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapVehicleFromDB);
  },

  // 4. Add a registered vehicle
  async addVehicle(vehicle: Omit<RegisteredVehicle, 'id'>): Promise<RegisteredVehicle | null> {
    const { data, error } = await supabase
      .from('registered_vehicles')
      .insert([{
        plate_number: vehicle.plateNumber,
        owner_name: vehicle.ownerName,
        department: vehicle.department,
        added_at: vehicle.addedAt
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding vehicle:', error);
      return null;
    }
    return mapVehicleFromDB(data);
  },

  // 5. Remove a registered vehicle
  async removeVehicle(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('registered_vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vehicle:', error);
      return false;
    }
    return true;
  }
};