import { useState, useEffect, useCallback } from "react";

const load = async (key) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } };
const save = async (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

const toKey = (d) => d.toISOString().slice(0, 10);
const today = () => new Date();
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const weekStart = (d) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const fmt = (d) => d.toLocaleDateString("da-DK", { weekday: "short", day: "numeric", month: "short" });
const fmtFull = (d) => d.toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtMonth = (d) => d.toLocaleDateString("da-DK", { month: "long", year: "numeric" });
const WDAYS = ["Man","Tir","Ons","Tor","Fre","Lør","Søn"];
const WFULL = ["Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag","Søndag"];
const MONTHS_DK = ["Januar","Februar","Marts","April","Maj","Juni","Juli","August","September","Oktober","November","December"];
const MOODS = ["😔","😕","😐","🙂","😊","🥰"];
const MLBL = ["Dårlig","Ikke god","Okay","God","Rigtig god","Fantastisk"];
const DEF_HABITS = ["✍️ Journaling","💪 Motion","💧 2L vand","😴 8t søvn","📖 Læsning","🧘 Meditation","🧴 Hudpleje","🥗 Sundt måltid"];

const G = {
  sage:"#7FA98B",sl:"#B8D4C0",sp:"#E8F2EC",sd:"#5A7D69",
  cream:"#FAF8F4",stone:"#E5DDD4",warm:"#C9BAA8",text:"#2A2A2A",
  muted:"#8A8278",acc:"#C4956A",al:"#F2E4D0",
  pink:"#C97E8A",pl:"#F5E3E6",white:"#FFFFFF",shad:"rgba(0,0,0,0.06)",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body{background:${G.cream};font-family:'DM Sans',sans-serif;color:${G.text};-webkit-font-smoothing:antialiased;}
.app{min-height:100vh;max-width:430px;margin:0 auto;background:${G.cream};}
.serif{font-family:'Cormorant Garamond',serif;}
.bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:${G.white};border-top:1px solid ${G.stone};display:flex;z-index:200;padding-bottom:env(safe-area-inset-bottom,0px);}
.nb{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 2px 7px;border:none;background:none;cursor:pointer;font-size:8px;color:${G.muted};font-family:'DM Sans',sans-serif;font-weight:500;letter-spacing:0.05em;text-transform:uppercase;transition:color 0.2s;}
.nb.on{color:${G.sage};}
.nb svg{width:18px;height:18px;}
.ph{padding:50px 18px 14px;background:${G.white};border-bottom:1px solid ${G.stone};}
.pt{font-family:'Cormorant Garamond',serif;font-size:25px;font-weight:400;letter-spacing:-0.01em;}
.ps{font-size:11px;color:${G.muted};margin-top:2px;font-weight:300;}
.card{background:${G.white};border-radius:14px;padding:15px;margin:9px 13px;box-shadow:0 1px 4px ${G.shad};}
.ct{font-size:10px;font-weight:500;letter-spacing:0.09em;text-transform:uppercase;color:${G.muted};margin-bottom:11px;}
.dnav{display:flex;align-items:center;justify-content:space-between;padding:9px 13px;background:${G.white};border-bottom:1px solid ${G.stone};}
.dnb{width:31px;height:31px;border-radius:50%;border:1.5px solid ${G.stone};background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:${G.muted};transition:all 0.15s;}
.dnb:hover:not(:disabled){border-color:${G.sage};color:${G.sage};}
.dnb:disabled{opacity:0.3;cursor:default;}
.dl{font-size:12.5px;font-weight:500;text-align:center;}
.dtb{font-size:9px;color:${G.sage};font-weight:600;letter-spacing:0.07em;text-transform:uppercase;display:block;text-align:center;margin-top:1px;}
.tabs{display:flex;gap:5px;padding:10px 13px 0;overflow-x:auto;scrollbar-width:none;}
.tabs::-webkit-scrollbar{display:none;}
.tab{padding:6px 12px;border-radius:20px;border:1.5px solid ${G.stone};background:none;cursor:pointer;font-size:11px;font-family:'DM Sans',sans-serif;color:${G.muted};white-space:nowrap;transition:all 0.15s;}
.tab.on{background:${G.sage};border-color:${G.sage};color:white;}
.chi{display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid ${G.stone};cursor:pointer;}
.chi:last-child{border-bottom:none;}
.chb{width:18px;height:18px;border-radius:5px;border:1.5px solid ${G.warm};flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
.chb.on{background:${G.sage};border-color:${G.sage};}
.chl{font-size:13px;font-weight:300;flex:1;}
.chl.x{color:${G.muted};text-decoration:line-through;}
.mr{display:flex;justify-content:space-between;}
.mb{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 2px;border-radius:10px;border:none;background:none;cursor:pointer;transition:background 0.15s;font-size:20px;}
.mb.on{background:${G.sp};}
.mlb{font-size:7px;color:${G.muted};font-family:'DM Sans',sans-serif;text-align:center;}
.wg{width:29px;height:35px;border-radius:4px 4px 7px 7px;border:1.5px solid ${G.sl};background:${G.white};cursor:pointer;transition:background 0.15s;}
.wg.on{background:${G.sl};border-color:${G.sage};}
.slb{width:33px;height:33px;border-radius:50%;border:1.5px solid ${G.stone};background:none;cursor:pointer;font-size:11px;font-weight:500;color:${G.muted};transition:all 0.15s;font-family:'DM Sans',sans-serif;}
.slb.on{background:${G.sage};border-color:${G.sage};color:white;}
.inp{border:1.5px solid ${G.stone};border-radius:10px;padding:8px 11px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:300;background:${G.cream};color:${G.text};outline:none;transition:border-color 0.2s;width:100%;}
.inp:focus{border-color:${G.sage};}
.ta{border:1.5px solid ${G.stone};border-radius:11px;padding:12px;font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:300;line-height:1.65;resize:none;background:${G.cream};color:${G.text};outline:none;transition:border-color 0.2s;width:100%;}
.ta:focus{border-color:${G.sage};}
.gi{width:100%;border:none;border-bottom:1px solid ${G.stone};padding:6px 0;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:300;background:none;color:${G.text};outline:none;}
.gi:focus{border-bottom-color:${G.sage};}
.addb{width:35px;height:35px;border-radius:10px;background:${G.sage};border:none;cursor:pointer;color:white;font-size:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.pill{padding:7px 16px;border-radius:20px;border:none;background:${G.sage};color:white;font-size:12.5px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;}
.pill.out{background:none;border:1.5px solid ${G.sage};color:${G.sage};}
.pill.sm{padding:5px 11px;font-size:11px;}
.delb{border:none;background:none;color:${G.muted};cursor:pointer;font-size:15px;padding:2px 3px;line-height:1;}
.sb{background:${G.sp};border-radius:11px;padding:11px;text-align:center;flex:1;}
.sn{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:${G.sage};line-height:1;}
.sl2{font-size:9px;color:${G.muted};margin-top:3px;letter-spacing:0.07em;text-transform:uppercase;}
.chip{display:inline-flex;align-items:center;padding:6px 12px;border-radius:20px;border:1.5px solid ${G.stone};background:none;cursor:pointer;font-size:12px;font-family:'DM Sans',sans-serif;color:${G.text};transition:all 0.15s;margin:3px;}
.chip.on{background:${G.pl};border-color:${G.pink};color:${G.pink};}
.chip.sage{background:${G.sp};border-color:${G.sage};color:${G.sd};}
.hrow{display:flex;align-items:center;padding:7px 0;border-bottom:1px solid ${G.stone};}
.hrow:last-child{border-bottom:none;}
.hday{width:26px;height:26px;border-radius:50%;border:1.5px solid ${G.stone};background:none;cursor:pointer;font-size:8px;color:${G.muted};font-family:'DM Sans',sans-serif;font-weight:500;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
.hday.on{background:${G.sage};border-color:${G.sage};color:white;}
.hday.tod{border-color:${G.acc};}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
.cal-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:11.5px;cursor:pointer;transition:all 0.15s;font-weight:300;position:relative;}
.cal-cell.hd{font-size:8.5px;font-weight:600;letter-spacing:0.05em;color:${G.muted};text-transform:uppercase;aspect-ratio:auto;padding:4px 0;}
.cal-cell.tod{background:${G.sage};color:white;font-weight:500;}
.cal-cell.ev{background:${G.al};color:${G.acc};font-weight:500;}
.cal-cell.om{color:${G.stone};}
.sch-row{display:flex;align-items:flex-start;padding:5px 0;border-bottom:1px solid ${G.stone};gap:9px;min-height:34px;}
.sch-row:last-child{border-bottom:none;}
.sch-t{font-size:10.5px;color:${G.muted};width:48px;flex-shrink:0;padding-top:2px;}
.sch-inp{flex:1;border:none;background:none;font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:300;color:${G.text};outline:none;padding:2px 0;}
.sch-inp::placeholder{color:${G.stone};}
.fli{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid ${G.stone};font-size:12.5px;}
.fli:last-child{border-bottom:none;}
.rt-step{display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid ${G.stone};cursor:pointer;}
.rt-step:last-child{border-bottom:none;}
.rt-num{width:21px;height:21px;border-radius:50%;background:${G.sp};color:${G.sage};font-size:10.5px;font-weight:500;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.rt-num.on{background:${G.sage};color:white;}
.mb-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;}
.mb-cell{aspect-ratio:1;border-radius:9px;background:${G.sp};border:1.5px dashed ${G.sl};display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;}
.mb-cell img{width:100%;height:100%;object-fit:cover;}
.goal-row{display:flex;align-items:flex-start;gap:9px;padding:8px 0;border-bottom:1px solid ${G.stone};}
.goal-row:last-child{border-bottom:none;}
.goal-dot{width:7px;height:7px;border-radius:50%;background:${G.sage};flex-shrink:0;margin-top:5px;}
.wnav{display:flex;align-items:center;justify-content:space-between;padding:7px 13px;}
.wl{font-size:11.5px;color:${G.muted};}
.book-row{display:flex;gap:11px;padding:9px 0;border-bottom:1px solid ${G.stone};}
.book-row:last-child{border-bottom:none;}
.book-cover{width:40px;height:54px;border-radius:4px;background:${G.sp};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:17px;}
.row{display:flex;gap:7px;align-items:center;}
.empty{text-align:center;padding:26px 12px;color:${G.muted};font-size:13px;font-weight:300;}
.empty .ico{font-size:28px;margin-bottom:7px;}
.div{height:1px;background:${G.stone};margin:4px 0;}
.pb{padding:7px 15px;border-radius:20px;border:none;background:${G.sage};color:white;font-size:12.5px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;}
.pb.out{background:none;border:1.5px solid ${G.sage};color:${G.sage};}
.prog{height:5px;border-radius:3px;background:${G.stone};overflow:hidden;flex:1;}
.prog-f{height:100%;border-radius:3px;background:${G.sage};transition:width 0.4s;}
.quote{font-family:'Cormorant Garamond',serif;font-size:14.5px;font-style:italic;color:${G.muted};text-align:center;padding:16px 22px;line-height:1.7;font-weight:300;}
`;

const Tick = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const L = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>;
const R = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>;
const Plus = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

const IHome = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21V12h6v9"/></svg>;
const ISun = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const IGrid = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const IBook = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IStar = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IWallet = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>;
const IDots = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg>;

function Chi({ label, checked, onToggle, sub }) {
  return (
    <div className="chi" onClick={onToggle}>
      <div className={`chb${checked ? " on" : ""}`}>{checked && <Tick />}</div>
      <div style={{ flex: 1 }}>
        <div className={`chl${checked ? " x" : ""}`}>{label}</div>
        {sub && <div style={{ fontSize: 10.5, color: G.muted, marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}
function DateNav({ date, setDate, isToday }) {
  return (
    <div className="dnav">
      <button className="dnb" onClick={() => setDate(d => addDays(d, -1))}><L /></button>
      <div><div className="dl">{fmt(date)}</div>{isToday && <span className="dtb">I DAG</span>}</div>
      <button className="dnb" onClick={() => setDate(d => addDays(d, 1))} disabled={isToday}><R /></button>
    </div>
  );
}
function WeekNav({ weekOf, setWeekOf }) {
  const isNow = toKey(weekOf) === toKey(weekStart(today()));
  return (
    <div className="wnav">
      <button className="dnb" onClick={() => setWeekOf(d => addDays(d, -7))}><L /></button>
      <span className="wl">{fmt(weekOf)} — {fmt(addDays(weekOf, 6))}</span>
      <button className="dnb" onClick={() => setWeekOf(d => addDays(d, 7))} disabled={isNow}><R /></button>
    </div>
  );
}
function BackBtn({ onBack, title, sub }) {
  return (
    <div className="ph" style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
      <button onClick={onBack} style={{ border: "none", background: "none", cursor: "pointer", color: G.sage, fontSize: 21, padding: "2px 0", marginTop: 1 }}>←</button>
      <div><div className="pt">{title}</div>{sub && <div className="ps">{sub}</div>}</div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  const [td, setTd] = useState({});
  const [wh, setWh] = useState({});
  const [wt, setWt] = useState({});
  const [habits, setHabits] = useState(DEF_HABITS);
  const tk = toKey(today());

  useEffect(() => {
    load(`daily:${tk}`).then(d => d && setTd(d));
    load(`habits-week:${toKey(weekStart(today()))}`).then(d => d && setWh(d));
    load(`todos:${toKey(weekStart(today()))}`).then(d => d && setWt(d));
    load("habits-list").then(h => h && setHabits(h));
  }, []);

  const tTodos = wt[tk] || [];
  const done = tTodos.filter(t => t.done).length;
  const hDone = habits.filter(h => wh[`${h}:${tk}`]).length;
  const hour = today().getHours();
  const greet = hour < 12 ? "God morgen" : hour < 17 ? "God eftermiddag" : "God aften";

  return (
    <div>
      <div style={{ background: `linear-gradient(135deg,${G.sp} 0%,${G.al} 100%)`, padding: "52px 18px 20px" }}>
        <div style={{ fontSize: 11, color: G.sage, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>{greet}</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 300, color: G.text, lineHeight: 1.2, marginBottom: 4 }}>It Girl Planner ✨</div>
        <div style={{ fontSize: 11.5, color: G.muted, fontWeight: 300, textTransform: "capitalize" }}>{fmtFull(today())}</div>
      </div>
      <div className="quote">"a girl who is going to do big things cannot let small things get to her."</div>

      <div style={{ display: "flex", gap: 7, padding: "0 13px 9px" }}>
        {[
          { val: td.mood !== undefined ? MOODS[td.mood] : "—", lbl: "Humør", page: "dag" },
          { val: `${hDone}/${habits.length}`, lbl: "Vaner", page: "habits" },
          { val: `${done}/${tTodos.length || "—"}`, lbl: "Opgaver", page: "todo" },
        ].map(s => (
          <div key={s.lbl} className="sb" style={{ cursor: "pointer" }} onClick={() => setPage(s.page)}>
            <div className="sn">{s.val}</div><div className="sl2">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
          <div className="ct" style={{ marginBottom: 0 }}>Dagens opgaver</div>
          <button className="pill sm out" onClick={() => setPage("todo")}>Se alle</button>
        </div>
        {tTodos.length === 0 ? <div style={{ fontSize: 12.5, color: G.muted, fontWeight: 300, textAlign: "center", padding: "6px 0" }}>Ingen opgaver tilføjet endnu</div>
          : tTodos.slice(0, 5).map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 0", borderBottom: `1px solid ${G.stone}` }}>
              <div className={`chb${t.done ? " on" : ""}`} style={{ width: 16, height: 16, borderRadius: 4 }}>{t.done && <Tick />}</div>
              <span style={{ fontSize: 12.5, fontWeight: 300, color: t.done ? G.muted : G.text, textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
            </div>
          ))}
        {tTodos.length > 0 && <div style={{ marginTop: 9, display: "flex", alignItems: "center", gap: 7 }}>
          <div className="prog"><div className="prog-f" style={{ width: `${tTodos.length ? done / tTodos.length * 100 : 0}%` }} /></div>
          <span style={{ fontSize: 10.5, color: G.muted }}>{done}/{tTodos.length}</span>
        </div>}
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
          <div className="ct" style={{ marginBottom: 0 }}>Ugens vaner</div>
          <button className="pill sm out" onClick={() => setPage("habits")}>Se alle</button>
        </div>
        {habits.slice(0, 5).map(h => {
          const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart(today()), i));
          const cnt = days.filter(d => wh[`${h}:${toKey(d)}`]).length;
          return (
            <div key={h} style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 0", borderBottom: `1px solid ${G.stone}` }}>
              <span style={{ fontSize: 12.5, flex: 1, fontWeight: 300 }}>{h}</span>
              <div className="prog" style={{ maxWidth: 70 }}><div className="prog-f" style={{ width: `${cnt / 7 * 100}%` }} /></div>
              <span style={{ fontSize: 10.5, color: G.muted, width: 22, textAlign: "right" }}>{cnt}/7</span>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginBottom: 90 }}>
        <div className="ct">Hurtig adgang</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          {[
            { id: "journal", icon: "📓", label: "Journal", sub: "Skriv i dag" },
            { id: "mere-rutiner", icon: "🌅", label: "Rutiner", sub: "Morgen & aften" },
            { id: "finans", icon: "💰", label: "Økonomi", sub: "Log udgifter" },
            { id: "mere", icon: "⋯", label: "Alt andet", sub: "Fitness, mål m.m." },
          ].map(l => (
            <button key={l.id} onClick={() => setPage(l.id)} style={{ background: G.sp, border: "none", borderRadius: 12, padding: "12px 11px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ fontSize: 22, marginBottom: 5 }}>{l.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: G.text }}>{l.label}</div>
              <div style={{ fontSize: 10.5, color: G.muted, marginTop: 1, fontWeight: 300 }}>{l.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DAG ──────────────────────────────────────────────────────────────────────
function DagPage() {
  const [date, setDate] = useState(today());
  const [d, setD] = useState({});
  const dk = `daily:${toKey(date)}`;
  const isToday = toKey(date) === toKey(today());
  const HOURS = ["5:00","6:00","7:00","8:00","9:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];
  const SKIN_M = ["Rens","Toner","Serum","Fugtighedscreme","SPF"];
  const SKIN_A = ["Rens","Toner","Serum","Øjencreme","Natcreme","Læbepleje"];

  useEffect(() => { load(dk).then(v => setD(v || {})); }, [dk]);
  const upd = useCallback(async (p) => {
    const n = { ...d, ...p }; setD(n); await save(dk, n);
  }, [d, dk]);

  const skin = d.skin || {};
  const sched = d.sched || {};
  const goals = d.goals || ["", "", ""];

  return (
    <div>
      <div className="ph"><div className="pt">Daglig log</div><div className="ps">{fmtFull(date)}</div></div>
      <DateNav date={date} setDate={setDate} isToday={isToday} />

      <div className="card">
        <div className="ct">Humør</div>
        <div className="mr">{MOODS.map((m, i) => (
          <button key={i} className={`mb${d.mood === i ? " on" : ""}`} onClick={() => upd({ mood: i })}>
            <span>{m}</span><span className="mlb">{MLBL[i]}</span>
          </button>
        ))}</div>
      </div>

      <div className="card">
        <div className="ct">Dagens 3 mål</div>
        {[0, 1, 2].map(i => (
          <div key={i} className="goal-row">
            <div className="goal-dot" style={{ background: goals[i] ? G.sage : G.stone }} />
            <input className="gi" placeholder={`Mål ${i + 1}...`} value={goals[i] || ""}
              onChange={e => { const g = [...goals]; g[i] = e.target.value; upd({ goals: g }); }} />
          </div>
        ))}
      </div>

      <div className="card">
        <div className="ct">Vand (glas)</div>
        <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`wg${(d.water || 0) > i ? " on" : ""}`}
              onClick={() => upd({ water: (d.water || 0) === i + 1 ? i : i + 1 })} />
          ))}
          <span style={{ fontSize: 11.5, color: G.muted, marginLeft: 4 }}>{d.water || 0}/8 glas</span>
        </div>
      </div>

      <div className="card">
        <div className="ct">Søvn (timer)</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {[4, 5, 6, 7, 8, 9, 10, 11].map(h => (
            <button key={h} className={`slb${d.sleep === h ? " on" : ""}`} onClick={() => upd({ sleep: d.sleep === h ? null : h })}>{h}t</button>
          ))}
        </div>
        {d.sleep && <div style={{ fontSize: 11.5, color: d.sleep >= 7 ? G.sage : G.acc, marginTop: 8 }}>
          {d.sleep >= 8 ? "🌟 Perfekt søvn!" : d.sleep >= 7 ? "✓ God søvn" : d.sleep >= 6 ? "⚡ Lidt kort" : "😴 Husk at prioritere søvn"}
        </div>}
      </div>

      <div className="card">
        <div className="ct">Hudpleje — Morgen</div>
        {SKIN_M.map(s => <Chi key={s} label={s} checked={!!skin[`m_${s}`]} onToggle={() => upd({ skin: { ...skin, [`m_${s}`]: !skin[`m_${s}`] } })} />)}
      </div>
      <div className="card">
        <div className="ct">Hudpleje — Aften</div>
        {SKIN_A.map(s => <Chi key={s} label={s} checked={!!skin[`a_${s}`]} onToggle={() => upd({ skin: { ...skin, [`a_${s}`]: !skin[`a_${s}`] } })} />)}
      </div>

      <div className="card">
        <div className="ct">Dagsskema</div>
        {HOURS.map(h => (
          <div key={h} className="sch-row">
            <span className="sch-t">{h}</span>
            <input className="sch-inp" placeholder="—" value={sched[h] || ""}
              onChange={e => upd({ sched: { ...sched, [h]: e.target.value } })} />
          </div>
        ))}
      </div>

      <div className="card">
        <div className="ct">Taknemmelighed</div>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
            <span style={{ color: G.sage, fontSize: 12 }}>✦</span>
            <input className="gi" placeholder="Jeg er taknemmelig for..."
              value={(d.gratitude || [])[i] || ""}
              onChange={e => { const g = [...(d.gratitude || ["", "", ""])]; g[i] = e.target.value; upd({ gratitude: g }); }} />
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 90 }}>
        <div className="ct">Dagens tanker & noter</div>
        <textarea className="ta" rows={5} placeholder="Skriv frit om din dag..." value={d.note || ""} onChange={e => upd({ note: e.target.value })} />
      </div>
    </div>
  );
}

// ─── HABITS ───────────────────────────────────────────────────────────────────
function HabitsPage() {
  const [weekOf, setWeekOf] = useState(weekStart(today()));
  const [data, setData] = useState({});
  const [habits, setHabits] = useState(DEF_HABITS);
  const [adding, setAdding] = useState(false);
  const [nH, setNH] = useState("");
  const wk = `habits-week:${toKey(weekOf)}`;
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekOf, i));
  const tk = toKey(today());

  useEffect(() => {
    load(wk).then(d => setData(d || {}));
    load("habits-list").then(h => h && setHabits(h));
  }, [wk]);

  const toggle = async (h, dk) => {
    const n = { ...data, [`${h}:${dk}`]: !data[`${h}:${dk}`] };
    setData(n); await save(wk, n);
  };
  const addH = async () => {
    if (!nH.trim()) return;
    const h = [...habits, nH.trim()]; setHabits(h); await save("habits-list", h); setNH(""); setAdding(false);
  };
  const delH = async (h) => { const n = habits.filter(x => x !== h); setHabits(n); await save("habits-list", n); };

  const total = habits.reduce((s, h) => s + days.filter(d => data[`${h}:${toKey(d)}`]).length, 0);
  const poss = habits.length * 7;

  return (
    <div>
      <div className="ph"><div className="pt">Habits tracker</div><div className="ps">Hold dine vaner i gang</div></div>

      <div style={{ display: "flex", gap: 7, padding: "9px 13px 0" }}>
        <div className="sb"><div className="sn">{total}</div><div className="sl2">Gennemført</div></div>
        <div className="sb"><div className="sn" style={{ fontSize: 22 }}>{poss ? Math.round(total / poss * 100) : 0}%</div><div className="sl2">Score</div></div>
        <div className="sb"><div className="sn">{habits.filter(h => days.every(d => data[`${h}:${toKey(d)}`])).length}</div><div className="sl2">Perfekte</div></div>
      </div>

      <WeekNav weekOf={weekOf} setWeekOf={setWeekOf} />

      <div className="card">
        <div style={{ display: "flex", marginBottom: 7 }}>
          <div style={{ flex: 1, fontSize: 9.5, color: G.muted, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase" }}>Vane</div>
          <div style={{ display: "flex", gap: 3 }}>
            {days.map((d, i) => <div key={i} style={{ width: 26, textAlign: "center", fontSize: 8.5, fontWeight: toKey(d) === tk ? 600 : 400, color: toKey(d) === tk ? G.acc : G.muted }}>{WDAYS[i]}</div>)}
          </div>
        </div>
        <div className="div" style={{ marginBottom: 3 }} />
        {habits.map(h => {
          const cnt = days.filter(d => data[`${h}:${toKey(d)}`]).length;
          return (
            <div key={h} className="hrow">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 400 }}>{h}</div>
                <div style={{ fontSize: 8.5, color: cnt === 7 ? G.sage : G.muted, marginTop: 1 }}>{cnt}/7 {cnt === 7 ? "🔥" : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 3 }}>
                {days.map((d, i) => {
                  const dk = toKey(d); const done = !!data[`${h}:${dk}`];
                  return <button key={i} className={`hday${done ? " on" : ""}${dk === tk ? " tod" : ""}`} onClick={() => toggle(h, dk)}>{done ? "✓" : ""}</button>;
                })}
              </div>
              <button className="delb" style={{ marginLeft: 7 }} onClick={() => delH(h)}>×</button>
            </div>
          );
        })}
        {adding ? (
          <div style={{ display: "flex", gap: 7, marginTop: 9 }}>
            <input className="inp" placeholder="Ny vane (fx 🧘 Meditation)" value={nH} onChange={e => setNH(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addH()} autoFocus />
            <button className="addb" onClick={addH}><Plus /></button>
          </div>
        ) : (
          <button className="pill out" style={{ width: "100%", marginTop: 9 }} onClick={() => setAdding(true)}>+ Tilføj vane</button>
        )}
      </div>

      <div className="card" style={{ marginBottom: 90 }}>
        <div className="ct">28-dages oversigt</div>
        {habits.slice(0, 5).map(h => {
          const last28 = Array.from({ length: 28 }, (_, i) => addDays(today(), -27 + i));
          const cnt = last28.filter(d => data[`${h}:${toKey(d)}`]).length;
          return (
            <div key={h} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 400 }}>{h}</span>
                <span style={{ fontSize: 10.5, color: G.muted }}>{cnt}/28</span>
              </div>
              <div style={{ display: "flex", gap: 2 }}>
                {last28.map((d, i) => <div key={i} style={{ width: 13, height: 13, borderRadius: 2, background: data[`${h}:${toKey(d)}`] ? G.sage : G.stone }} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── JOURNAL ──────────────────────────────────────────────────────────────────
function JournalPage() {
  const [date, setDate] = useState(today());
  const [d, setD] = useState({});
  const [tab, setTab] = useState("skriv");
  const [hist, setHist] = useState([]);
  const dk = `journal:${toKey(date)}`;
  const isToday = toKey(date) === toKey(today());

  useEffect(() => { load(dk).then(v => setD(v || {})); }, [dk]);
  useEffect(() => { if (tab === "historik") { (async () => { const r = []; for (let i = 0; i < 90; i++) { const dd = addDays(today(), -i); const v = await load(`journal:${toKey(dd)}`); if (v && (v.entry || v.gratitude?.some(g => g))) r.push({ date: dd, ...v }); } setHist(r); })(); } }, [tab]);

  const upd = async (p) => { const n = { ...d, ...p }; setD(n); await save(dk, n); };
  const PROMPTS = ["Hvad har gjort mig glad i dag?", "Hvad er jeg stolt af?", "Hvad vil jeg gøre anderledes?", "Hvad drømmer jeg om?", "Hvem er jeg taknemmelig for?", "Hvad giver mig energi?"];

  return (
    <div>
      <div className="ph"><div className="pt">Journal</div><div className="ps">Din personlige dagbog</div></div>
      <div className="tabs">
        {[["skriv", "✍️ Skriv"], ["historik", "📖 Historik"], ["prompts", "💡 Prompts"]].map(([t, l]) => (
          <button key={t} className={`tab${tab === t ? " on" : ""}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      {tab === "skriv" && <>
        <DateNav date={date} setDate={setDate} isToday={isToday} />
        <div className="card">
          <div className="ct">Humør</div>
          <div className="mr">{MOODS.map((m, i) => (
            <button key={i} className={`mb${d.mood === i ? " on" : ""}`} onClick={() => upd({ mood: i })}>
              <span>{m}</span><span className="mlb">{MLBL[i]}</span>
            </button>
          ))}</div>
        </div>
        <div className="card">
          <div className="ct">Dagbog</div>
          <textarea className="ta" rows={8} placeholder="Hvad er der på dit hjerte i dag?" value={d.entry || ""} onChange={e => upd({ entry: e.target.value })} style={{ minHeight: 150 }} />
        </div>
        <div className="card">
          <div className="ct">Taknemmelighed (3 ting)</div>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 0" }}>
              <span style={{ color: G.sage, fontSize: 12 }}>✦</span>
              <input className="gi" placeholder="Jeg er taknemmelig for..."
                value={(d.gratitude || [])[i] || ""}
                onChange={e => { const g = [...(d.gratitude || ["", "", ""])]; g[i] = e.target.value; upd({ gratitude: g }); }} />
            </div>
          ))}
        </div>
        <div className="card" style={{ marginBottom: 90 }}>
          <div className="ct">Hvad vil jeg forbedre?</div>
          <textarea className="ta" rows={3} placeholder="Én ting jeg kan gøre bedre i morgen..." value={d.improve || ""} onChange={e => upd({ improve: e.target.value })} />
        </div>
      </>}

      {tab === "historik" && <div style={{ paddingBottom: 90 }}>
        {hist.length === 0 ? <div className="empty"><div className="ico">📖</div>Ingen indlæg endnu</div>
          : hist.map((h, i) => (
            <div key={i} className="card" style={{ margin: "8px 13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <div style={{ fontSize: 10.5, color: G.muted, fontWeight: 500 }}>{fmtFull(h.date)}</div>
                {h.mood !== undefined && <span style={{ fontSize: 17 }}>{MOODS[h.mood]}</span>}
              </div>
              {h.entry && <div style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.5, color: G.text }}>{h.entry.slice(0, 200)}{h.entry.length > 200 ? "…" : ""}</div>}
              {h.gratitude?.filter(g => g).length > 0 && <div style={{ marginTop: 6, fontSize: 11, color: G.muted }}>✦ {h.gratitude.filter(g => g).join(" · ")}</div>}
            </div>
          ))}
      </div>}

      {tab === "prompts" && <div style={{ paddingBottom: 90 }}>
        <div className="card">
          <div className="ct">Skriveøvelser</div>
          {PROMPTS.map((p, i) => (
            <div key={i} style={{ padding: "9px 0", borderBottom: `1px solid ${G.stone}`, cursor: "pointer" }}
              onClick={() => { setTab("skriv"); upd({ entry: (d.entry || "") + (d.entry ? "\n\n" : "") + p + "\n" }); }}>
              <div style={{ fontSize: 13, fontWeight: 300 }}>{p}</div>
              <div style={{ fontSize: 10.5, color: G.sage, marginTop: 2 }}>Tryk for at tilføje →</div>
            </div>
          ))}
        </div>
      </div>}
    </div>
  );
}

