import React, { useMemo } from 'react';
import { LogEntry, VehicleType, Direction } from '../types';

interface DailyReportProps {
  logs: LogEntry[];
}

export const DailyReport: React.FC<DailyReportProps> = ({ logs }) => {
  // Filter for today (simulated, as logs state in this demo holds all session data)
  const todayLogs = useMemo(() => {
    // In a real app, this would query the DB. Here we sort by newest first.
    return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs]);

  const stats = useMemo(() => {
    return {
      total: todayLogs.length,
      internal: todayLogs.filter(l => l.vehicleType === VehicleType.INTERNAL).length,
      visitor: todayLogs.filter(l => l.vehicleType === VehicleType.VISITOR).length,
      in: todayLogs.filter(l => l.direction === Direction.IN).length,
      out: todayLogs.filter(l => l.direction === Direction.OUT).length,
    };
  }, [todayLogs]);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto pb-20">
      <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        📊 รายงานประจำวัน
        <span className="text-sm font-normal text-slate-500 ml-auto">
          {new Date().toLocaleDateString('th-TH', { dateStyle: 'full' })}
        </span>
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold uppercase">ทั้งหมด</p>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-xs text-green-600 font-semibold uppercase">รถภายใน</p>
          <p className="text-2xl font-bold text-green-900">{stats.internal}</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
          <p className="text-xs text-orange-600 font-semibold uppercase">ผู้มาติดต่อ</p>
          <p className="text-2xl font-bold text-orange-900">{stats.visitor}</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-600 font-semibold uppercase">เข้า/ออก</p>
          <div className="flex gap-2 text-sm font-bold">
            <span className="text-green-600">In: {stats.in}</span>
            <span className="text-red-600">Out: {stats.out}</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {todayLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400">ยังไม่มีข้อมูลวันนี้</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                    log.direction === Direction.IN ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {log.direction === Direction.IN ? '📥' : '📤'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-lg">{log.plateNumber}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                        log.vehicleType === VehicleType.INTERNAL ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {log.vehicleType === VehicleType.INTERNAL ? 'ภายใน' : 'ติดต่อ'}
                      </span>
                      <span>• {formatTime(log.timestamp)} น.</span>
                    </div>
                  </div>
                </div>
                {log.imageUrl && (
                  <div className="w-16 h-10 bg-slate-100 rounded overflow-hidden border border-slate-200">
                    <img src={log.imageUrl} alt="Plate" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};