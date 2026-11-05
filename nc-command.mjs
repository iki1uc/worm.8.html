export const NC = {
  omega: ({r,b,p,m}) => (r/100)*(b/100)*(p/100)*(1+m/500)*100,
  band: (v,min,max,wMin,wMax) => Number.isFinite(v)
    ? {ok: v>=min&&v<=max, warn: (v>=wMin&&v<min)||(v>max&&v<=wMax)}
    : {ok:false, warn:false, unknown:true},
  checks(s){
    const g = NC.omega(s), b = NC.band;
    return [
      {n:"MASS TRIAD", ...b(s.b/100,0.6,0.85,0.3,1)},
      {n:"POWER",      ...b(s.p,40,80,20,95)},
      {n:"OMEGA",      ...b(g,50,90,25,120)},
      {n:"FELDLAST",   ...b(s.C,40,80,20,95)},
      {n:"RESONANZ",   ...b(s.r,45,75,30,90)},
      {n:"MOVE",       ...b(s.m,30,70,20,100)},
    ];
  },
  gate: c => c.some(x=>x.unknown) ? "UNKNOWN"
           : c.some(x=>!x.ok&&!x.warn) ? "FAIL"
           : c.some(x=>x.warn) ? "TUNE" : "PASS",
  chain: ["◉",3,9,27,81,"◆","△","▣","3↺"],
  dauer: n => n==="◉" ? 1 : typeof n==="number" ? n : 3,
  // Bauer: rueckt nur vor, wenn Zeit um UND Gate PASS. Kein Auto-Run beim Import.
  bauer: (st, dt, values) => {
    const node = NC.chain[st.i], gate = NC.gate(NC.checks(values));
    const el = Math.min(NC.dauer(node), st.el + dt);
    if (el >= NC.dauer(node) && gate === "PASS")
      return st.i === NC.chain.length-1 ? {i:0, el:0, cycle:st.cycle+1, gate} : {i:st.i+1, el:0, cycle:st.cycle, gate};
    return {...st, el, gate};
  }
};
