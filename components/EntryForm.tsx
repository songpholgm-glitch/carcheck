import React, { useState, useRef, useEffect } from 'react';
import { RegisteredVehicle, VehicleType, Direction, LogEntry } from '../types';
import { analyzeLicensePlate } from '../services/geminiService';

interface EntryFormProps {
  registeredVehicles: RegisteredVehicle[];
  onAddLog: (log: LogEntry) => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({ registeredVehicles, onAddLog }) => {
  const [plateNumber, setPlateNumber] = useState('');
  const [direction, setDirection] = useState<Direction>(Direction.IN);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ตรวจสอบสถานะรถอัตโนมัติเมื่อพิมพ์ทะเบียน
  const checkVehicleStatus = (plate: string): VehicleType => {
    // ตัดช่องว่างเพื่อเทียบให้แม่นยำ
    const cleanPlate = plate.replace(/\s/g, '');
    const found = registeredVehicles.find(v => v.plateNumber.replace(/\s/g, '') === cleanPlate);
    return found ? VehicleType.INTERNAL : VehicleType.VISITOR;
  };

  const vehicleType = checkVehicleStatus(plateNumber);
  const registeredInfo = registeredVehicles.find(v => v.plateNumber.replace(/\s/g, '') === plateNumber.replace(/\s/g, ''));

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusMessage('กำลังวิเคราะห์ป้ายทะเบียนด้วย AI...');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPreviewImage(base64);

      try {
        const extractedText = await analyzeLicensePlate(base64);
        if (extractedText) {
          setPlateNumber(extractedText);
          setStatusMessage(`อ่านป้ายทะเบียนสำเร็จ: ${extractedText}`);
        } else {
          setStatusMessage('ไม่สามารถอ่านป้ายทะเบียนได้ กรุณาพิมพ์เอง');
        }
      } catch (error) {
        setStatusMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ AI');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim()) {
      setStatusMessage('กรุณาระบุเลขทะเบียน');
      return;
    }

    const newLog: LogEntry = {
      id: Date.now().toString(),
      plateNumber: plateNumber.trim(),
      direction,
      vehicleType,
      timestamp: new Date().toISOString(),
      imageUrl: previewImage || undefined
    };

    onAddLog(newLog);
    
    // Reset form
    setPlateNumber('');
    setPreviewImage(null);
    setStatusMessage('บันทึกข้อมูลเรียบร้อย');
    setTimeout(() => setStatusMessage(''), 3000);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">บันทึกการเข้า-ออก</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Camera / File Input */}
          <div className="flex flex-col items-center justify-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors relative overflow-hidden"
            >
               {previewImage ? (
                 <img src={previewImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
               ) : null}
               <div className="z-10 flex flex-col items-center">
                  <span className="text-4xl mb-2">📷</span>
                  <span className="text-slate-600 font-medium">แตะเพื่อถ่ายรูปป้ายทะเบียน</span>
                  <span className="text-xs text-slate-400 mt-1">(AI OCR supported)</span>
               </div>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" // Use back camera on mobile
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden" 
            />
          </div>

          {/* Plate Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">เลขทะเบียนรถ</label>
            <input
              type="text"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="เช่น 1กข 1234"
              className="block w-full rounded-md border-slate-300 bg-slate-50 p-4 text-2xl text-center font-bold shadow-sm focus:border-security-500 focus:ring-security-500 border"
              required
            />
          </div>

          {/* Status Badge */}
          <div className={`p-4 rounded-lg text-center border ${
            vehicleType === VehicleType.INTERNAL 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-orange-50 border-orange-200 text-orange-700'
          }`}>
            <div className="font-bold text-lg">
              {vehicleType === VehicleType.INTERNAL ? '✅ รถภายใน (Registered)' : '⚠️ ผู้มาติดต่อ (Visitor)'}
            </div>
            {registeredInfo && (
              <div className="text-sm mt-1">
                เจ้าของ: {registeredInfo.ownerName} ({registeredInfo.department})
              </div>
            )}
          </div>

          {/* Direction Toggle */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setDirection(Direction.IN)}
              className={`p-4 rounded-lg border-2 font-bold text-lg transition-all ${
                direction === Direction.IN
                  ? 'border-security-600 bg-security-50 text-security-700 shadow-md scale-105'
                  : 'border-slate-200 text-slate-400 hover:bg-slate-50'
              }`}
            >
              ขาเข้า 📥
            </button>
            <button
              type="button"
              onClick={() => setDirection(Direction.OUT)}
              className={`p-4 rounded-lg border-2 font-bold text-lg transition-all ${
                direction === Direction.OUT
                  ? 'border-red-500 bg-red-50 text-red-700 shadow-md scale-105'
                  : 'border-slate-200 text-slate-400 hover:bg-slate-50'
              }`}
            >
              ขาออก 📤
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className={`w-full py-4 px-4 rounded-lg text-white text-xl font-bold shadow-lg transition-all ${
              isProcessing 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-security-600 hover:bg-security-700 active:scale-95'
            }`}
          >
            {isProcessing ? 'กำลังประมวลผล...' : 'บันทึกข้อมูล'}
          </button>

          {statusMessage && (
            <p className={`text-center font-medium ${statusMessage.includes('สำเร็จ') ? 'text-green-600' : 'text-security-600'}`}>
              {statusMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};