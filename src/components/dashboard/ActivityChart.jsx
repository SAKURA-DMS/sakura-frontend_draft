import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState, useMemo } from "react";
import { CalendarDays, Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfWeek, endOfWeek, addDays, eachDayOfInterval, startOfMonth, eachMonthOfInterval } from "date-fns";
import { cn } from "@/lib/utils";

const STATUS_COLORS = {
  Disetujui: "hsl(142 71% 35%)",
  Ditolak: "hsl(0 72% 51%)",
  Menunggu: "hsl(38 92% 50%)",
};

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const BULAN_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function generateDataForRange(startDate, endDate) {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const labels = [];
  const dates = [];
  const seed = [3, 5, 2, 4, 6, 3, 2, 4, 1, 3, 5, 2, 6, 3, 4, 2, 5, 3, 1, 4, 6, 2, 3, 5, 4, 2, 3, 1, 4, 5, 2];

  days.forEach((d, i) => {
    const dayName = HARI[d.getDay()];
    const bulan = BULAN_SHORT[d.getMonth()];
    labels.push(`${dayName}, ${d.getDate()} ${bulan}`);
    dates.push(format(d, "yyyy-MM-dd"));
  });

  return {
    labels,
    dates,
    disetujui: days.map((_, i) => [1, 2, 1, 1, 2, 1, 1, 2, 0, 1, 2, 1, 3, 1, 2, 1, 2, 1, 0, 1, 3, 1, 1, 2, 2, 1, 1, 0, 2, 2, 1][i % 31]),
    ditolak: days.map((_, i) => [0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0][i % 31]),
    menunggu: days.map((_, i) => [2, 2, 0, 3, 4, 1, 1, 2, 0, 2, 2, 1, 3, 1, 2, 0, 3, 2, 0, 3, 3, 0, 2, 3, 1, 1, 1, 1, 2, 2, 1][i % 31]),
  };
}

function generateMonthlyAggData(startMonth, endMonth) {
  const months = eachMonthOfInterval({ start: startMonth, end: endMonth });
  const labels = [];
  const dates = [];
  const seed = [45, 52, 38, 61, 55, 42, 48, 35, 58, 44, 50, 40];

  months.forEach((m) => {
    labels.push(`${BULAN_SHORT[m.getMonth()]} ${m.getFullYear()}`);
    dates.push(format(m, "yyyy-MM"));
  });

  return {
    labels,
    dates,
    disetujui: months.map((_, i) => Math.floor(seed[i % seed.length] * 0.4)),
    ditolak: months.map((_, i) => Math.floor(seed[i % seed.length] * 0.1)),
    menunggu: months.map((_, i) => Math.floor(seed[i % seed.length] * 0.25)),
  };
}

