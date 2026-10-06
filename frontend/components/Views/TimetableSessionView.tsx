'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Plus,
  CheckCircle2,
  Settings,
  Edit3,
  Trash2,
  X,
  Check,
  RefreshCw,
} from 'lucide-react';
import {
  getCentralSchedule,
  saveCentralSchedule,
  resetCentralSchedule,
  subscribeToScheduleUpdates,
  ScheduleSlot,
  SCHEDULE_DAYS,
} from '@/lib/scheduleService';

export default function TimetableSessionView() {
  const [selectedDay, setSelectedDay] = useState('Senin');
  const [viewMode, setViewMode] = useState<'schedule' | 'journal'>('schedule');
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'time-slots' | 'assign-lessons'>('time-slots');
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Time Slot Form
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotPeriodInput, setSlotPeriodInput] = useState('');
  const [slotStartTimeInput, setSlotStartTimeInput] = useState('07:30');
  const [slotEndTimeInput, setSlotEndTimeInput] = useState('09:00');
  const [slotIsBreakInput, setSlotIsBreakInput] = useState(false);
  const [slotBreakLabelInput, setSlotBreakLabelInput] = useState('');

  // Lesson Form
  const [selectedSlotForLesson, setSelectedSlotForLesson] = useState<string>('');
  const [subjectInput, setSubjectInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [teacherInput, setTeacherInput] = useState('');
  const [roomInput, setRoomInput] = useState('Ruang 204 Gedung B');
  const [categoryInput, setCategoryInput] = useState<'MIPA' | 'Bahasa' | 'Informatika' | 'Agama' | 'Sosial' | 'Olahraga' | 'Seni' | 'Umum'>('MIPA');
  const [topicInput, setTopicInput] = useState('');

  const days = SCHEDULE_DAYS;

  // Real-time synchronization subscription
  useEffect(() => {
    setScheduleSlots(getCentralSchedule());
    const unsub = subscribeToScheduleUpdates((updated) => {
      setScheduleSlots(updated);
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setSyncToast(msg);
    setTimeout(() => setSyncToast(null), 3000);
  };

  // Populate lesson form on slot change
  useEffect(() => {
    if (!selectedSlotForLesson && scheduleSlots.length > 0) {
      const firstNonBreak = scheduleSlots.find((s) => !s.isBreak) || scheduleSlots[0];
      setSelectedSlotForLesson(firstNonBreak.id);
    }
  }, [scheduleSlots, selectedSlotForLesson]);

  useEffect(() => {
    if (!selectedSlotForLesson) return;
    const slot = scheduleSlots.find((s) => s.id === selectedSlotForLesson);
    if (!slot) return;
    const lesson = slot.days[selectedDay];
    if (lesson) {
      setSubjectInput(lesson.subject || '');
      setCodeInput(lesson.code || '');
      setTeacherInput(lesson.teacher || '');
      setRoomInput(lesson.room || 'Ruang 204 Gedung B');
      setCategoryInput(lesson.category || 'MIPA');
      setTopicInput(lesson.topics || '');
    } else {
      setSubjectInput('');
      setCodeInput('');
      setTeacherInput('');
      setRoomInput('Ruang 204 Gedung B');
      setCategoryInput('MIPA');
      setTopicInput('');
    }
  }, [selectedSlotForLesson, selectedDay, scheduleSlots]);

  // Handler: Save / Edit Slot Jam
  const handleSaveSlot = () => {
    if (!slotPeriodInput || !slotStartTimeInput || !slotEndTimeInput) return;
    const timeFormatted = `${slotStartTimeInput} - ${slotEndTimeInput}`;

    let updated: ScheduleSlot[];
    if (editingSlotId) {
      updated = scheduleSlots.map((s) => {
        if (s.id === editingSlotId) {
          return {
            ...s,
            period: slotPeriodInput,
            time: timeFormatted,
            startTime: slotStartTimeInput,
            endTime: slotEndTimeInput,
            isBreak: slotIsBreakInput,
            breakLabel: slotIsBreakInput ? slotBreakLabelInput || `Istirahat (${timeFormatted} WIB)` : undefined,
          };
        }
        return s;
      });
      showToast('Waktu sesi berhasil diperbarui di sistem pusat');
    } else {
      const newSlot: ScheduleSlot = {
        id: `slot-${Date.now()}`,
        rowNum: scheduleSlots.length + 1,
        period: slotPeriodInput,
        time: timeFormatted,
        startTime: slotStartTimeInput,
        endTime: slotEndTimeInput,
        isBreak: slotIsBreakInput,
        breakLabel: slotIsBreakInput ? slotBreakLabelInput || `Istirahat (${timeFormatted} WIB)` : undefined,
        days: {},
      };
      updated = [...scheduleSlots, newSlot];
      showToast('Slot waktu baru berhasil ditambahkan');
    }

    saveCentralSchedule(updated);
    setEditingSlotId(null);
    setSlotPeriodInput('');
    setSlotStartTimeInput('07:30');
    setSlotEndTimeInput('09:00');
    setSlotIsBreakInput(false);
    setSlotBreakLabelInput('');
  };

  const handleDeleteSlot = (id: string) => {
    if (!window.confirm('Hapus slot jam ini dari jadwal pusat sekolah?')) return;
    const updated = scheduleSlots.filter((s) => s.id !== id);
    saveCentralSchedule(updated);
    showToast('Slot waktu telah dihapus');
  };

  const handleSaveLesson = () => {
    if (!selectedSlotForLesson || !selectedDay) return;

    const updated = scheduleSlots.map((slot) => {
      if (slot.id === selectedSlotForLesson) {
        return {
          ...slot,
          days: {
            ...slot.days,
            [selectedDay]: subjectInput.trim()
              ? {
                  subject: subjectInput.trim(),
                  code: codeInput.trim() || subjectInput.substring(0, 3).toUpperCase(),
                  teacher: teacherInput.trim() || 'Guru Pengampu',
                  room: roomInput.trim() || 'Ruang 204 Gedung B',
                  category: categoryInput,
                  topics: topicInput.trim() || undefined,
                }
              : null,
          },
        };
      }
      return slot;
    });

    saveCentralSchedule(updated);
    showToast(`Jadwal ${selectedDay} berhasil disimpan ke pusat.`);
  };

  const handleClearLesson = () => {
    if (!selectedSlotForLesson || !selectedDay) return;
    const updated = scheduleSlots.map((slot) => {
      if (slot.id === selectedSlotForLesson) {
        return {
          ...slot,
          days: {
            ...slot.days,
            [selectedDay]: null,
          },
        };
      }
      return slot;
    });
    saveCentralSchedule(updated);
    setSubjectInput('');
    setCodeInput('');
    setTeacherInput('');
    setTopicInput('');
    showToast(`Sesi ${selectedDay} dikosongkan.`);
  };

  const handleReset = () => {
    if (window.confirm('Reset jadwal ke template standar sekolah?')) {
      const def = resetCentralSchedule();
      setScheduleSlots(def);
      showToast('Jadwal di-reset ke template standar');
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manajemen Terpusat: Timetable Engine & Sinkronisasi Jadwal KBM</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Jadwal Pelajaran & Sesi Tatap Muka</h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengaturan waktu fleksibel, pemetaan guru dan ruangan, otomatis terintegrasi dengan portal siswa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditorOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-blue-400" />
            <span>Atur Jadwal Pusat & Waktu</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('schedule')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'schedule' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Matriks Jadwal
            </button>
            <button
              onClick={() => setViewMode('journal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'journal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jurnal Mengajar Guru
            </button>
          </div>
        </div>
      </div>

      {/* Sync Toast Alert */}
      {syncToast && (
        <div className="flex items-center justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncToast}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            Live Sync
          </span>
        </div>
      )}

      {viewMode === 'schedule' ? (
        <div className="flex flex-col gap-5">
          {/* Day Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedDay === day
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Schedule Slots Table for Selected Day */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Susunan Jadwal Hari {selectedDay} • Kelas X-MIPA 1
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Data sinkron langsung dengan tampilan murid (Tahun Ajaran 2026/2027)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('assign-lessons');
                    setIsEditorOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Mapel Hari Ini
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {scheduleSlots.map((slot) => {
                const lesson = slot.days[selectedDay];

                if (slot.isBreak) {
                  return (
                    <div
                      key={slot.id}
                      className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 text-slate-600 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-28 text-left">
                          <div className="text-xs font-mono font-bold text-slate-800">{slot.time}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">{slot.period}</div>
                        </div>
                        <div className="h-7 w-px bg-slate-200 hidden md:block" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-700">
                            {slot.breakLabel || 'Istirahat'}
                          </h4>
                          <span className="text-[11px] text-slate-400">Jeda Istirahat Pembelajaran</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-400 px-3 py-1 rounded-full bg-slate-100">
                        Istirahat
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={slot.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-28 text-left">
                        <div className="text-xs font-mono font-bold text-slate-900">{slot.time}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">{slot.period}</div>
                      </div>

                      <div className="h-8 w-px bg-slate-200 hidden md:block" />

                      <div>
                        {lesson ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {lesson.code}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900">{lesson.subject}</h4>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Guru: <span className="font-semibold text-slate-700">{lesson.teacher}</span> • Ruang: <span className="font-semibold text-slate-700">{lesson.room}</span>
                            </p>
                            {lesson.topics && (
                              <p className="text-[11px] text-slate-400 mt-0.5 italic">
                                Pokok: {lesson.topics}
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="text-xs text-slate-400 italic">
                            — Belum ada mata pelajaran yang dijadwalkan —
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {lesson ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Terjadwal & Aktif</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedSlotForLesson(slot.id);
                            setActiveTab('assign-lessons');
                            setIsEditorOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          + Isi Pelajaran
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* JURNAL MENGAJAR GURU */
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Jurnal Mengajar Harian Guru</h3>
              <p className="text-xs text-slate-500">Pencatatan sesi KBM resmi, ketercapaian materi, dan bukti pertemuan.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span>Tulis Jurnal Baru</span>
            </button>
          </div>

          <div className="space-y-4">
            {[
              {
                date: '01 Oktober 2026',
                session: 'Pertemuan ke-8 • Jam 1 - 2',
                subject: 'Fisika Terpadu (10-MIPA 1)',
                topic: 'Penerapan Hukum II Termodinamika pada Mesin Carnot',
                attendance: '31 Hadir / 1 Sakit',
                notes: 'Siswa antusias mengerjakan simulasi siklus Carnot di laboratorium. Tugas kelompok diserahkan tepat waktu.',
                status: 'Selesai Dilaksanakan',
              },
              {
                date: '29 September 2026',
                session: 'Pertemuan ke-7 • Jam 5 - 6',
                subject: 'Matematika Peminatan (10-MIPA 1)',
                topic: 'Penyelesaian Sistem Persamaan Matriks Ordo 3x3',
                attendance: '32 Hadir (100%)',
                notes: 'Seluruh materi dasar selesai dijelaskan. Latihan soal nomor 1-10 dibahas bersama.',
                status: 'Selesai Dilaksanakan',
              },
            ].map((j, i) => (
              <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">{j.subject}</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-3 py-0.5 rounded-full">
                    {j.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-indigo-700">{j.session} • {j.date}</div>
                <div className="text-xs text-slate-800">
                  <strong>Materi Pembelajaran:</strong> {j.topic}
                </div>
                <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100 italic">
                  "{j.notes}"
                </div>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 flex justify-between">
                  <span>Kehadiran Sesi: {j.attendance}</span>
                  <span className="font-bold text-slate-800">Tervalidasi Otomatis</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL PENGATURAN JADWAL PUSAT & WAKTU FLEKSIBEL (ADMIN/GURU) */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Konfigurasi Jadwal Pusat Sekolah (Admin & Guru)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ubah alokasi jam secara bebas dan petakan mata pelajaran per hari
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 pt-3 pb-0 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('time-slots')}
                  className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-xs font-bold cursor-pointer ${
                    activeTab === 'time-slots' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Atur Jam & Sesi Fleksibel
                </button>
                <button
                  onClick={() => setActiveTab('assign-lessons')}
                  className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-xs font-bold cursor-pointer ${
                    activeTab === 'assign-lessons' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Petakan Pelajaran per Hari
                </button>
              </div>

              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-600 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-slate-500" />
                Reset Standar
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {activeTab === 'time-slots' && (
                <div className="space-y-6">
                  {/* Form Tambah/Ubah Slot */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-800">
                        {editingSlotId ? 'Ubah Waktu Slot Terpilih' : 'Tambah Slot Waktu Baru'}
                      </h4>
                      {editingSlotId && (
                        <button
                          onClick={() => {
                            setEditingSlotId(null);
                            setSlotPeriodInput('');
                            setSlotStartTimeInput('07:30');
                            setSlotEndTimeInput('09:00');
                            setSlotIsBreakInput(false);
                            setSlotBreakLabelInput('');
                          }}
                          className="text-[11px] text-slate-500 underline cursor-pointer"
                        >
                          Batal Edit
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Label Sesi
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Jam 1 - 2, Apel Pagi"
                          value={slotPeriodInput}
                          onChange={(e) => setSlotPeriodInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Jam Mulai
                        </label>
                        <input
                          type="time"
                          value={slotStartTimeInput}
                          onChange={(e) => setSlotStartTimeInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Jam Selesai
                        </label>
                        <input
                          type="time"
                          value={slotEndTimeInput}
                          onChange={(e) => setSlotEndTimeInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                        <input
                          type="checkbox"
                          checked={slotIsBreakInput}
                          onChange={(e) => setSlotIsBreakInput(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="font-semibold text-xs">
                          Tandai sebagai Jam Istirahat
                        </span>
                      </label>

                      {slotIsBreakInput && (
                        <input
                          type="text"
                          placeholder="Label istirahat..."
                          value={slotBreakLabelInput}
                          onChange={(e) => setSlotBreakLabelInput(e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white sm:w-64"
                        />
                      )}

                      <button
                        onClick={handleSaveSlot}
                        disabled={!slotPeriodInput.trim() || !slotStartTimeInput || !slotEndTimeInput}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs cursor-pointer ml-auto"
                      >
                        {editingSlotId ? 'Perbarui Slot Jam' : 'Tambah ke Jadwal'}
                      </button>
                    </div>
                  </div>

                  {/* List Slot Jam */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                    {scheduleSlots.map((s, idx) => (
                      <div key={s.id || idx} className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-[11px]">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">{s.period}</span>
                              {s.isBreak && (
                                <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-amber-100 text-amber-800">
                                  Istirahat
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-500">{s.time} WIB</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingSlotId(s.id);
                              setSlotPeriodInput(s.period);
                              setSlotStartTimeInput(s.startTime || s.time.split(' - ')[0] || '07:30');
                              setSlotEndTimeInput(s.endTime || s.time.split(' - ')[1] || '09:00');
                              setSlotIsBreakInput(!!s.isBreak);
                              setSlotBreakLabelInput(s.breakLabel || '');
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(s.id)}
                            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'assign-lessons' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Pilih Sesi Jam:</label>
                      <select
                        value={selectedSlotForLesson}
                        onChange={(e) => setSelectedSlotForLesson(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                      >
                        {scheduleSlots.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.period} ({s.time}) {s.isBreak ? '• [Istirahat]' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Pilih Hari:</label>
                      <div className="flex items-center gap-1 overflow-x-auto">
                        {days.map((d) => (
                          <button
                            key={d}
                            onClick={() => setSelectedDay(d)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shrink-0 ${
                              selectedDay === d
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mata Pelajaran</label>
                        <input
                          type="text"
                          placeholder="Nama Mapel..."
                          value={subjectInput}
                          onChange={(e) => setSubjectInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kode Mapel</label>
                        <input
                          type="text"
                          placeholder="MTK-10"
                          value={codeInput}
                          onChange={(e) => setCodeInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Guru Pengampu</label>
                        <input
                          type="text"
                          placeholder="Nama Guru..."
                          value={teacherInput}
                          onChange={(e) => setTeacherInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ruangan</label>
                        <input
                          type="text"
                          placeholder="Ruang 204 Gedung B"
                          value={roomInput}
                          onChange={(e) => setRoomInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kelompok Mapel</label>
                        <select
                          value={categoryInput}
                          onChange={(e) => setCategoryInput(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                        >
                          <option value="MIPA">MIPA</option>
                          <option value="Bahasa">Bahasa</option>
                          <option value="Informatika">Informatika</option>
                          <option value="Agama">Agama</option>
                          <option value="Sosial">Sosial</option>
                          <option value="Olahraga">Olahraga</option>
                          <option value="Seni">Seni</option>
                          <option value="Umum">Umum</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pokok Bahasan / Silabus</label>
                        <input
                          type="text"
                          placeholder="Materi pokok sesi ini..."
                          value={topicInput}
                          onChange={(e) => setTopicInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={handleClearLesson}
                        className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 font-semibold text-xs hover:bg-rose-50 cursor-pointer"
                      >
                        Kosongkan Sesi Ini
                      </button>
                      <button
                        onClick={handleSaveLesson}
                        disabled={!subjectInput.trim()}
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Simpan ke Pusat
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Penyimpanan otomatis tersinkron ke semua murid & guru.
              </span>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs cursor-pointer"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