// ─── TODO ─────────────────────────────────────────────────────────────────────
function TodoPage() {
  const [weekOf, setWeekOf] = useState(weekStart(today()));
  const [todos, setTodos] = useState({});
  const [inputs, setInputs] = useState({});
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekOf, i));
  const wk = `todos:${toKey(weekOf)}`;
  const tk = toKey(today());

  useEffect(() => { load(wk).then(d => setTodos(d || {})); }, [wk]);

  const sv = async (n) => { setTodos(n); await save(wk, n); };
  const add = async (dk) => {
    const txt = inputs[dk]?.trim(); if (!txt) return;
    await sv({ ...todos, [dk]: [...(todos[dk] || []), { id: Date.now(), text: txt, done: false }] });
    setInputs(i => ({ ...i, [dk]: "" }));
  };
  const tog = async (dk, id) => await sv({ ...todos, [dk]: (todos[dk] || []).map(t => t.id === id ? { ...t, done: !t.done } : t) });
  const del = async (dk, id) => await sv({ ...todos, [dk]: (todos[dk] || []).filter(t => t.id !== id) });

  const totD = days.reduce((s, d) => s + (todos[toKey(d)] || []).filter(t => t.done).length, 0);
  const totA = days.reduce((s, d) => s + (todos[toKey(d)] || []).length, 0);

  return (
    <div>
      <div className="ph"><div className="pt">Ugentlig to-do</div><div className="ps">{totD}/{totA} opgaver gennemført</div></div>
      <WeekNav weekOf={weekOf} setWeekOf={setWeekOf} />
      <div style={{ paddingBottom: 90 }}>
        {days.map((d, i) => {
          const dk = toKey(d); const list = todos[dk] || []; const isT = dk === tk;
          const done = list.filter(t => t.done).length;
          return (
            <div key={i} className="card" style={{ border: isT ? `1.5px solid ${G.sl}` : undefined }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: isT ? G.sage : G.muted }}>{WFULL[i]}</div>
                  <div style={{ fontSize: 10.5, color: G.muted, fontWeight: 300 }}>{d.toLocaleDateString("da-DK", { day: "numeric", month: "short" })}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  {list.length > 0 && <span style={{ fontSize: 10.5, color: G.muted }}>{done}/{list.length}</span>}
                  {isT && <span style={{ fontSize: 9, color: G.sage, fontWeight: 600, letterSpacing: "0.07em" }}>I DAG</span>}
                </div>
              </div>
              {list.map(t => (
                <div key={t.id} className="chi">
                  <div className={`chb${t.done ? " on" : ""}`} onClick={() => tog(dk, t.id)}>{t.done && <Tick />}</div>
                  <span className={`chl${t.done ? " x" : ""}`} style={{ flex: 1 }}>{t.text}</span>
                  <button className="delb" onClick={() => del(dk, t.id)}>×</button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 6, marginTop: 7 }}>
                <input className="inp" placeholder="Tilføj opgave..." value={inputs[dk] || ""}
                  onChange={e => setInputs(i => ({ ...i, [dk]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && add(dk)} />
                <button className="addb" onClick={() => add(dk)}><Plus /></button>
              </div>
              {list.length > 0 && <div style={{ marginTop: 7, display: "flex", alignItems: "center", gap: 7 }}>
                <div className="prog"><div className="prog-f" style={{ width: `${list.length ? done / list.length * 100 : 0}%` }} /></div>
                <span style={{ fontSize: 10, color: G.muted }}>{Math.round(list.length ? done / list.length * 100 : 0)}%</span>
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── FINANS ───────────────────────────────────────────────────────────────────
function FinansPage() {
  const [month, setMonth] = useState(() => { const d = today(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ desc: "", amount: "", type: "expense", cat: "Mad" });
  const [tab, setTab] = useState("overblik");
  const mk = `finance:${toKey(month).slice(0, 7)}`;
  const isNow = month.getFullYear() === today().getFullYear() && month.getMonth() === today().getMonth();
  const CATS = ["Mad", "Shopping", "Transport", "Bolig", "Underholdning", "Sundhed", "Sparing", "Andet"];

  useEffect(() => { load(mk).then(e => setEntries(e || [])); }, [mk]);
  const sve = async (n) => { setEntries(n); await save(mk, n); };
  const add = async () => {
    if (!form.desc.trim() || !form.amount) return;
    await sve([...entries, { id: Date.now(), ...form, amount: parseFloat(form.amount) }]);
    setForm({ desc: "", amount: "", type: "expense", cat: "Mad" });
  };

  const exp = entries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const inc = entries.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const catExp = CATS.map(c => ({ cat: c, total: entries.filter(e => e.type === "expense" && e.cat === c).reduce((s, e) => s + e.amount, 0) })).filter(c => c.total > 0);

  return (
    <div>
      <div className="ph"><div className="pt">Økonomi</div><div className="ps">{fmtMonth(month)}</div></div>
      <div className="tabs">
        {[["overblik", "📊 Overblik"], ["tilfoej", "➕ Tilføj"], ["alle", "📋 Alle poster"]].map(([t, l]) => (
          <button key={t} className={`tab${tab === t ? " on" : ""}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 13px" }}>
        <button className="dnb" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}><L /></button>
        <span style={{ fontSize: 13, fontWeight: 500, textTransform: "capitalize" }}>{fmtMonth(month)}</span>
        <button className="dnb" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} disabled={isNow}><R /></button>
      </div>

      {tab === "overblik" && <>
        <div style={{ display: "flex", gap: 7, padding: "0 13px 9px" }}>
          <div className="sb"><div className="sn" style={{ color: G.acc }}>{exp.toFixed(0)}</div><div className="sl2">Udgifter kr.</div></div>
          <div className="sb"><div className="sn">{inc.toFixed(0)}</div><div className="sl2">Indtægt kr.</div></div>
          <div className="sb" style={{ background: inc - exp >= 0 ? G.sp : G.pl }}>
            <div className="sn" style={{ color: inc - exp >= 0 ? G.sage : G.pink }}>{(inc - exp).toFixed(0)}</div>
            <div className="sl2">Netto kr.</div>
          </div>
        </div>
        {catExp.length > 0 && <div className="card">
          <div className="ct">Fordeling</div>
          {catExp.sort((a, b) => b.total - a.total).map(c => (
            <div key={c.cat} style={{ padding: "6px 0", borderBottom: `1px solid ${G.stone}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 12.5, fontWeight: 300 }}>{c.cat}</span>
                <span style={{ fontSize: 12.5, fontWeight: 500, color: G.acc }}>{c.total.toFixed(0)} kr.</span>
              </div>
              <div className="prog"><div className="prog-f" style={{ width: `${exp ? c.total / exp * 100 : 0}%`, background: G.acc }} /></div>
            </div>
          ))}
        </div>}
        <div className="card" style={{ marginBottom: 90 }}>
          <div className="ct">Seneste poster</div>
          {entries.length === 0 ? <div className="empty">Ingen poster endnu</div>
            : [...entries].reverse().slice(0, 8).map(e => (
              <div key={e.id} className="fli">
                <div><div style={{ fontWeight: 400 }}>{e.desc}</div><div style={{ fontSize: 10, color: G.muted, marginTop: 1 }}>{e.cat}</div></div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontWeight: 500, color: e.type === "expense" ? G.acc : G.sage }}>{e.type === "expense" ? "−" : "+"}{e.amount} kr.</span>
                  <button className="delb" onClick={() => sve(entries.filter(x => x.id !== e.id))}>×</button>
                </div>
              </div>
            ))}
        </div>
      </>}

      {tab === "tilfoej" && <div style={{ paddingBottom: 90 }}>
        <div className="card">
          <div className="ct">Type</div>
          <div style={{ display: "flex", gap: 7, marginBottom: 13 }}>
            {[["expense", "📤 Udgift"], ["income", "📥 Indtægt"]].map(([t, l]) => (
              <button key={t} className={`chip${form.type === t ? (t === "income" ? " sage" : " on") : ""}`} style={{ flex: 1, justifyContent: "center" }}
                onClick={() => setForm(f => ({ ...f, type: t }))}>{l}</button>
            ))}
          </div>
          <div className="ct">Kategori</div>
          <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 13 }}>
            {CATS.map(c => <button key={c} className={`chip${form.cat === c ? " sage" : ""}`} onClick={() => setForm(f => ({ ...f, cat: c }))} style={{ margin: 2 }}>{c}</button>)}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 9 }}>
            <input className="inp" placeholder="Beskrivelse" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} style={{ flex: 2 }} />
            <input className="inp" placeholder="kr." type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} onKeyDown={e => e.key === "Enter" && add()} style={{ flex: 1 }} />
          </div>
          <button className="pill" style={{ width: "100%" }} onClick={add}>Tilføj post</button>
        </div>
      </div>}

      {tab === "alle" && <div style={{ paddingBottom: 90 }}>
        <div className="card">
          {entries.length === 0 ? <div className="empty">Ingen poster endnu</div>
            : [...entries].reverse().map(e => (
              <div key={e.id} className="fli">
                <div><div style={{ fontWeight: 400 }}>{e.desc}</div><div style={{ fontSize: 10, color: G.muted }}>{e.cat}</div></div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontWeight: 500, color: e.type === "expense" ? G.acc : G.sage }}>{e.type === "expense" ? "−" : "+"}{e.amount} kr.</span>
                  <button className="delb" onClick={() => sve(entries.filter(x => x.id !== e.id))}>×</button>
                </div>
              </div>
            ))}
        </div>
      </div>}
    </div>
  );
}

