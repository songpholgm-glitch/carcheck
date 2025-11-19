import React, { useState } from 'react';
import { RegisteredVehicle } from '../types';

interface VehicleDatabaseProps {
  vehicles: RegisteredVehicle[];
  onAddVehicle: (vehicle: RegisteredVehicle) => void;
  onRemoveVehicle: (id: string) => void;
}

export const VehicleDatabase: React.FC<VehicleDatabaseProps> = ({ vehicles, onAddVehicle, onRemoveVehicle }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    plateNumber: '',
    ownerName: '',
    department: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plateNumber || !formData.ownerName) return;

    const newVehicle: RegisteredVehicle = {
      id: Date.now().toString(),
      plateNumber: formData.plateNumber,
      ownerName: formData.ownerName,
      department: formData.department,
      addedAt: new Date().toISOString()
    };

    onAddVehicle(newVehicle);
    setFormData({ plateNumber: '', ownerName: '', department: '' });
    setShowForm(false);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">ฐานข้อมูลรถภายใน</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-security-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-security-700 active:scale-95 transition-all font-medium"
        >
          {showForm ? 'ยกเลิก' : '+ เพิ่มรถ'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-6 animate-fade-in-down">
          <h3 className="text-lg font-semibold mb-4">ลงทะเบียนรถใหม่</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">ทะเบียนรถ</label>
              <input
                type="text"
                value={formData.plateNumber}
                onChange={e => setFormData({...formData, plateNumber: e.target.value})}
                className="mt-1 block w-full rounded-md border border-slate-300 p-2 bg-slate-50"
                placeholder="เช่น 1กข 1234"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">ชื่อเจ้าของ</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={e => setFormData({...formData, ownerName: e.target.value})}
                className="mt-1 block w-full rounded-md border border-slate-300 p-2 bg-slate-50"
                placeholder="ชื่อ-นามสกุล"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">แผนก/หน่วยงาน</label>
              <input
                type="text"
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
                className="mt-1 block w-full rounded-md border border-slate-300 p-2 bg-slate-50"
                placeholder="เช่น ฝ่ายบัญชี"
              />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700">
              บันทึกข้อมูล
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((v) => (
          <div key={v.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col relative group">
            <button 
              onClick={() => {
                 if(confirm('ต้องการลบข้อมูลรถคันนี้ใช่หรือไม่?')) onRemoveVehicle(v.id);
              }}
              className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors p-1"
            >
              🗑️
            </button>
            <div className="text-xl font-bold text-slate-800 mb-1">{v.plateNumber}</div>
            <div className="text-sm text-slate-600 font-medium">👤 {v.ownerName}</div>
            <div className="text-xs text-slate-500 mt-1">🏢 {v.department || '-'}</div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
              Registered: {new Date(v.addedAt).toLocaleDateString('th-TH')}
            </div>
          </div>
        ))}
        {vehicles.length === 0 && !showForm && (
          <div className="col-span-full text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            ยังไม่มีข้อมูลรถภายในที่ลงทะเบียน
          </div>
        )}
      </div>
    </div>
  );
};