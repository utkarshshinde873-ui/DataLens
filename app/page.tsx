"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart3, BookOpen, CheckCircle2, ChevronDown, Database, Download,
  GraduationCap, LayoutDashboard, Lightbulb, Menu, PieChart, Search,
  Settings2, Table2, Upload, X, TrendingUp, CircleHelp,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip,
  ScatterChart, Scatter, ZAxis, PieChart as RePieChart, Pie, Cell, Legend,
} from "recharts";

type Value = string | number;
type Row = Record<string, Value>;
type Limit = 5 | 10 | 15 | "all";

const COLORS = ["#7657FF", "#13C9A5", "#FFB547", "#3B9BFF", "#F15BB5", "#FF6B6B", "#00C2D1", "#A78BFA"];
const initialRows: Row[] = [
  { Student: "S01", StudyHours: 2, Attendance: 68, ScreenTime: 6.5, CGPA: 6.2, AssignmentCompletion: 65, SleepHours: 6.1 },
  { Student: "S02", StudyHours: 3, Attendance: 74, ScreenTime: 5.8, CGPA: 7, AssignmentCompletion: 72, SleepHours: 6.8 },
  { Student: "S03", StudyHours: 4, Attendance: 88, ScreenTime: 4.2, CGPA: 8.4, AssignmentCompletion: 90, SleepHours: 7.2 },
  { Student: "S04", StudyHours: 1.5, Attendance: 61, ScreenTime: 7.4, CGPA: 5.8, AssignmentCompletion: 58, SleepHours: 5.4 },
  { Student: "S05", StudyHours: 3.5, Attendance: 82, ScreenTime: 4.9, CGPA: 7.8, AssignmentCompletion: 80, SleepHours: 7 },
  { Student: "S06", StudyHours: 5, Attendance: 91, ScreenTime: 3.6, CGPA: 9.1, AssignmentCompletion: 95, SleepHours: 7.8 },
  { Student: "S07", StudyHours: 2.2, Attendance: 68, ScreenTime: 6.8, CGPA: 6.1, AssignmentCompletion: 67, SleepHours: 6 },
  { Student: "S08", StudyHours: 4.2, Attendance: 86, ScreenTime: 4.1, CGPA: 8.7, AssignmentCompletion: 88, SleepHours: 7.4 },
  { Student: "S09", StudyHours: 3, Attendance: 74, ScreenTime: 5.2, CGPA: 7, AssignmentCompletion: 76, SleepHours: 6.6 },
  { Student: "S10", StudyHours: 5.5, Attendance: 93, ScreenTime: 3.1, CGPA: 9.4, AssignmentCompletion: 97, SleepHours: 8 },
  { Student: "S11", StudyHours: 3.8, Attendance: 82, ScreenTime: 4.5, CGPA: 8.1, AssignmentCompletion: 84, SleepHours: 7.1 },
  { Student: "S12", StudyHours: 1.8, Attendance: 55, ScreenTime: 7.8, CGPA: 5.3, AssignmentCompletion: 52, SleepHours: 5 },
  { Student: "S13", StudyHours: 4.5, Attendance: 89, ScreenTime: 4, CGPA: 8.9, AssignmentCompletion: 92, SleepHours: 7.6 },
  { Student: "S14", StudyHours: 2.8, Attendance: 72, ScreenTime: 5.9, CGPA: 6.7, AssignmentCompletion: 70, SleepHours: 6.3 },
  { Student: "S15", StudyHours: 3.3, Attendance: 80, ScreenTime: 5, CGPA: 7.6, AssignmentCompletion: 79, SleepHours: 6.9 },
];

const fmt = (n: number) => Number.isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—";
const numsOf = (rows: Row[]) => Object.keys(rows[0] ?? {}).filter(k => rows.some(r => r[k] !== "" && r[k] != null && Number.isFinite(Number(r[k])) && typeof r[k] === "number"));
const catsOf = (rows: Row[], nums: string[]) => Object.keys(rows[0] ?? {}).filter(k => !nums.includes(k));
const avg = (rows: Row[], key: string) => {
  const values = rows.map(r => r[key]).filter(v => v !== "" && v != null).map(Number).filter(Number.isFinite);
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
};
const take = (rows: Row[], limit: Limit) => limit === "all" ? rows : rows.slice(0, limit);

