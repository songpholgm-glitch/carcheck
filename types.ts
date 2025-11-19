export enum VehicleType {
  INTERNAL = 'INTERNAL', // รถภายใน
  VISITOR = 'VISITOR'    // ผู้มาติดต่อ
}

export enum Direction {
  IN = 'IN',   // เข้า
  OUT = 'OUT'  // ออก
}

export interface RegisteredVehicle {
  id: string;
  plateNumber: string;
  ownerName: string;
  department: string; // แผนก/หน่วยงาน
  addedAt: string;
}

export interface LogEntry {
  id: string;
  plateNumber: string;
  direction: Direction;
  vehicleType: VehicleType;
  timestamp: string;
  note?: string;
  imageUrl?: string; // Optional: store base64 thumbnail if needed (careful with storage limits)
}

export interface AppState {
  logs: LogEntry[];
  registeredVehicles: RegisteredVehicle[];
}