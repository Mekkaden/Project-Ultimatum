"use client";

interface TimePickerProps {
  value: string; // "HH:MM" 24-hour format
  onChange: (val: string) => void;
}

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const safeValue = value ?? "07:00";
  const parts = safeValue.split(':');
  const h = parts[0] ?? "07";
  const m = parts[1] ?? "00";

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-black border border-white/10 rounded-lg overflow-hidden focus-within:border-[#e4fcaf]/30 transition-colors px-1">
        <input 
          type="text" 
          inputMode="numeric"
          value={h === "" ? "" : (parseInt(h) % 12 || 12)}
          onChange={(e) => {
             if (e.target.value === "") {
               onChange(`:${m}`);
               return;
             }
             let newH12 = parseInt(e.target.value);
             if (isNaN(newH12)) return;
             if (newH12 > 12) newH12 = 12;
             if (newH12 < 1) newH12 = 1;
             const isPM = parseInt(h || "0") >= 12;
             let newH24 = newH12;
             if (isPM && newH12 < 12) newH24 += 12;
             if (!isPM && newH12 === 12) newH24 = 0;
             onChange(`${newH24.toString().padStart(2, '0')}:${m}`);
          }}
          onFocus={(e) => e.target.select()}
          onBlur={() => {
             if (h === "") onChange(`12:${m}`);
          }}
          className="w-12 text-center bg-transparent py-2 text-sm font-black text-white outline-none appearance-none"
        />
        <span className="text-white/30 font-black mb-0.5">:</span>
        <input 
          type="text"
          inputMode="numeric"
          value={m === "" ? "" : m}
          onChange={(e) => {
             if (e.target.value === "") {
               onChange(`${h}:`);
               return;
             }
             let newMin = parseInt(e.target.value);
             if (isNaN(newMin)) return;
             if (newMin > 59) newMin = 59;
             if (newMin < 0) newMin = 0;
             onChange(`${h}:${newMin.toString().padStart(2, '0')}`);
          }}
          onFocus={(e) => e.target.select()}
          onBlur={() => {
             if (m === "") onChange(`${h}:00`);
          }}
          className="w-12 text-center bg-transparent py-2 text-sm font-black text-white outline-none appearance-none"
        />
      </div>
      
      <div className="flex bg-black border border-white/10 rounded-lg overflow-hidden p-0.5">
        <button 
          type="button"
          onClick={() => {
             const h24 = parseInt(h || "0");
             if (h24 >= 12) {
               onChange(`${(h24 - 12).toString().padStart(2, '0')}:${m}`);
             }
          }}
          className={`px-3 py-2 text-[10px] font-black tracking-widest rounded-md transition-colors ${parseInt(h || "0") < 12 ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-white'}`}
        >AM</button>
        <button 
          type="button"
          onClick={() => {
             const h24 = parseInt(h || "0");
             if (h24 < 12) {
               onChange(`${(h24 + 12).toString().padStart(2, '0')}:${m}`);
             }
          }}
          className={`px-3 py-2 text-[10px] font-black tracking-widest rounded-md transition-colors ${parseInt(h || "0") >= 12 ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-white'}`}
        >PM</button>
      </div>
    </div>
  );
}