// ─── MERE (menu) ──────────────────────────────────────────────────────────────
function MerePage({ initSub }) {
  const [sub, setSub] = useState(initSub || null);

  const SECS = [
    { id: "rutiner", icon: "🌅", label: "Rutiner", sub: "Morgen & aften" },
    { id: "fitness", icon: "💪", label: "Fitness", sub: "Træningsdagbog" },
    { id: "maal", icon: "🎯", label: "Mål & Rewind", sub: "Månedlige mål" },
    { id: "maaltider", icon: "🥗", label: "Måltidsplan", sub: "Ugens madplan" },
    { id: "boeger", icon: "📚", label: "Bogshylde", sub: "Læseliste" },
    { id: "periode", icon: "🌸", label: "Cyklus", sub: "Period tracker" },
    { id: "kalender", icon: "📅", label: "Kalender", sub: "Månedsoverblik" },
    { id: "moodboard", icon: "🖼️", label: "Mood Board", sub: "Din vision" },
    { id: "rengoring", icon: "🧹", label: "Rengøring", sub: "Ugentlig tjekliste" },
  ];

  if (sub === "rutiner") return <RutinerPage onBack={() => setSub(null)} />;
  if (sub === "fitness") return <FitnessPage onBack={() => setSub(null)} />;
  if (sub === "maal") return <MaalPage onBack={() => setSub(null)} />;
  if (sub === "maaltider") return <MaaltiderPage onBack={() => setSub(null)} />;
  if (sub === "boeger") return <BoegerPage onBack={() => setSub(null)} />;
  if (sub === "periode") return <PeriodePage onBack={() => setSub(null)} />;
  if (sub === "kalender") return <KalenderPage onBack={() => setSub(null)} />;
  if (sub === "moodboard") return <MoodBoardPage onBack={() => setSub(null)} />;
  if (sub === "rengoring") return <RengoringPage onBack={() => setSub(null)} />;

  return (
    <div>
      <div className="ph"><div className="pt">Mere</div><div className="ps">Alle sektioner</div></div>
      <div style={{ padding: "11px 13px 90px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        {SECS.map(s => (
          <button key={s.id} onClick={() => setSub(s.id)} style={{ background: G.white, border: `1px solid ${G.stone}`, borderRadius: 13, padding: "14px 12px", cursor: "pointer", textAlign: "left", boxShadow: `0 1px 3px ${G.shad}` }}>
            <div style={{ fontSize: 24, marginBottom: 5 }}>{s.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: G.text }}>{s.label}</div>
            <div style={{ fontSize: 10.5, color: G.muted, marginTop: 2, fontWeight: 300 }}>{s.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SUB PAGES ────────────────────────────────────────────────────────────────
function RutinerPage({ onBack }) {
  const [d, setD] = useState({});
  const dk = `routine:${toKey(today())}`;
  useEffect(() => { load(dk).then(v => setD(v || {})); }, [dk]);
  const upd = async (p) => { const n = { ...d, ...p }; setD(n); await save(dk, n); };
  const MRN = ["Vågn op","Drik vand","Meditation / journaling","Morgen hudpleje","Klæd dig på","Sund morgenmad","Gennemgå dagens mål","Motion / stræk"];
  const AFT = ["Afslut skærm kl. 21","Aftensmad i ro","Afrensning & hudpleje","Tøj klar til i morgen","Journaling","Læs 20 min","Taknemmelighed","Sov kl. 22–23"];
  const Sec = ({ title, items, pfx }) => (
    <div className="card">
      <div className="ct">{title}</div>
      {items.map((s, i) => (
        <div key={i} className="rt-step" onClick={() => upd({ [`${pfx}${i}`]: !d[`${pfx}${i}`] })}>
          <div className={`rt-num${d[`${pfx}${i}`] ? " on" : ""}`}>{d[`${pfx}${i}`] ? "✓" : i + 1}</div>
          <span style={{ fontSize: 13, fontWeight: 300, color: d[`${pfx}${i}`] ? G.muted : G.text, textDecoration: d[`${pfx}${i}`] ? "line-through" : "none" }}>{s}</span>
        </div>
      ))}
      <div style={{ marginTop: 9, display: "flex", alignItems: "center", gap: 7 }}>
        <div className="prog"><div className="prog-f" style={{ width: `${items.filter((_, i) => d[`${pfx}${i}`]).length / items.length * 100}%` }} /></div>
        <span style={{ fontSize: 10.5, color: G.muted }}>{items.filter((_, i) => d[`${pfx}${i}`]).length}/{items.length}</span>
      </div>
    </div>
  );
  return (
    <div>
      <BackBtn onBack={onBack} title="Rutiner" sub={fmtFull(today())} />
      <Sec title="🌞 Morgenrutine" items={MRN} pfx="m" />
      <Sec title="🌙 Aftenrutine" items={AFT} pfx="a" />
      <div style={{ height: 90 }} />
    </div>
  );
}

function FitnessPage({ onBack }) {
  const [date, setDate] = useState(today());
  const [d, setD] = useState({});
  const [hist, setHist] = useState([]);
  const dk = `fitness:${toKey(date)}`;
  const isToday = toKey(date) === toKey(today());
  const TYPES = ["Løb", "Cykling", "Yoga", "Styrketræning", "Svømning", "Gåtur", "Dans", "Andet"];

  useEffect(() => { load(dk).then(v => setD(v || {})); }, [dk]);
  useEffect(() => {
    (async () => {
      const r = [];
      for (let i = 0; i < 30; i++) { const dd = addDays(today(), -i); const v = await load(`fitness:${toKey(dd)}`); if (v && v.type) r.push({ date: dd, ...v }); }
      setHist(r);
    })();
  }, []);

  const upd = async (p) => { const n = { ...d, ...p }; setD(n); await save(dk, n); };

  return (
    <div>
      <BackBtn onBack={onBack} title="Fitness" sub="Træningsdagbog" />
      <DateNav date={date} setDate={setDate} isToday={isToday} />
      <div className="card">
        <div className="ct">Type træning</div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {TYPES.map(t => <button key={t} className={`chip${d.type === t ? " sage" : ""}`} onClick={() => upd({ type: d.type === t ? null : t })} style={{ margin: 2 }}>{t}</button>)}
        </div>
      </div>
      <div className="card">
        <div className="ct">Detaljer</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 9 }}>
          {[["Varighed (min)", "duration"], ["Kalorier", "cals"], ["Distance (km)", "dist"], ["Intensitet 1–10", "intensity"]].map(([lbl, k]) => (
            <div key={k}><div style={{ fontSize: 10.5, color: G.muted, marginBottom: 3 }}>{lbl}</div><input className="inp" type="number" value={d[k] || ""} onChange={e => upd({ [k]: e.target.value })} style={{ fontSize: 12.5 }} /></div>
          ))}
        </div>
        <textarea className="ta" rows={3} placeholder="Hvordan gik det?" value={d.note || ""} onChange={e => upd({ note: e.target.value })} />
      </div>
      <div className="card" style={{ marginBottom: 90 }}>
        <div className="ct">Seneste 30 dage</div>
        {hist.length === 0 ? <div className="empty">Ingen træningsposter endnu</div>
          : hist.slice(0, 10).map((h, i) => (
            <div key={i} className="fli">
              <div><div style={{ fontSize: 13, fontWeight: 400 }}>{h.type}{h.intensity ? ` (${h.intensity}/10)` : ""}</div><div style={{ fontSize: 10.5, color: G.muted }}>{fmt(h.date)}</div></div>
              <div style={{ textAlign: "right", fontSize: 11.5, color: G.muted }}>{h.duration && <div>{h.duration} min</div>}{h.cals && <div>{h.cals} kcal</div>}</div>
            </div>
          ))}
      </div>
    </div>
  );
}

function MaalPage({ onBack }) {
  const [d, setD] = useState({});
  const [tab, setTab] = useState("maal");
  const mk = `maal:${toKey(today()).slice(0, 7)}`;
  useEffect(() => { load(mk).then(v => setD(v || {})); }, [mk]);
  const upd = async (p) => { const n = { ...d, ...p }; setD(n); await save(mk, n); };
  const AREAS = ["Helbred & fitness", "Personlig vækst", "Karriere", "Familie & relationer", "Økonomi", "Fritid & hobbyer"];

  return (
    <div>
      <BackBtn onBack={onBack} title="Mål & Rewind" sub={fmtMonth(today())} />
      <div className="tabs">
        {[["maal", "🎯 Mål"], ["rewind", "🔄 Rewind"], ["aaret", "⭐ Året"]].map(([t, l]) => (
          <button key={t} className={`tab${tab === t ? " on" : ""}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>
      {tab === "maal" && <div style={{ paddingBottom: 90 }}>
        <div className="card">
          <div className="ct">Månedens 3 mål</div>
          {[0, 1, 2].map(i => (
            <div key={i} className="goal-row">
              <div className="goal-dot" />
              <input className="gi" placeholder={`Mål ${i + 1}...`} value={(d.goals || [])[i] || ""}
                onChange={e => { const g = [...(d.goals || ["", "", ""])]; g[i] = e.target.value; upd({ goals: g }); }} />
            </div>
          ))}
        </div>
        {AREAS.map(a => (
          <div key={a} className="card">
            <div className="ct">{a}</div>
            <textarea className="ta" rows={2} placeholder={`Mål inden for ${a.toLowerCase()}...`} value={d[a] || ""} onChange={e => upd({ [a]: e.target.value })} />
          </div>
        ))}
      </div>}
      {tab === "rewind" && <div style={{ paddingBottom: 90 }}>
        {[["Hvad gik godt?", "godt"], ["Hvad kunne gå bedre?", "bedre"], ["Hvad lærte jeg?", "laerte"], ["Hvad er jeg stolt af?", "stolt"], ["Næste måneds fokus", "fokus"]].map(([lbl, k]) => (
          <div key={k} className="card"><div className="ct">{lbl}</div><textarea className="ta" rows={3} placeholder="Skriv her..." value={d[k] || ""} onChange={e => upd({ [k]: e.target.value })} /></div>
        ))}
      </div>}
      {tab === "aaret" && <div style={{ paddingBottom: 90 }}>
        <div className="card">
          <div className="ct">Årets 5 store mål</div>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="goal-row">
              <div className="goal-dot" style={{ background: G.acc }} />
              <input className="gi" placeholder={`Årets mål ${i + 1}...`} value={(d.yearly || [])[i] || ""}
                onChange={e => { const g = [...(d.yearly || ["", "", "", "", ""])]; g[i] = e.target.value; upd({ yearly: g }); }} />
            </div>
          ))}
        </div>
        <div className="card"><div className="ct">Mit årsord</div><input className="inp" placeholder="Ét ord der definerer dit år..." value={d.word || ""} onChange={e => upd({ word: e.target.value })} /></div>
      </div>}
    </div>
  );
}

function MaaltiderPage({ onBack }) {
  const [weekOf, setWeekOf] = useState(weekStart(today()));
  const [d, setD] = useState({});
  const wk = `maaltider:${toKey(weekOf)}`;
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekOf, i));
  const MEALS = ["Morgenmad", "Frokost", "Aftensmad", "Snack"];
  useEffect(() => { load(wk).then(v => setD(v || {})); }, [wk]);
  const upd = async (p) => { const n = { ...d, ...p }; setD(n); await save(wk, n); };

  return (
    <div>
      <BackBtn onBack={onBack} title="Måltidsplan" sub="Ugentlig madplan" />
      <WeekNav weekOf={weekOf} setWeekOf={setWeekOf} />
      {days.map((day, i) => (
        <div key={i} className="card">
          <div className="ct">{WFULL[i]} {day.getDate()}. {day.toLocaleDateString("da-DK", { month: "short" })}</div>
          {MEALS.map(m => (
            <div key={m} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 0", borderBottom: `1px solid ${G.stone}` }}>
              <span style={{ fontSize: 10.5, color: G.muted, width: 68, flexShrink: 0 }}>{m}</span>
              <input className="inp" style={{ border: "none", background: "none", padding: "2px 0", fontSize: 12.5 }} placeholder="—"
                value={d[`${toKey(day)}_${m}`] || ""} onChange={e => upd({ [`${toKey(day)}_${m}`]: e.target.value })} />
            </div>
          ))}
        </div>
      ))}
      <div className="card" style={{ marginBottom: 90 }}>
        <div className="ct">Indkøbsliste</div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 0", borderBottom: `1px solid ${G.stone}` }}>
            <Chi label="" checked={!!d[`shop_done_${i}`]} onToggle={() => upd({ [`shop_done_${i}`]: !d[`shop_done_${i}`] })} />
            <input className="gi" style={{ flex: 1, textDecoration: d[`shop_done_${i}`] ? "line-through" : "none", color: d[`shop_done_${i}`] ? G.muted : G.text }}
              placeholder="Tilføj vare..." value={d[`shop_${i}`] || ""} onChange={e => upd({ [`shop_${i}`]: e.target.value })} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BoegerPage({ onBack }) {
  const [d, setD] = useState({ reading: [], read: [], want: [] });
  const [tab, setTab] = useState("nu");
  const [form, setForm] = useState({ title: "", author: "", status: "reading" });
  useEffect(() => { load("books").then(v => v && setD(v)); }, []);
  const sv = async (n) => { setD(n); await save("books", n); };
  const add = async () => {
    if (!form.title.trim()) return;
    const k = form.status === "reading" ? "reading" : form.status === "read" ? "read" : "want";
    await sv({ ...d, [k]: [...d[k], { id: Date.now(), ...form, rating: 0 }] });
    setForm({ title: "", author: "", status: "reading" });
  };
  const rate = async (k, id, r) => await sv({ ...d, [k]: d[k].map(b => b.id === id ? { ...b, rating: r } : b) });
  const del = async (k, id) => await sv({ ...d, [k]: d[k].filter(b => b.id !== id) });

  const BL = ({ items, lk }) => items.length === 0 ? <div className="empty">Ingen bøger endnu</div>
    : items.map(b => (
      <div key={b.id} className="book-row">
        <div className="book-cover">📖</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500 }}>{b.title}</div>
          {b.author && <div style={{ fontSize: 11.5, color: G.muted, marginTop: 1 }}>{b.author}</div>}
          {lk === "read" && <div style={{ marginTop: 5 }}>{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ cursor: "pointer", fontSize: 14, color: s <= b.rating ? G.acc : G.stone }} onClick={() => rate(lk, b.id, s)}>{s <= b.rating ? "★" : "☆"}</span>)}</div>}
        </div>
        <button className="delb" onClick={() => del(lk, b.id)}>×</button>
      </div>
    ));

  return (
    <div>
      <BackBtn onBack={onBack} title="Bogshylde" sub={`${d.reading.length + d.read.length + d.want.length} bøger`} />
      <div className="tabs">
        {[["nu", "📖 Læser nu"], ["laest", "✅ Læst"], ["vil", "💭 Vil læse"]].map(([t, l]) => (
          <button key={t} className={`tab${tab === t ? " on" : ""}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>
      <div className="card">
        <div className="ct">Tilføj bog</div>
        <input className="inp" placeholder="Titel" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ marginBottom: 6 }} />
        <input className="inp" placeholder="Forfatter" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} style={{ marginBottom: 6 }} />
        <div style={{ display: "flex", gap: 5, marginBottom: 9 }}>
          {[["reading", "Læser nu"], ["read", "Læst"], ["want", "Vil læse"]].map(([v, l]) => (
            <button key={v} className={`chip${form.status === v ? " sage" : ""}`} onClick={() => setForm(f => ({ ...f, status: v }))} style={{ flex: 1, justifyContent: "center", fontSize: 11 }}>{l}</button>
          ))}
        </div>
        <button className="pill" style={{ width: "100%" }} onClick={add}>Tilføj</button>
      </div>
      <div className="card" style={{ marginBottom: 90 }}>
        {tab === "nu" && <BL items={d.reading} lk="reading" />}
        {tab === "laest" && <BL items={d.read} lk="read" />}
        {tab === "vil" && <BL items={d.want} lk="want" />}
      </div>
    </div>
  );
}

function PeriodePage({ onBack }) {
  const [d, setD] = useState({ cycles: [] });
  const [symp, setSymp] = useState({});
  const [tab, setTab] = useState("log");
  const tk = toKey(today());
  useEffect(() => {
    load("period:data").then(v => v && setD(v));
    load("period:symptoms").then(v => v && setSymp(v));
  }, []);
  const upd = async (p) => { const n = { ...d, ...p }; setD(n); await save("period:data", n); };
  const updS = async (p) => { const n = { ...symp, ...p }; setSymp(n); await save("period:symptoms", n); };
  const ts = symp[tk] || {};
  const SYMPS = ["Kramper", "Humørsvingninger", "Oppustethed", "Træthed", "Hovedpine", "Acne", "Rygsmerter", "Søvnproblemer"];
  const FLOWS = ["Let 💧", "Medium 💧💧", "Kraftig 💧💧💧", "Meget kraftig 💧💧💧💧"];
  const dayNum = d.current ? Math.round((today() - new Date(d.current)) / 86400000) + 1 : null;
  const avgLen = (d.cycles || []).filter(c => c.end).map(c => Math.round((new Date(c.end) - new Date(c.start)) / 86400000) + 1).reduce((a, b, _, arr) => a + b / arr.length, 0);

  return (
    <div>
      <BackBtn onBack={onBack} title="Cyklus" sub="Period tracker" />
      <div className="tabs">
        {[["log", "🩸 Log"], ["historik", "📅 Historik"], ["stats", "📊 Stats"]].map(([t, l]) => (
          <button key={t} className={`tab${tab === t ? " on" : ""}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>
      {tab === "log" && <>
        <div className="card">
          <div className="ct">Status</div>
          {d.current ? (
            <div>
              <div style={{ textAlign: "center", padding: "9px 0" }}>
                <div style={{ fontSize: 30 }}>🩸</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 300, color: G.pink, marginTop: 3 }}>Dag {dayNum}</div>
                <div style={{ fontSize: 11.5, color: G.muted, marginTop: 2 }}>Startet {new Date(d.current).toLocaleDateString("da-DK", { day: "numeric", month: "long" })}</div>
              </div>
              <button className="pill" style={{ width: "100%", background: G.pink }} onClick={() => upd({ cycles: [...(d.cycles || []).slice(0, -1), { ...(d.cycles || []).slice(-1)[0], end: tk }], current: null })}>Afslut menstruation</button>
            </div>
          ) : (
            <button className="pb out" style={{ width: "100%", borderColor: G.pink, color: G.pink }} onClick={() => upd({ cycles: [...(d.cycles || []), { start: tk }], current: tk })}>🩸 Start menstruation</button>
          )}
        </div>
        <div className="card"><div className="ct">Flow (i dag)</div><div style={{ display: "flex", flexWrap: "wrap" }}>{FLOWS.map(f => <button key={f} className={`chip${ts.flow === f ? " on" : ""}`} onClick={() => updS({ [tk]: { ...ts, flow: ts.flow === f ? null : f } })}>{f}</button>)}</div></div>
        <div className="card" style={{ marginBottom: 90 }}><div className="ct">Symptomer</div>{SYMPS.map(s => <Chi key={s} label={s} checked={!!ts[s]} onToggle={() => updS({ [tk]: { ...ts, [s]: !ts[s] } })} />)}</div>
      </>}
      {tab === "historik" && <div style={{ paddingBottom: 90 }}>
        {(d.cycles || []).length === 0 ? <div className="empty"><div className="ico">🌸</div>Ingen cyklusser endnu</div>
          : [...(d.cycles || [])].reverse().map((c, i) => {
            const days2 = c.end ? Math.round((new Date(c.end) - new Date(c.start)) / 86400000) + 1 : null;
            return (
              <div key={i} className="card" style={{ margin: "7px 13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>🩸 {new Date(c.start).toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" })}</div>
                    {c.end && <div style={{ fontSize: 11.5, color: G.muted, marginTop: 2 }}>→ {new Date(c.end).toLocaleDateString("da-DK", { day: "numeric", month: "long" })}</div>}
                    {!c.end && <div style={{ fontSize: 11, color: G.sage, marginTop: 2 }}>Igangværende</div>}
                  </div>
                  {days2 && <div className="sb" style={{ padding: "7px 13px", background: G.pl, maxWidth: 70 }}><div className="sn" style={{ color: G.pink, fontSize: 22 }}>{days2}</div><div className="sl2" style={{ color: G.pink }}>dage</div></div>}
                </div>
              </div>
            );
          })}
      </div>}
      {tab === "stats" && <div style={{ paddingBottom: 90 }}>
        <div style={{ display: "flex", gap: 7, padding: "9px 13px" }}>
          {[[(d.cycles || []).length, "Cyklusser"], [avgLen ? Math.round(avgLen) : "—", "Gns. dage"], [Object.values(symp).filter(s => s.flow).length, "Flow-dage"]].map(([v, l]) => (
            <div key={l} className="sb" style={{ background: G.pl }}><div className="sn" style={{ color: G.pink, fontSize: 22 }}>{v}</div><div className="sl2" style={{ color: G.pink }}>{l}</div></div>
          ))}
        </div>
        <div className="card">
          <div className="ct">Hyppige symptomer</div>
          {SYMPS.map(s => { const cnt = Object.values(symp).filter(v => v[s]).length; if (!cnt) return null; return (
            <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${G.stone}`, fontSize: 12.5 }}>
              <span>{s}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div className="prog" style={{ width: 55, background: G.pl }}><div className="prog-f" style={{ width: `${Math.min(cnt / 10 * 100, 100)}%`, background: G.pink }} /></div>
                <span style={{ color: G.pink, fontWeight: 500, width: 18, textAlign: "right" }}>{cnt}×</span>
              </div>
            </div>
          ); })}
        </div>
      </div>}
    </div>
  );
}