function parseCsv(text: string): Row[] {
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("The CSV needs a header and at least one data row.");
  const split = (line: string) => {
    const out: string[] = []; let value = "", quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && line[i + 1] === '"' && quoted) { value += '"'; i++; }
      else if (ch === '"') quoted = !quoted;
      else if (ch === "," && !quoted) { out.push(value.trim()); value = ""; }
      else value += ch;
    }
    out.push(value.trim()); return out;
  };
  const headers = split(lines[0]).map((h, i) => h || `Column ${i + 1}`);
  const rows = lines.slice(1).filter(l => l.trim()).map(line => {
    const values = split(line); const row: Row = {};
    headers.forEach((h, i) => {
      const v = (values[i] ?? "").trim();
      row[h] = v !== "" && Number.isFinite(Number(v)) ? Number(v) : v;
    });
    return row;
  });
  if (!rows.length) throw new Error("No data rows were found in this CSV.");
  return rows;
}
function exportCsv(rows: Row[]) {
  const headers = Object.keys(rows[0] ?? {});
  const esc = (v: Value | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.map(esc).join(","), ...rows.map(r => headers.map(h => esc(r[h])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a"); a.href = url; a.download = "datalens-data.csv"; a.click(); URL.revokeObjectURL(url);
}

export default function Home() {
  const [page, setPage] = useState("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [datasetName, setDatasetName] = useState("Student Performance");
  const [uploadMessage, setUploadMessage] = useState("");
  const [search, setSearch] = useState("");
  const [barX, setBarX] = useState("Student"), [barY, setBarY] = useState("CGPA");
  const [histKey, setHistKey] = useState("StudyHours");
  const [scatterX, setScatterX] = useState("StudyHours"), [scatterY, setScatterY] = useState("CGPA");
  const [pieKey, setPieKey] = useState("CGPA");
  const [barLimit, setBarLimit] = useState<Limit>(5), [histLimit, setHistLimit] = useState<Limit>(10);
  const [scatterLimit, setScatterLimit] = useState<Limit>("all"), [pieLimit, setPieLimit] = useState<Limit>("all");
  const [tableLimit, setTableLimit] = useState<Limit>(10);

  const nums = useMemo(() => numsOf(rows), [rows]);
  const cats = useMemo(() => catsOf(rows, nums), [rows, nums]);
  const fields = Object.keys(rows[0] ?? {});
  const xKey = fields.includes(barX) ? barX : fields[0] ?? "";
  const yKey = nums.includes(barY) ? barY : nums[0] ?? "";
  const hKey = nums.includes(histKey) ? histKey : nums[0] ?? "";
  const sxKey = nums.includes(scatterX) ? scatterX : nums[0] ?? "";
  const syKey = nums.includes(scatterY) ? scatterY : nums[1] ?? nums[0] ?? "";
  const pKey = nums.includes(pieKey) ? pieKey : nums.includes("CGPA") ? "CGPA" : nums[0] ?? "";

  const barData = useMemo(() => take(rows, barLimit).filter(r => r[yKey] !== "" && Number.isFinite(Number(r[yKey])))
    .sort((a, b) => Number(b[yKey]) - Number(a[yKey])).map(r => ({ name: String(r[xKey] ?? "Unknown"), value: Number(r[yKey]) })),
    [rows, barLimit, xKey, yKey]);
  const histogramData = useMemo(() => {
    const values = take(rows, histLimit).map(r => Number(r[hKey])).filter(Number.isFinite);
    if (!values.length) return [];
    const min = Math.min(...values), max = Math.max(...values), bins = Math.min(8, Math.max(3, Math.ceil(Math.sqrt(values.length))));
    const width = (max - min || 1) / bins;
    return Array.from({ length: bins }, (_, i) => {
      const start = min + i * width, end = i === bins - 1 ? max + 0.000001 : start + width;
      return { range: `${fmt(start)}–${fmt(i === bins - 1 ? max : start + width)}`, count: values.filter(v => v >= start && v < end).length };
    });
  }, [rows, histLimit, hKey]);
  const scatterData = useMemo(() => take(rows, scatterLimit).map(r => ({
    x: Number(r[sxKey]), y: Number(r[syKey]), name: String(r[cats[0] ?? fields[0] ?? "Record"] ?? "Record"),
  })).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y)), [rows, scatterLimit, sxKey, syKey, cats, fields]);
  const pieData = useMemo(() => {
    const values = take(rows, pieLimit).map(r => Number(r[pKey])).filter(Number.isFinite);
    if (!values.length) return [];
    const min = Math.min(...values), max = Math.max(...values);
    const bands = pKey.toLowerCase().includes("cgpa")
      ? [{ name: "Needs improvement (<6)", test: (v: number) => v < 6 }, { name: "Developing (6–7.49)", test: (v: number) => v >= 6 && v < 7.5 }, { name: "Good (7.5–8.49)", test: (v: number) => v >= 7.5 && v < 8.5 }, { name: "Excellent (8.5+)", test: (v: number) => v >= 8.5 }]
      : Array.from({ length: 4 }, (_, i) => { const width = (max - min || 1) / 4, start = min + i * width; return { name: `${fmt(start)}–${fmt(i === 3 ? max : start + width)}`, test: (v: number) => v >= start && v < (i === 3 ? max + 0.000001 : start + width) }; });
    return bands.map(b => ({ name: b.name, value: values.filter(b.test).length })).filter(b => b.value > 0);
  }, [rows, pieLimit, pKey]);

  const filteredRows = rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(search.toLowerCase())));
  const avgAttendance = avg(rows, fields.includes("Attendance") ? "Attendance" : nums[0] ?? "");
  const avgScreen = avg(rows, fields.includes("ScreenTime") ? "ScreenTime" : nums[0] ?? "");
  const avgCgpa = avg(rows, fields.includes("CGPA") ? "CGPA" : nums[0] ?? "");
  const avgSleep = avg(rows, fields.includes("SleepHours") ? "SleepHours" : nums[0] ?? "");
  const labelRow = (r: Row | null) => r ? String(r.Student ?? r.StudentID ?? r.Name ?? r.ID ?? "Record") : "Record";
  const extreme = (key: string, high: boolean): Row | null => {
    const valid = rows.filter(r => r[key] !== "" && r[key] != null && Number.isFinite(Number(r[key])));
    return valid.length ? valid.reduce((best, r) => high ? Number(r[key]) > Number(best[key]) ? r : best : Number(r[key]) < Number(best[key]) ? r : best) : null;
  };

  const dataStory = useMemo(() => {
    const fieldAvg = (key: string) => {
      if (!fields.includes(key)) return null;
      const vals = rows.map(r => r[key]).filter(v => v !== "" && v != null).map(Number).filter(Number.isFinite);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    };
    const study = fieldAvg("StudyHours"), attendance = fieldAvg("Attendance"), screen = fieldAvg("ScreenTime");
    const cgpa = fieldAvg("CGPA"), sleep = fieldAvg("SleepHours"), assignments = fieldAvg("AssignmentCompletion");
    const highCgpa = extreme("CGPA", true), lowCgpa = extreme("CGPA", false);
    const highStudy = extreme("StudyHours", true), highScreen = extreme("ScreenTime", true);
    return [
      { title: "Introduction", text: `The ${datasetName} dataset contains ${rows.length} records and ${fields.length} columns. It includes ${fields.join(", ") || "the available fields"}. This story summarizes the current data in simple language and highlights useful patterns shown by the dashboard.` },
      { title: "Academic performance", text: cgpa !== null ? `The average CGPA is ${fmt(cgpa)}. ${highCgpa ? `${labelRow(highCgpa)} has the highest recorded CGPA at ${fmt(Number(highCgpa.CGPA))}.` : ""} ${lowCgpa ? `${labelRow(lowCgpa)} has the lowest recorded CGPA at ${fmt(Number(lowCgpa.CGPA))}.` : ""} These figures summarize the academic results available in this dataset.` : "There is no CGPA column in this dataset, so academic performance cannot be described using CGPA. Other numeric columns can still be explored using the charts." },
      { title: "Study habits and attendance", text: `${study !== null ? `Average study time is ${fmt(study)} hours.` : "Study-hour information is not available."} ${attendance !== null ? `Average attendance is ${fmt(attendance)}%.` : "Attendance information is not available."} ${highStudy ? `${labelRow(highStudy)} has the highest recorded study time at ${fmt(Number(highStudy.StudyHours))} hours.` : ""} These figures describe the records; they do not prove that study time or attendance directly causes a particular result.` },
      { title: "Screen time and sleep", text: `${screen !== null ? `Average screen time is ${fmt(screen)} hours.` : "Screen-time information is not available."} ${highScreen ? `${labelRow(highScreen)} has the highest recorded screen time at ${fmt(Number(highScreen.ScreenTime))} hours.` : ""} ${sleep !== null ? `Average sleep duration is ${fmt(sleep)} hours.` : "Sleep information is not available."} These values describe the recorded habits, and additional analysis would be needed to understand how these variables relate to one another.` },
      { title: "Assignments and overall findings", text: `${assignments !== null ? `Average assignment completion is ${fmt(assignments)}%.` : "Assignment-completion information is not available."} The charts can help compare measurements, examine distributions, and identify high or low values. All findings are based on the currently loaded records and should not be treated as proof of cause and effect.` },
    ];
  }, [rows, fields, datasetName]);

  function handleFile(file?: File) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) { setUploadMessage("Please choose a CSV file. This version supports CSV uploads."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseCsv(String(reader.result ?? ""));
        const newNums = numsOf(parsed), newCats = catsOf(parsed, newNums), newFields = Object.keys(parsed[0] ?? {});
        setRows(parsed); setDatasetName(file.name.replace(/\.csv$/i, ""));
        setUploadMessage(`Loaded ${parsed.length} records from ${file.name}.`);
        setBarX(newCats[0] ?? newFields[0] ?? ""); setBarY(newNums.includes("CGPA") ? "CGPA" : newNums[0] ?? "");
        setHistKey(newNums.includes("StudyHours") ? "StudyHours" : newNums[0] ?? "");
        setScatterX(newNums.includes("StudyHours") ? "StudyHours" : newNums[0] ?? "");
        setScatterY(newNums.includes("CGPA") ? "CGPA" : newNums[1] ?? newNums[0] ?? "");
        setPieKey(newNums.includes("CGPA") ? "CGPA" : newNums[0] ?? "");
        setBarLimit(5); setHistLimit(10); setScatterLimit("all"); setPieLimit("all"); setTableLimit(10); setPage("Overview");
      } catch (e) { setUploadMessage(e instanceof Error ? e.message : "Could not read this CSV file."); }
    };
    reader.readAsText(file);
  }

  const nav = [["Overview", LayoutDashboard], ["Visualizations", BarChart3], ["Insights", Lightbulb], ["Data Story", BookOpen], ["Data Explorer", Database]] as const;
  const maxCgpa = fields.includes("CGPA") ? extreme("CGPA", true) : null;
  const minCgpa = fields.includes("CGPA") ? extreme("CGPA", false) : null;
  const minSleep = fields.includes("SleepHours") ? extreme("SleepHours", false) : null;
  const maxSleep = fields.includes("SleepHours") ? extreme("SleepHours", true) : null;
  const minScreen = fields.includes("ScreenTime") ? extreme("ScreenTime", false) : null;
  const maxScreen = fields.includes("ScreenTime") ? extreme("ScreenTime", true) : null;
  const maxAttendance = fields.includes("Attendance") ? extreme("Attendance", true) : null;
  const minAttendance = fields.includes("Attendance") ? extreme("Attendance", false) : null;
  const maxStudy = fields.includes("StudyHours") ? extreme("StudyHours", true) : null;
  const minStudy = fields.includes("StudyHours") ? extreme("StudyHours", false) : null;

  return <div className="dl-app">
    {mobileOpen && <button className="dl-mobile-overlay" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside className={`dl-sidebar ${mobileOpen ? "dl-sidebar-open" : ""}`}>
      <div className="dl-brand"><div><h1>DataLens</h1><p>DATA INTELLIGENCE</p></div><button className="dl-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></button></div>
      <div className="dl-workspace"><div><strong>My Workspace</strong><span>Personal workspace</span></div><ChevronDown size={17} /></div>
      <p className="dl-nav-label">WORKSPACE</p>
      <nav className="dl-navigation">{nav.map(([name, Icon]) => <button key={name} className={`dl-nav-item ${page === name ? "active" : ""}`} onClick={() => { setPage(name); setMobileOpen(false); }}><Icon size={19} />{name}</button>)}</nav>
      <p className="dl-nav-label dl-preferences-label">PREFERENCES</p>
      <button className={`dl-nav-item ${page === "Settings" ? "active" : ""}`} onClick={() => { setPage("Settings"); setMobileOpen(false); }}><Settings2 size={19} />Settings</button>
      <button className="dl-nav-item" onClick={() => setUploadMessage("Upload a CSV file to explore your own dataset.")}><CircleHelp size={19} />Help &amp; Support</button>
    </aside>

    <main className="dl-main">
      <header className="dl-topbar"><div className="dl-breadcrumb"><button className="dl-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></button><span>Workspace</span><span>/</span><strong>{page}</strong></div><div className="dl-topbar-right"><div className="dl-local-badge"><span />Local-first</div><div className="dl-avatar">U</div></div></header>
      <div className="dl-content">
        <section className="dl-page-heading"><div><p className="dl-eyebrow">YOUR ANALYTICS WORKSPACE</p><h2>{page}</h2><p className="dl-page-description">Turn raw data into clear visual stories.</p></div><label className="dl-upload-button"><Upload size={16} /> Upload CSV<input hidden type="file" accept=".csv,text/csv" onChange={e => handleFile(e.target.files?.[0])} /></label></section>
        {uploadMessage && <div className="dl-error"><span>{uploadMessage}</span><button onClick={() => setUploadMessage("")} aria-label="Dismiss message"><X size={16} /></button></div>}
        <section className="dl-dataset-section"><div className="dl-section-heading"><div><h3>Active dataset</h3><p>All charts and insights are based on the currently loaded dataset.</p></div><span className="dl-subtitle">{rows.length.toLocaleString()} records</span></div><div className="dl-dataset-grid dl-single-dataset"><div className="dl-dataset-card selected"><div className="dl-dataset-icon"><GraduationCap size={22} /></div><div className="dl-dataset-copy"><strong>{datasetName}</strong><span>{fields.join(" · ") || "No columns detected"}</span></div><CheckCircle2 size={18} /></div></div></section>

        {(page === "Overview" || page === "Visualizations") && <>
          <div className="dl-kpi-grid"><Kpi icon={<Database size={20} />} label="Rows in dataset" value={fmt(rows.length)} foot="Records loaded" /><Kpi icon={<Table2 size={20} />} label="Dataset fields" value={fmt(fields.length)} foot="Columns detected" /><Kpi icon={<TrendingUp size={20} />} label="Average CGPA" value={fmt(avgCgpa)} foot="Calculated from uploaded data" /><Kpi icon={<PieChart size={20} />} label="Average attendance" value={`${fmt(avgAttendance)}${fields.includes("Attendance") ? "%" : ""}`} foot="Calculated from uploaded data" /></div>
          <div className="dl-section-heading"><div><h3>Visual analysis</h3><p>Each chart has independent field and record filters. Select any available column.</p></div></div>
          <div className="dl-chart-grid">
            <ChartCard title={`${yKey} by ${xKey}`} subtitle="Horizontal bar chart · ranked values" limit={barLimit} setLimit={setBarLimit} totalRows={rows.length} controls={<><Select value={xKey} options={fields} onChange={setBarX} /><Select value={yKey} options={nums} onChange={setBarY} /></>} onDownload={() => exportCsv(rows)}><ResponsiveContainer width="100%" height={300}><BarChart data={barData} layout="vertical" margin={{ top: 8, right: 22, left: 20, bottom: 24 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} /><XAxis type="number" dataKey="value" tick={{ fill: "var(--chart-tick)", fontSize: 11 }} label={{ value: yKey, position: "insideBottom", offset: -14, fill: "var(--chart-label)", fontSize: 12 }} /><YAxis type="category" dataKey="name" width={70} tick={{ fill: "var(--chart-tick)", fontSize: 11 }} /><Tooltip /><Bar dataKey="value" name={yKey} fill={COLORS[0]} radius={[0, 7, 7, 0]} /></BarChart></ResponsiveContainer></ChartCard>
            <ChartCard title={`${hKey} distribution`} subtitle="Histogram · frequency by value range" limit={histLimit} setLimit={setHistLimit} totalRows={rows.length} controls={<Select value={hKey} options={nums} onChange={setHistKey} />}><ResponsiveContainer width="100%" height={300}><BarChart data={histogramData} margin={{ top: 8, right: 12, left: -12, bottom: 34 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} /><XAxis dataKey="range" interval={0} angle={-15} textAnchor="end" height={50} tick={{ fill: "var(--chart-tick)", fontSize: 10 }} label={{ value: `${hKey} range`, position: "insideBottom", offset: -25, fill: "var(--chart-label)", fontSize: 12 }} /><YAxis allowDecimals={false} tick={{ fill: "var(--chart-tick)", fontSize: 11 }} /><Tooltip /><Bar dataKey="count" name="Records" fill={COLORS[1]} radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard>
            <ChartCard title={`${syKey} vs ${sxKey}`} subtitle="Scatter plot · relationship between numeric fields" limit={scatterLimit} setLimit={setScatterLimit} totalRows={rows.length} controls={<><Select value={sxKey} options={nums} onChange={setScatterX} /><Select value={syKey} options={nums} onChange={setScatterY} /></>}><ResponsiveContainer width="100%" height={300}><ScatterChart margin={{ top: 12, right: 18, left: 8, bottom: 28 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" /><XAxis type="number" dataKey="x" name={sxKey} tick={{ fill: "var(--chart-tick)", fontSize: 11 }} label={{ value: sxKey, position: "insideBottom", offset: -18, fill: "var(--chart-label)", fontSize: 12 }} /><YAxis type="number" dataKey="y" name={syKey} tick={{ fill: "var(--chart-tick)", fontSize: 11 }} label={{ value: syKey, angle: -90, position: "insideLeft", fill: "var(--chart-label)", fontSize: 12 }} /><ZAxis range={[70, 140]} /><Tooltip /><Scatter name="Records" data={scatterData} fill={COLORS[3]} /></ScatterChart></ResponsiveContainer></ChartCard>
            <ChartCard title={`${pKey} breakdown`} subtitle="Donut chart · records grouped into ranges" limit={pieLimit} setLimit={setPieLimit} totalRows={rows.length} controls={<Select value={pKey} options={nums} onChange={setPieKey} />}><ResponsiveContainer width="100%" height={300}><RePieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="44%" innerRadius={52} outerRadius={92} paddingAngle={3} label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>{pieData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(value, name) => [`${value} records`, name]} /><Legend verticalAlign="bottom" formatter={value => <span style={{ color: "var(--chart-label)", fontSize: 11 }}>{value}</span>} /></RePieChart></ResponsiveContainer></ChartCard>
          </div>
        </>}

        {(page === "Overview" || page === "Data Explorer") && <section className="dl-card dl-table-card"><div className="dl-card-header"><div><h3>Data Explorer</h3><p className="dl-subtitle">Search, preview and export your uploaded records.</p></div><button className="dl-secondary-button" onClick={() => exportCsv(rows)}><Download size={15} /> Export CSV</button></div><label className="dl-search"><Search size={16} /><input placeholder="Search any field..." value={search} onChange={e => setSearch(e.target.value)} /></label><div className="dl-table-wrap"><table className="dl-table"><thead><tr>{fields.map(f => <th key={f}>{f}</th>)}</tr></thead><tbody>{take(filteredRows, tableLimit).map((row, i) => <tr key={i}>{fields.map(f => <td key={f}>{String(row[f] ?? "")}</td>)}</tr>)}</tbody></table></div><div className="dl-table-footer"><span>Showing {take(filteredRows, tableLimit).length} of {filteredRows.length} matching records</span><LimitSelect value={tableLimit} onChange={setTableLimit} total={rows.length} /></div></section>}

        {(page === "Overview" || page === "Insights") && <section className="dl-card dl-bottom-insights"><p className="dl-eyebrow">DATA-DRIVEN OBSERVATIONS</p><h3>Dataset insights</h3><div className="dl-insight-list">
          <Insight number="01" title="Average attendance" text={`The average attendance is ${fmt(avgAttendance)}${fields.includes("Attendance") ? "%" : ""} across ${rows.length} records.`} />
          <Insight number="02" title="Average screen time" text={`Average screen time is ${fmt(avgScreen)} hours, based on uploaded values.`} />
          <Insight number="03" title="Average CGPA" text={`The average CGPA is ${fmt(avgCgpa)} across the dataset.`} />
          <Insight number="04" title="Average sleep" text={`Average sleep duration is ${fmt(avgSleep)} hours.`} />
          {maxCgpa && <Insight number="05" title="Highest CGPA" text={`${labelRow(maxCgpa)} has the highest CGPA at ${fmt(Number(maxCgpa.CGPA))}.`} />}
          {minCgpa && <Insight number="06" title="Lowest CGPA" text={`${labelRow(minCgpa)} has the lowest CGPA at ${fmt(Number(minCgpa.CGPA))}.`} />}
          {minSleep && <Insight number="07" title="Least sleep" text={`${labelRow(minSleep)} sleeps the least at ${fmt(Number(minSleep.SleepHours))} hours.`} />}
          {maxSleep && <Insight number="08" title="Most sleep" text={`${labelRow(maxSleep)} sleeps the most at ${fmt(Number(maxSleep.SleepHours))} hours.`} />}
          {minScreen && <Insight number="09" title="Lowest screen time" text={`${labelRow(minScreen)} has the lowest screen time at ${fmt(Number(minScreen.ScreenTime))} hours.`} />}
          {maxScreen && <Insight number="10" title="Highest screen time" text={`${labelRow(maxScreen)} has the highest screen time at ${fmt(Number(maxScreen.ScreenTime))} hours.`} />}
          {maxAttendance && <Insight number="11" title="Best attendance" text={`${labelRow(maxAttendance)} has the highest attendance at ${fmt(Number(maxAttendance.Attendance))}%.`} />}
          {minAttendance && <Insight number="12" title="Lowest attendance" text={`${labelRow(minAttendance)} has the lowest attendance at ${fmt(Number(minAttendance.Attendance))}%.`} />}
          {maxStudy && <Insight number="13" title="Most study time" text={`${labelRow(maxStudy)} studies the most at ${fmt(Number(maxStudy.StudyHours))} hours.`} />}
          {minStudy && <Insight number="14" title="Least study time" text={`${labelRow(minStudy)} studies the least at ${fmt(Number(minStudy.StudyHours))} hours.`} />}
          <Insight number="15" title="Dataset structure" text={`This dataset contains ${fields.length} columns: ${fields.join(", ")}.`} />
          <Insight number="16" title="Numeric fields" text={`${nums.length} numeric fields are available for charting: ${nums.join(", ") || "none detected"}.`} />
          <Insight number="17" title="Missing values" text={`${rows.reduce((total, r) => total + fields.filter(f => r[f] === "" || r[f] == null).length, 0)} blank cells were detected in the loaded records.`} />
          <Insight number="18" title="Chart coverage" text="All four charts have independent record filters and field selectors." />
        </div><p className="dl-story-note">These observations describe patterns in the dataset and do not prove that one factor causes another.</p></section>}

        {page === "Data Story" && <section className="dl-card dl-story-page"><div className="dl-story"><div className="dl-story-icon"><BookOpen size={24} /></div><p className="dl-eyebrow">DATA STORYTELLING</p><h2>Understanding the Story Behind the Data</h2><p className="dl-story-intro">This page explains the important findings from your current dataset using simple language. The story updates automatically when you upload another CSV file.</p><div className="dl-story-metrics"><div><span>Total records</span><strong>{rows.length}</strong></div><div><span>Dataset fields</span><strong>{fields.length}</strong></div><div><span>Story sections</span><strong>{dataStory.length}</strong></div></div><div className="dl-story-paragraphs">{dataStory.map((item, i) => <article className="dl-story-paragraph" key={item.title}><div className="dl-story-number">{String(i + 1).padStart(2, "0")}</div><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div><div className="dl-story-note"><strong>Important:</strong> The findings are calculated from the current dataset. Patterns do not automatically prove that one variable causes another.</div></div></section>}

        {page === "Settings" && <section className="dl-card dl-settings"><h3>Settings</h3><p>DataLens processes CSV data in your browser. No paid API is needed for charts or calculated insights.</p><p>Upload a CSV file to replace the sample dataset. Each chart has independent record limits and field selectors.</p></section>}
        <footer className="dl-footer"><span>© 2026 DataLens · Data Intelligence Workspace</span><span><span className="dl-footer-dot" /> Local-first analytics</span></footer>
      </div>
    </main>
  </div>;
}

function Kpi({ icon, label, value, foot }: { icon: React.ReactNode; label: string; value: string; foot: string }) {
  return <div className="dl-kpi-card"><div className="dl-kpi-top"><span>{label}</span>{icon}</div><strong>{value}</strong><div className="dl-kpi-foot"><CheckCircle2 size={14} />{foot}</div></div>;
}
function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="dl-select-wrap"><select value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o} value={o}>{o}</option>)}</select><ChevronDown size={13} /></label>;
}
function LimitSelect({ value, onChange, total }: { value: Limit; onChange: (value: Limit) => void; total: number }) {
  return <label className="dl-select-wrap"><select aria-label="Number of records" value={value} onChange={e => onChange(e.target.value === "all" ? "all" : Number(e.target.value) as 5 | 10 | 15)}><option value={5}>Top 5</option><option value={10}>Top 10</option><option value={15}>Top 15</option><option value="all">All ({total})</option></select><ChevronDown size={13} /></label>;
}
function ChartCard({ title, subtitle, controls, limit, setLimit, onDownload, children, totalRows }: { title: string; subtitle: string; controls: React.ReactNode; limit: Limit; setLimit: (value: Limit) => void; onDownload?: () => void; children: React.ReactNode; totalRows: number }) {
  return <section className="dl-card"><div className="dl-card-header"><div><h3>{title}</h3><p className="dl-subtitle">{subtitle}</p></div><div className="dl-chart-actions">{controls}<LimitSelect value={limit} onChange={setLimit} total={totalRows} />{onDownload && <button className="dl-icon-button" title="Export data" onClick={onDownload}><Download size={15} /></button>}</div></div><div className="dl-chart-body">{children}</div></section>;
}
function Insight({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="dl-insight-item"><span>{number}</span><p><strong>{title}:</strong> {text}</p></div>;
}
