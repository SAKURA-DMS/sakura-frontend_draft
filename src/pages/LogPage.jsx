import { useState, useMemo } from "react";
import {
  Search,
  RotateCcw,
  FileText,
  Clock,
  ChevronDown,
} from "lucide-react";

import { format } from "date-fns";

import AppHeader from "@/components/layout/AppHeader";
import { useApp } from "@/contexts/AppContext";

export default function LogPage() {
  const { documents, currentUser } = useApp();

  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("Semua");

  const allLogs = useMemo(() => {
    const logs = [];

    documents.forEach((doc) => {
      doc.auditTrail.forEach((entry) => {
        logs.push({
          docId: doc.id,
          docTitle: doc.judul,
          time: entry.time,
          userName: entry.user.nama,
          userAvatar: entry.user.avatar,
          userRole: entry.user.role,
          action: entry.action,
        });
      });
    });

    const principalOnlyActions = [
      "mengunggah",
      "menyetujui",
      "menolak",
      "mengarsipkan",
      "menghapus",
      "mengubah",
    ];

    const filteredLogs =
      currentUser?.role === "Kepala Sekolah"
        ? logs.filter((l) =>
            principalOnlyActions.some((a) =>
              l.action.toLowerCase().includes(a)
            )
          )
        : logs;

    return filteredLogs.sort(
      (a, b) =>
        new Date(b.time).getTime() -
        new Date(a.time).getTime()
    );
  }, [documents, currentUser]);

  const filtered = useMemo(() => {
    return allLogs.filter((log) => {
      if (
        filterAction !== "Semua" &&
        !log.action
          .toLowerCase()
          .includes(filterAction.toLowerCase())
      ) {
        return false;
      }

      if (search) {
        const q = search.toLowerCase();

        return (
          log.userName.toLowerCase().includes(q) ||
          log.docTitle.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [allLogs, search, filterAction]);

  // Group berdasarkan user
  const groupedLogs = useMemo(() => {
    const groups = {};

    filtered.forEach((log) => {
      const key = log.userName;

      if (!groups[key]) {
        groups[key] = {
          avatar: log.userAvatar,
          role: log.userRole,
          activities: [],
        };
      }

      groups[key].activities.push(log);
    });

    return groups;
  }, [filtered]);

  return (
    <>
      <AppHeader
        title="Log Sistem"
        subtitle="Catatan aktivitas seluruh dokumen"
      />

      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Clock size={22} className="text-primary" />

          <h2 className="text-xl font-bold text-foreground">
            Jejak Aktivitas Global
          </h2>

          <span className="text-xs text-muted-foreground">
            ({allLogs.length} entri)
          </span>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border border-border">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, dokumen, atau aktivitas..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) =>
              setFilterAction(e.target.value)
            }
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          >
            <option value="Semua">
              Semua Aktivitas
            </option>

            <option value="Mengunggah">
              Unggah
            </option>

            <option value="Melihat">
              Lihat
            </option>

            <option value="Menyetujui">
              Setujui
            </option>

            <option value="Menolak">
              Tolak
            </option>

            <option value="Mengarsipkan">
              Arsipkan
            </option>

            <option value="Catatan">
              Catatan Admin
            </option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setFilterAction("Semua");
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-input text-sm hover:bg-muted"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        {/* Log Container */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {Object.keys(groupedLogs).length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Tidak ada log ditemukan.
              </p>
            )}

            {Object.entries(groupedLogs).map(
              ([userName, data], i) => (
                <details
                  key={i}
                  className="group bg-background [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 select-none list-none">
                    <img
                      src={data.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-foreground">
                        {userName}

                        <span className="font-normal text-xs text-muted-foreground ml-1">
                          — {data.role}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground mt-0.5">
                        {data.activities.length} aktivitas
                        terekam
                      </div>
                    </div>

                    <ChevronDown
                      size={18}
                      className="text-muted-foreground"
                    />
                  </summary>

                  <div className="px-4 pb-4 pt-1 bg-muted/10 border-t border-border/50">
                    <div className="ml-[42px] border-l-2 border-primary/20 space-y-4 pl-4 py-2">
                      {data.activities.map((log, j) => (
                        <div
                          key={j}
                          className="relative"
                        >
                          <div className="absolute w-2 h-2 bg-primary rounded-full -left-[21px] top-1.5" />

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-0.5">
                            <span
                              className={`text-sm font-semibold ${
                                log.action.startsWith(
                                  "Catatan Admin"
                                )
                                  ? "text-accent italic"
                                  : "text-foreground"
                              }`}
                            >
                              {log.action}
                            </span>

                            <span className="text-[11px] font-medium text-muted-foreground bg-background border px-2 py-0.5 rounded-full self-start">
                              {format(
                                new Date(log.time),
                                "dd/MM/yyyy HH:mm"
                              )}
                            </span>
                          </div>

                          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <FileText
                              size={12}
                              className="text-primary/70"
                            />

                            {log.docTitle}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}