function KalenderPage({ onBack }) {
  const [month, setMonth] = useState(() => { const d = today(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [events, setEvents] = useState({});
  const [sel, setSel] = useState(null);
  const [inp, setInp] = useState("");
  const ek = `events:${toKey(month).slice(0, 7)}`;
  const isNow = month.getFullYear() === today().getFullYear() && month.getMonth() === today().getMonth();

  useEffect(() => { load(ek).then(v => setEvents(v || {})); }, [ek]);

  const dim = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const fd = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
  const cells = Array.from({ length: fd + dim }, (_, i) => i < fd ? null : i - fd + 1);

  const addEv = async () => {
    if (!sel || !inp.trim()) return;
    const dk = `${toKey(month).slice(0, 8)}${String(sel).padStart(2, "0")}`;
    const n = { ...events, [dk]: [...(events[dk] || []), inp.trim()] };
    setEvents(n); await save(ek, n); setInp("");
  };
  const delEv = async (dk, idx) => {
    const n = { ...events, [dk]: (events[dk] || []).filter((_, i) => i !== idx) };
    setEvents(n); await save(ek, n);
  };

  return (
    <div>
      <BackBtn onBack={onBack} title="Kalender" sub={fmtMonth(month)} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 13px" }}>
        <button className="dnb" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}><L /></button>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 400, textTransform: "capitalize" }}>{fmtMonth(month)}</span>
        <button className="dnb" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} disabled={isNow}><R /></button>
      </div>
      <div className="card">
        <div className="cal-grid" style={{ marginBottom: 7 }}>
          {["M", "T", "O", "T", "F", "L", "S"].map((d, i) => <div key={i} className="cal-cell hd">{d}</div>)}
          {cells.map((n, i) => {
            if (!n) return <div key={i} />;
            const dk = `${toKey(month).slice(0, 8)}${String(n).padStart(2, "0")}`;
            const isT = isNow && n === today().getDate();
            const hasEv = (events[dk] || []).length > 0;
            return (
              <div key={i} className={`cal-cell${isT ? " tod" : hasEv ? " ev" : ""}`} style={{ cursor: "pointer" }} onClick={() => setSel(n === sel ? null : n)}>
                {n}
                {hasEv && !isT && <span style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 3, height: 3, borderRadius: "50%", background: G.acc, display: "block" }} />}
              </div>
            );
          })}
        </div>
        {sel && (() => {
          const dk = `${toKey(month).slice(0, 8)}${String(sel).padStart(2, "0")}`;
          return (
            <div style={{ borderTop: `1px solid ${G.stone}`, paddingTop: 11, marginTop: 3 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: G.muted, marginBottom: 7, letterSpacing: "0.07em", textTransform: "uppercase" }}>{sel}. {MONTHS_DK[month.getMonth()]}</div>
              {(events[dk] || []).map((e, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${G.stone}`, fontSize: 12.5 }}>
                  <span>📌 {e}</span><button className="delb" onClick={() => delEv(dk, i)}>×</button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 6, marginTop: 7 }}>
                <input className="inp" placeholder="Tilføj begivenhed..." value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && addEv()} />
                <button className="addb" onClick={addEv}><Plus /></button>
              </div>
            </div>
          );
        })()}
      </div>
      <div style={{ height: 90 }} />
    </div>
  );
}

function MoodBoardPage({ onBack }) {
  const [imgs, setImgs] = useState(Array(9).fill(null));
  const [quote, setQuote] = useState("");
  useEffect(() => { load("moodboard:imgs").then(v => v && setImgs(v)); load("moodboard:quote").then(v => v && setQuote(v)); }, []);
  const QUOTES = ["a girl who is going to do big things cannot let small things get to her.", "she believed she could, so she did.", "be the energy you want to attract.", "do it with passion or not at all.", "your only limit is your mind."];

  return (
    <div>
      <BackBtn onBack={onBack} title="Mood Board" sub="Din vision & inspiration" />
      <div className="card">
        <div className="ct">Din quote</div>
        <div className="quote" style={{ padding: "7px 0", marginBottom: 9 }}>"{quote || QUOTES[0]}"</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 9 }}>
          {QUOTES.map((q, i) => <button key={i} className={`chip${quote === q || (!quote && i === 0) ? " sage" : ""}`} style={{ fontSize: 10.5 }} onClick={() => { setQuote(q); save("moodboard:quote", q); }}>{i + 1}</button>)}
        </div>
        <input className="inp" placeholder="Eller skriv din egen..." value={quote} onChange={e => { setQuote(e.target.value); save("moodboard:quote", e.target.value); }} />
      </div>
      <div className="card" style={{ marginBottom: 90 }}>
        <div className="ct">Billeder</div>
        <div className="mb-grid">
          {imgs.map((img, i) => (
            <div key={i} className="mb-cell" onClick={() => { const url = prompt("Indsæt billed-URL:"); if (url !== null) { const n = [...imgs]; n[i] = url || null; setImgs(n); save("moodboard:imgs", n); } }}>
              {img ? <img src={img} alt="" onError={e => { e.target.style.display = "none"; }} /> : <span style={{ fontSize: 22, color: G.sl }}>+</span>}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10.5, color: G.muted, marginTop: 9, textAlign: "center" }}>Tryk på et felt og indsæt et billed-link</div>
      </div>
    </div>
  );
}

function RengoringPage({ onBack }) {
  const [d, setD] = useState({});
  const wk = `rengoring:${toKey(weekStart(today()))}`;
  useEffect(() => { load(wk).then(v => setD(v || {})); }, [wk]);
  const upd = async (p) => { const n = { ...d, ...p }; setD(n); await save(wk, n); };
  const DAILY = ["Gør sengen", "Opvask", "Ryd køkken", "Sop/fejl gulv", "Ryd op i stuen"];
  const WEEKLY = ["Støvsug alle rum", "Vask gulve", "Rens badeværelse", "Skift sengetøj", "Vask tøj", "Puds vinduer", "Ryd af hylder", "Tøm skraldespande"];
  const MONTHLY = ["Rengør ovn", "Rengør køleskab", "Vask gardiner", "Under møbler", "Organiser skabe", "Rengør vaskemaskine"];
  const Sec = ({ title, items, pfx }) => (
    <div className="card">
      <div className="ct">{title}</div>
      {items.map((s, i) => <Chi key={i} label={s} checked={!!d[`${pfx}${i}`]} onToggle={() => upd({ [`${pfx}${i}`]: !d[`${pfx}${i}`] })} />)}
      <div style={{ marginTop: 9, display: "flex", alignItems: "center", gap: 7 }}>
        <div className="prog"><div className="prog-f" style={{ width: `${items.filter((_, i) => d[`${pfx}${i}`]).length / items.length * 100}%` }} /></div>
        <span style={{ fontSize: 10.5, color: G.muted }}>{items.filter((_, i) => d[`${pfx}${i}`]).length}/{items.length}</span>
      </div>
    </div>
  );
  return (
    <div>
      <BackBtn onBack={onBack} title="Rengøring" sub="Ugentlig tjekliste" />
      <Sec title="🌅 Daglig" items={DAILY} pfx="d" />
      <Sec title="📅 Ugentlig" items={WEEKLY} pfx="w" />
      <Sec title="📆 Månedlig" items={MONTHLY} pfx="m" />
      <div style={{ height: 90 }} />
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");

  const handlePage = (p) => { setPage(p); };

  const content = () => {
    if (page === "home") return <HomePage setPage={handlePage} />;
    if (page === "dag") return <DagPage />;
    if (page === "habits") return <HabitsPage />;
    if (page === "journal") return <JournalPage />;
    if (page === "todo") return <TodoPage />;
    if (page === "finans") return <FinansPage />;
    if (page === "mere") return <MerePage />;
    if (page === "mere-rutiner") return <MerePage initSub="rutiner" />;
    return <MerePage />;
  };

  const NAV = [
    { id: "home", label: "Hjem", icon: <IHome /> },
    { id: "dag", label: "Daglig", icon: <ISun /> },
    { id: "habits", label: "Vaner", icon: <IGrid /> },
    { id: "journal", label: "Journal", icon: <IBook /> },
    { id: "todo", label: "To-do", icon: <IStar /> },
    { id: "finans", label: "Økonomi", icon: <IWallet /> },
    { id: "mere", label: "Mere", icon: <IDots /> },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div style={{ paddingBottom: 68 }}>{content()}</div>
        <nav className="bnav">
          {NAV.map(n => (
            <button key={n.id} className={`nb${page === n.id || (page === "mere-rutiner" && n.id === "mere") ? " on" : ""}`} onClick={() => handlePage(n.id)}>
              {n.icon}{n.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