export default function ActivityChart({ onDateClick, onStatusClick }) {
  const today = new Date();
  const [period, setPeriod] = useState("weekly");
  const [weekStart, setWeekStart] = useState(startOfWeek(today, { weekStartsOn: 1 }));
  const [weekEnd, setWeekEnd] = useState(endOfWeek(today, { weekStartsOn: 1 }));
  const [weekPickerOpen, setWeekPickerOpen] = useState(false);
  const [weekRangeStep, setWeekRangeStep] = useState("from");
  const [tempWeekStart, setTempWeekStart] = useState(weekStart);
  const [monthFrom, setMonthFrom] = useState(startOfMonth(addDays(today, -60)));
  const [monthTo, setMonthTo] = useState(startOfMonth(today));
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [monthPickerStep, setMonthPickerStep] = useState("from");
  const [visibleLines, setVisibleLines] = useState(new Set(["Disetujui", "Ditolak", "Menunggu"]));

  const source = useMemo(() => {
    if (period === "weekly") return generateDataForRange(weekStart, weekEnd);
    return generateMonthlyAggData(monthFrom, monthTo);
  }, [period, weekStart, weekEnd, monthFrom, monthTo]);

  const data = source.labels.map((label, i) => ({
    name: label,
    date: source.dates[i],
    Disetujui: source.disetujui[i],
    Ditolak: source.ditolak[i],
    Menunggu: source.menunggu[i],
  }));

  const handleDotClick = (status) => (payload) => {
    if (payload?.payload?.date) onDateClick(payload.payload.date, status);
  };

  const handleLegendClick = (e) => {
    const key = e?.value || e?.dataKey;
    if (!key) return;
    setVisibleLines((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); }
      else next.add(key);
      return next;
    });
  };

  const handleWeekDateSelect = (date) => {
    if (!date) return;
    if (weekRangeStep === "from") {
      setTempWeekStart(date);
      setWeekRangeStep("to");
    } else {
      const start = tempWeekStart || date;
      const end = date;
      const [s, e] = start <= end ? [start, end] : [end, start];
      const maxEnd = addDays(s, 6);
      setWeekStart(s);
      setWeekEnd(e > maxEnd ? maxEnd : e);
      setWeekRangeStep("from");
      setWeekPickerOpen(false);
    }
  };

  const currentYear = today.getFullYear();
  const monthOptions = useMemo(() => {
    const opts = [];
    for (let y = currentYear - 1; y <= currentYear + 1; y++) {
      for (let m = 0; m < 12; m++) {
        opts.push({ label: `${BULAN_SHORT[m]} ${y}`, date: new Date(y, m, 1) });
      }
    }
    return opts;
  }, [currentYear]);

  const weekLabel = `${format(weekStart, "dd MMM")} - ${format(weekEnd, "dd MMM yyyy")}`;
  const monthLabel = `${format(monthFrom, "MMM yyyy")} - ${format(monthTo, "MMM yyyy")}`;

  const renderLegend = (props) => {
    const { payload } = props;
    if (!payload) return null;
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {payload.map((entry) => {
          const active = visibleLines.has(entry.value);
          return (
            <button key={entry.value} onClick={() => handleLegendClick(entry)}
              className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                active ? "border-border bg-card shadow-sm" : "border-transparent bg-muted/50 opacity-50"
              )}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              {entry.value}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            📈 Aktivitas {period === "weekly" ? "Mingguan" : "Bulanan"}
          </h3>
          <p className="text-xs text-muted-foreground">
            Klik titik grafik untuk melihat dokumen, klik legend untuk toggle
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button onClick={() => setPeriod("weekly")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${period === "weekly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Mingguan</button>
            <button onClick={() => setPeriod("monthly")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${period === "monthly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Bulanan</button>
          </div>

          {period === "weekly" ? (
            <Popover open={weekPickerOpen} onOpenChange={(o) => { setWeekPickerOpen(o); if (o) setWeekRangeStep("from"); }}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 border border-border rounded-md px-2.5 py-1.5 hover:bg-muted transition-colors">
                  <CalendarDays size={14} className="text-primary" />
                  <span className="text-xs font-medium text-foreground">{weekLabel}</span>
                  <ChevronDown size={12} className="text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3 z-50 bg-popover" align="end" sideOffset={4}>
                <p className="text-xs font-semibold text-foreground mb-2">
                  {weekRangeStep === "from" ? "Pilih tanggal mulai" : "Pilih tanggal akhir (maks 7 hari)"}
                </p>
                <Calendar mode="single" selected={weekRangeStep === "from" ? tempWeekStart : undefined} onSelect={handleWeekDateSelect} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          ) : (
            <Popover open={monthPickerOpen} onOpenChange={(o) => { setMonthPickerOpen(o); if (o) setMonthPickerStep("from"); }}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 border border-border rounded-md px-2.5 py-1.5 hover:bg-muted transition-colors">
                  <CalendarDays size={14} className="text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{monthLabel}</span>
                  <ChevronDown size={12} className="text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 z-50 bg-popover max-h-64 overflow-y-auto" align="end" sideOffset={4}>
                <p className="text-xs font-semibold text-foreground mb-2 px-2 pt-1">
                  {monthPickerStep === "from" ? "Bulan mulai" : "Bulan akhir"}
                </p>
                {monthOptions.map((opt) => (
                  <button key={opt.label} onClick={() => {
                    if (monthPickerStep === "from") { setMonthFrom(opt.date); setMonthPickerStep("to"); }
                    else { setMonthTo(opt.date >= monthFrom ? opt.date : monthFrom); setMonthPickerStep("from"); setMonthPickerOpen(false); }
                  }}
                    className={cn("w-full flex items-center justify-between px-3 py-2 text-xs rounded-md transition-colors",
                      (monthPickerStep === "from" && opt.date.getTime() === monthFrom.getTime()) || (monthPickerStep === "to" && opt.date.getTime() === monthTo.getTime())
                        ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted"
                    )}>
                    {opt.label}
                    {((monthPickerStep === "from" && opt.date.getTime() === monthFrom.getTime()) || (monthPickerStep === "to" && opt.date.getTime() === monthTo.getTime())) && <Check size={14} />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} style={{ cursor: "pointer" }}>
          <defs>
            {Object.entries(STATUS_COLORS).map(([key, color]) => (
              <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(340 12% 90%)" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(220 10% 46%)" angle={-25} textAnchor="end" height={60} interval={data.length > 14 ? 2 : 0} />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
          <Tooltip contentStyle={{ backgroundColor: "hsl(0 0% 100%)", border: "1px solid hsl(340 12% 90%)", borderRadius: "8px", fontSize: "13px" }} />
          <Legend content={renderLegend} />
          {["Disetujui", "Ditolak", "Menunggu"].map((key) => (
            <Area key={key} type="monotone" dataKey={key} stroke={STATUS_COLORS[key]} fill={`url(#gradient-${key})`}
              strokeWidth={visibleLines.has(key) ? 2 : 0} fillOpacity={visibleLines.has(key) ? 1 : 0}
              dot={visibleLines.has(key) ? { r: 4, fill: STATUS_COLORS[key] } : false}
              activeDot={visibleLines.has(key) ? { r: 6, onClick: handleDotClick(key), cursor: "pointer" } : false}
              hide={!visibleLines.has(key)}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
