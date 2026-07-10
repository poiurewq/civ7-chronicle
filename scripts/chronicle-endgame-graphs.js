const LOG = "[ozq-chronicle]", OVERLAY_ID = "ozq-chronicle-graphs-overlay";

function loadLoggerStore() {
  try {
    const key = localStorage.getItem("chronicle:v1:current") || "nogid", raw = localStorage.getItem("chronicle:v1:" + key);
    if (raw) {
      const o = JSON.parse(raw);
      if (o && o.ages) return o;
    }
  } catch (e) {}
  return null;
}

function loggerMetricHasData(key) {
  const store = loadLoggerStore();
  if (!store || !store.ages) return !1;
  for (const k in store.ages) {
    const turns = store.ages[k].turns || {};
    for (const t in turns) {
      const p = turns[t].p || {};
      for (const pid in p) if (null != p[pid][key]) return !0;
    }
  }
  return !1;
}

const CATEGORIES = [ "Growth", "Totals", "By Type" ], METRICS = [ {
  id: "Science",
  label: "Science / Turn",
  category: "Growth",
  loggerKey: "Science",
  default: !0
}, {
  id: "TechsAcquired",
  label: "Technologies",
  category: "Growth",
  stepped: !0,
  loggerKey: "TechsAcquired"
}, {
  id: "Culture",
  label: "Culture / Turn",
  category: "Growth",
  loggerKey: "Culture"
}, {
  id: "CivicsAcquired",
  label: "Civics",
  category: "Growth",
  stepped: !0,
  loggerKey: "CivicsAcquired",
  loggerOnly: !0
}, {
  id: "goldNet",
  label: "Gold / Turn",
  category: "Growth",
  loggerKey: "goldNet",
  loggerOnly: !0,
  signed: !0,
  yTitle: "Net gold / turn"
}, {
  id: "Gold",
  label: "Gold (Treasury)",
  category: "Growth",
  loggerKey: "gold"
}, {
  id: "Food",
  label: "Food / Turn",
  category: "Growth",
  cityRollup: !0,
  loggerKey: "Food"
}, {
  id: "Population",
  label: "Population",
  category: "Growth",
  cityRollup: !0,
  loggerKey: "Population"
}, {
  id: "hap",
  label: "Happiness / Turn",
  category: "Growth",
  loggerKey: "hap",
  loggerOnly: !0,
  signed: !0,
  yTitle: "Net happiness / turn"
}, {
  id: "inf",
  label: "Influence / Turn",
  category: "Growth",
  loggerKey: "inf",
  loggerOnly: !0,
  signed: !0,
  yTitle: "Influence / turn"
}, {
  id: "Production",
  label: "Production / Turn",
  category: "Growth",
  cityRollup: !0,
  loggerKey: "Production"
}, {
  id: "Tourism",
  label: "Tourism / Turn",
  category: "Growth",
  cityRollup: !0,
  loggerKey: "Tourism"
}, {
  id: "CitiesFounded",
  label: "Cities Founded",
  category: "Totals",
  delta: !0,
  stepped: !0
}, {
  id: "CitiesTotal",
  label: "Cities (Total)",
  category: "Totals",
  stepped: !0,
  combine: [ {
    id: "CitiesFounded",
    sign: 1
  }, {
    id: "CitiesConquered",
    sign: 1
  }, {
    id: "CitiesLost",
    sign: -1
  } ]
}, {
  id: "CitiesConquered",
  label: "Cities Conquered",
  category: "Totals",
  delta: !0,
  stepped: !0
}, {
  id: "GreatPeopleEarned",
  label: "Great People",
  category: "Totals",
  delta: !0,
  stepped: !0
}, {
  id: "UnitsKilled",
  label: "Units Killed",
  category: "Totals",
  delta: !0,
  stepped: !0
}, {
  id: "UnitsLost",
  label: "Units Lost",
  category: "Totals",
  delta: !0,
  stepped: !0
}, {
  id: "WondersConstructed",
  label: "Wonders",
  category: "Totals",
  delta: !0,
  stepped: !0
}, {
  id: "UnitsTrainedByType",
  label: "Units Trained",
  category: "By Type",
  kind: "bar",
  lookup: "Units",
  xTitle: "Unit type",
  yTitle: "Number trained"
}, {
  id: "UnitsKilledByType",
  label: "Kills by Unit",
  category: "By Type",
  kind: "bar",
  lookup: "Units",
  xTitle: "Your unit type",
  yTitle: "Enemy units it killed"
}, {
  id: "UnitsLostByType",
  label: "Losses by Unit",
  category: "By Type",
  kind: "bar",
  lookup: "Units",
  xTitle: "Your unit type",
  yTitle: "Number lost"
}, {
  id: "BuildingsBuiltByType",
  label: "Buildings",
  category: "By Type",
  kind: "bar",
  lookup: "Constructibles",
  xTitle: "Building",
  yTitle: "Number built"
}, {
  id: "DistrictsBuiltByType",
  label: "Districts",
  category: "By Type",
  kind: "bar",
  lookup: "Districts",
  xTitle: "District",
  yTitle: "Number built"
}, {
  id: "WondersBuiltByType",
  label: "Wonders",
  category: "By Type",
  kind: "board",
  lookup: "Constructibles"
} ], ALL_DATASET_IDS = [ "Beliefs", "Cities", "CivicsAcquired", "Culture", "Faith", "Followers", "Gold", "Science", "Score", "TechsAcquired", "BuildingsConstructed", "CitiesConquered", "CitiesFounded", "CitiesLost", "Combats", "DistrictsConstructed", "GreatPeopleEarned", "NaturalWondersDiscovered", "NukesLaunched", "UnitsKilled", "UnitsLost", "WarsDeclared", "WarsReceived", "WondersConstructed" ];

function ownerName(obj) {
  try {
    const p = Players.get(obj.ownerPlayer);
    if (p && p.leaderName) return Locale.compose(p.leaderName);
  } catch (e) {}
  return `Player ${obj.ownerPlayer}`;
}

function ownerColor(obj) {
  try {
    return UI.Player.getPrimaryColorValueAsString(obj.ownerPlayer);
  } catch (e) {
    return "#B0B0B0";
  }
}

function ownerColorSecondary(obj) {
  try {
    return UI.Player.getSecondaryColorValueAsString(obj.ownerPlayer);
  } catch (e) {
    return "#FFFFFF";
  }
}

function ageEndTurn() {
  try {
    if ("undefined" != typeof Game && null != Game.turn) return Game.turn;
  } catch (e) {}
  return 0;
}

function resolveAgeMeta(ageKey, ageObj) {
  let ci = ageObj && null != ageObj.ci ? ageObj.ci : null, label = ageObj && ageObj.label ? ageObj.label : "";
  if (null == ci || !label) try {
    if ("undefined" != typeof GameInfo && GameInfo.Ages) for (const a of GameInfo.Ages) if (String(a.$hash) === String(ageKey) || a.AgeType === ageKey) {
      null == ci && (ci = a.ChronologyIndex), label || (label = a.AgeType);
      break;
    }
  } catch (e) {}
  return {
    ci: null != ci ? ci : 0,
    label: label || String(ageKey)
  };
}

function prettifyType(type) {
  return String(type).replace(/^[A-Z]+_/, "").toLowerCase().replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function resolveTypeName(table, type) {
  try {
    const def = GameInfo[table] && GameInfo[table].lookup(type);
    if (def && def.Name) return Locale.compose(def.Name);
  } catch (e) {}
  return prettifyType(type);
}

function readByTypeData(metric) {
  const objectMap = new Map;
  Game.Summary.getObjects().forEach(o => objectMap.set(o.ID, o));
  const validPlayers = new Set;
  for (const o of objectMap.values()) "Player" === o.type && validPlayers.add(o.ownerPlayer);
  let dps = [];
  try {
    dps = Game.Summary.getDataPoints();
  } catch (e) {}
  const rows = [], rawTypes = new Set;
  for (const dp of dps) {
    if (dp.ID !== metric.id || !dp.value || null == dp.value.numeric || null == dp.type) continue;
    const owner = null != dp.owner ? objectMap.get(dp.owner) : null, pid = owner ? owner.ownerPlayer : null;
    null != pid && validPlayers.has(pid) && (rows.push({
      pid: pid,
      type: dp.type,
      val: dp.value.numeric
    }), rawTypes.add(dp.type));
  }
  const canon = function(types, table) {
    const stripNum = id => {
      const tk = String(id).split("_");
      for (;tk.length > 1 && /^\d+$/.test(tk[tk.length - 1]); ) tk.pop();
      return tk.join("_");
    }, groups = new Map;
    for (const t of types) {
      const base = stripNum(t);
      groups.has(base) || groups.set(base, []), groups.get(base).push(t);
    }
    const out = new Map;
    for (const [base, group] of groups) {
      const canon = group.find(t => t === base) || group.slice().sort((a, b) => a.length - b.length)[0], canonName = resolveTypeName(table, canon);
      for (const t of group) out.set(t, resolveTypeName(table, t) === canonName ? canon : t);
    }
    return out;
  }([ ...rawTypes ], metric.lookup), perPlayer = new Map, playerTotal = new Map, typeTotal = new Map;
  for (const {pid: pid, type: type, val: val} of rows) {
    const t = canon.get(type) || type;
    let m = perPlayer.get(pid);
    m || (m = new Map, perPlayer.set(pid, m)), m.set(t, (m.get(t) || 0) + val), playerTotal.set(pid, (playerTotal.get(pid) || 0) + val), 
    typeTotal.set(t, (typeTotal.get(t) || 0) + val);
  }
  const players = [ ...perPlayer.keys() ].sort((a, b) => (playerTotal.get(b) || 0) - (playerTotal.get(a) || 0));
  return {
    perPlayer: perPlayer,
    players: players,
    typeTotal: typeTotal
  };
}

function buildBarChart(metric, page) {
  page = page || 0;
  const {perPlayer: perPlayer, players: players, typeTotal: typeTotal} = readByTypeData(metric), sorted = [ ...typeTotal.keys() ].sort((a, b) => (typeTotal.get(b) || 0) - (typeTotal.get(a) || 0)), shown = sorted.slice(12 * page, 12 * page + 12), nameMap = function(types, table) {
    const byName = new Map;
    for (const t of types) {
      const n = resolveTypeName(table, t);
      byName.has(n) || byName.set(n, []), byName.get(n).push(t);
    }
    const out = new Map;
    for (const [name, group] of byName) {
      if (1 === group.length) {
        out.set(group[0], name);
        continue;
      }
      const tokens = group.map(t => String(t).split("_"));
      let common = 0;
      for (;tokens.every(tk => null != tk[common] && tk[common] === tokens[0][common]); ) common++;
      group.forEach((t, i) => {
        const prefix = tokens[i].slice(common).join(" ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        out.set(t, prefix && prefix !== name ? `${prefix} ${name}` : name);
      });
    }
    return out;
  }(sorted, metric.lookup);
  return {
    labels: shown.map(t => nameMap.get(t)),
    datasets: players.map(pid => {
      const tally = perPlayer.get(pid), color = ownerColor({
        ownerPlayer: pid
      });
      return {
        label: ownerName({
          ownerPlayer: pid
        }),
        data: shown.map(t => tally.get(t) || 0),
        backgroundColor: color,
        borderColor: color
      };
    })
  };
}

const AXIS_TICK = "#C9BFA6";

function axisTitle(text) {
  return text ? {
    display: !0,
    text: text,
    color: AXIS_TICK
  } : {
    display: !1
  };
}

let activeChart = null;

function renderChart(ui, metric, page) {
  if ("board" === metric.kind) return activeChart && (activeChart.destroy(), activeChart = null), 
  setNote(ui, ""), ui.chartInner.style.display = "none", ui.board.style.display = "block", 
  void function(container, metric) {
    const {perPlayer: perPlayer, players: players} = readByTypeData(metric);
    if (container.textContent = "", !players.length) return container.textContent = `No data recorded for ${metric.label} this Age.`, 
    void (container.style.color = AXIS_TICK);
    const row = document.createElement("div");
    row.setAttribute("style", "display:flex;gap:14px;align-items:stretch;height:100%;padding-bottom:6px");
    for (const pid of players) {
      const col = document.createElement("div");
      col.setAttribute("style", "flex:0 0 auto;min-width:11rem;max-width:16rem;display:flex;flex-direction:column;border:1px solid #4A4034;background:rgba(255,255,255,0.02)");
      const head = document.createElement("div");
      head.textContent = ownerName({
        ownerPlayer: pid
      }), head.setAttribute("style", `padding:9px 12px;font-weight:700;border-bottom:1px solid #6B5842;background:${ownerColor({
        ownerPlayer: pid
      })};color:${ownerColorSecondary({
        ownerPlayer: pid
      })};text-shadow:0 1px 2px rgba(0,0,0,0.55)`), col.appendChild(head);
      const names = [ ...perPlayer.get(pid).keys() ].map(t => resolveTypeName(metric.lookup, t)).sort();
      for (const name of names) {
        const item = document.createElement("div");
        item.textContent = name, item.setAttribute("style", "padding:6px 12px;border-bottom:1px solid #2E281F;color:#E8E2D0;font-size:0.95rem"), 
        col.appendChild(item);
      }
      row.appendChild(col);
    }
    container.appendChild(row);
  }(ui.board, metric);
  if (ui.board.style.display = "none", ui.chartInner.style.display = "block", "undefined" == typeof Chart) return void console.error(`${LOG} Chart.js global not available.`);
  if (!ui.chartInner.clientWidth || !ui.chartInner.clientHeight) return void requestAnimationFrame(() => renderChart(ui, metric, page));
  activeChart && (activeChart.destroy(), activeChart = null);
  const plugins = {
    legend: {
      display: !0,
      labels: {
        color: "#E8E2D0"
      }
    },
    title: {
      display: !1
    }
  };
  let config;
  if ("bar" === metric.kind) {
    setNote(ui, "");
    const {labels: labels, datasets: datasets} = buildBarChart(metric, page), hasData = datasets.length > 0 && labels.length > 0;
    if (setNoData(ui.canvas, hasData ? "" : `No data recorded for ${metric.label} this Age.`), 
    !hasData) return;
    config = {
      type: "bar",
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        maintainAspectRatio: !1,
        animation: !1,
        color: "#E8E2D0",
        plugins: plugins,
        scales: {
          x: {
            type: "category",
            title: axisTitle(metric.xTitle),
            ticks: {
              color: AXIS_TICK
            },
            grid: {
              color: "#4A4034"
            }
          },
          y: {
            type: "linear",
            min: 0,
            title: axisTitle(metric.yTitle),
            ticks: {
              color: AXIS_TICK
            },
            grid: {
              color: "#4A4034"
            }
          }
        }
      }
    };
  } else {
    const logged = metric.loggerKey ? function(metric) {
      const key = metric.loggerKey, empty = {
        datasets: [],
        start: 0,
        end: 0,
        boundaries: [],
        turnCount: 0,
        startedLate: !1,
        firstAgeLabel: "",
        firstTurn: 0
      }, store = loadLoggerStore();
      if (!store || !store.ages || !key) return empty;
      const ages = Object.keys(store.ages).map(k => {
        const m = resolveAgeMeta(k, store.ages[k]);
        return {
          key: k,
          turns: store.ages[k].turns,
          ci: m.ci,
          label: m.label
        };
      }).sort((a, b) => a.ci - b.ci);
      let cursor = 0;
      const boundaries = [], layout = [], pids = new Set;
      for (const age of ages) {
        const turns = Object.keys(age.turns || {}).map(Number).sort((a, b) => a - b);
        if (!turns.length) continue;
        const minT = turns[0], maxT = turns[turns.length - 1];
        boundaries.push({
          x: cursor,
          label: prettifyType(age.label || age.key)
        }), layout.push({
          age: age,
          turns: turns,
          minT: minT,
          offset: cursor
        }), cursor += maxT - minT + 2;
        for (const t of turns) {
          const p = age.turns[t].p || {};
          for (const pid in p) pids.add(pid);
        }
      }
      const end = Math.max(0, cursor - 2);
      let turnCount = 0;
      for (const L of layout) for (const t of L.turns) {
        const p = L.age.turns[t].p || {};
        let has = !1;
        for (const pid in p) if (null != p[pid][key]) {
          has = !0;
          break;
        }
        has && turnCount++;
      }
      if (!turnCount) return empty;
      const datasets = [];
      for (const pid of pids) {
        const data = [];
        for (const L of layout) for (const t of L.turns) {
          const v = (L.age.turns[t].p || {})[pid];
          v && null != v[key] && data.push({
            x: L.offset + (t - L.minT),
            y: v[key]
          });
        }
        if (!data.length) continue;
        const color = ownerColor({
          ownerPlayer: Number(pid)
        });
        datasets.push({
          label: ownerName({
            ownerPlayer: Number(pid)
          }),
          data: data,
          parsing: !1,
          borderColor: color,
          backgroundColor: color,
          pointRadius: 0,
          stepped: !!metric.stepped,
          tension: metric.stepped ? 0 : .15
        });
      }
      const first = layout[0];
      return {
        datasets: datasets,
        start: 0,
        end: end,
        boundaries: boundaries,
        turnCount: turnCount,
        startedLate: !!first && ((first.age.ci || 0) > 0 || first.minT > 1),
        firstAgeLabel: first ? first.age.label || first.age.key : "",
        firstTurn: first ? first.minT : 0
      };
    }(metric) : null, loggedTurns = logged ? logged.turnCount : 0;
    let native = null, nativeTurns = 0;
    metric.loggerOnly || (native = metric.combine ? function(metric) {
      const objectMap = new Map;
      Game.Summary.getObjects().forEach(o => objectMap.set(o.ID, o));
      let start = 1 / 0, end = ageEndTurn();
      const perPlayer = new Map;
      for (const comp of metric.combine) {
        let dataSets = [];
        try {
          dataSets = Game.Summary.getDataSets(comp.id);
        } catch (e) {}
        for (const ds of dataSets) {
          const owner = null != ds.owner ? objectMap.get(ds.owner) : null;
          if (!owner || "Player" !== owner.type || !ds.values) continue;
          let arr = perPlayer.get(owner.ownerPlayer);
          arr || (arr = [], perPlayer.set(owner.ownerPlayer, arr));
          for (const pt of ds.values) arr.push({
            x: pt.x,
            d: comp.sign * pt.y
          });
        }
      }
      const datasets = [];
      for (const [pid, events] of perPlayer) {
        events.sort((a, b) => a.x - b.x);
        const v = [];
        let sum = 0;
        for (let i = 0; i < events.length; i++) sum += events[i].d, i + 1 !== events.length && events[i + 1].x === events[i].x || v.push({
          x: events[i].x,
          y: sum
        });
        if (!v.length) continue;
        start = Math.min(start, v[0].x), end = Math.max(end, v[v.length - 1].x), v[v.length - 1].x < end && v.push({
          x: end,
          y: v[v.length - 1].y
        });
        const color = ownerColor({
          ownerPlayer: pid
        });
        datasets.push({
          label: ownerName({
            ownerPlayer: pid
          }),
          data: v,
          parsing: !1,
          borderColor: color,
          backgroundColor: color,
          pointRadius: 0,
          stepped: !0,
          tension: 0
        });
      }
      return isFinite(start) || (start = 0), {
        datasets: datasets,
        start: start,
        end: end
      };
    }(metric) : metric.cityRollup ? function(metric) {
      const objectMap = new Map;
      Game.Summary.getObjects().forEach(o => objectMap.set(o.ID, o));
      const validPlayers = new Set;
      for (const o of objectMap.values()) "Player" === o.type && validPlayers.add(o.ownerPlayer);
      const perPlayerCities = new Map;
      let start = 1 / 0, end = ageEndTurn();
      for (const ds of Game.Summary.getDataSets(metric.id)) {
        const o = null != ds.owner ? objectMap.get(ds.owner) : null;
        if (!o || "City" !== o.type || null == o.ownerPlayer || !validPlayers.has(o.ownerPlayer)) continue;
        if (!ds.values || !ds.values.length) continue;
        const vals = ds.values.map(p => ({
          x: p.x,
          y: p.y
        }));
        start = Math.min(start, vals[0].x), end = Math.max(end, vals[vals.length - 1].x), 
        perPlayerCities.has(o.ownerPlayer) || perPlayerCities.set(o.ownerPlayer, []), perPlayerCities.get(o.ownerPlayer).push(vals);
      }
      isFinite(start) || (start = 0);
      const datasets = [];
      for (const [pid, cities] of perPlayerCities) {
        const pStart = cities.reduce((mn, c) => Math.min(mn, c[0].x), 1 / 0), idx = cities.map(() => 0), cur = cities.map(() => 0), data = [];
        for (let t = pStart; t <= end; t++) {
          let sum = 0;
          for (let c = 0; c < cities.length; c++) {
            const v = cities[c];
            for (;idx[c] < v.length && v[idx[c]].x <= t; ) cur[c] = v[idx[c]].y, idx[c]++;
            sum += cur[c];
          }
          data.push({
            x: t,
            y: sum
          });
        }
        const color = ownerColor({
          ownerPlayer: pid
        });
        datasets.push({
          label: ownerName({
            ownerPlayer: pid
          }),
          data: data,
          parsing: !1,
          borderColor: color,
          backgroundColor: color,
          pointRadius: 0,
          tension: .15
        });
      }
      return {
        datasets: datasets,
        start: start,
        end: end
      };
    }(metric) : function(metric) {
      const objectMap = new Map;
      Game.Summary.getObjects().forEach(o => objectMap.set(o.ID, o));
      const dataSets = Game.Summary.getDataSets(metric.id);
      let start = 1 / 0, end = ageEndTurn();
      const series = [];
      for (const ds of dataSets) {
        const owner = null != ds.owner ? objectMap.get(ds.owner) : null;
        if (!owner || "Player" !== owner.type) continue;
        let values = ds.values.map(pt => ({
          x: pt.x,
          y: pt.y
        }));
        if (metric.delta) {
          let sum = 0;
          values = values.map(pt => (sum += pt.y, {
            x: pt.x,
            y: sum
          }));
        }
        values.length && (start = Math.min(start, values[0].x), end = Math.max(end, values[values.length - 1].x)), 
        series.push({
          owner: owner,
          values: values
        });
      }
      isFinite(start) || (start = 0);
      const datasets = [];
      for (const s of series) {
        const v = s.values;
        if (!v.length) continue;
        v[v.length - 1].x < end && v.push({
          x: end,
          y: v[v.length - 1].y
        });
        const color = ownerColor(s.owner);
        datasets.push({
          label: ownerName(s.owner),
          data: v,
          parsing: !1,
          borderColor: color,
          backgroundColor: color,
          pointRadius: 0,
          stepped: !!metric.stepped,
          tension: metric.stepped ? 0 : .15
        });
      }
      return {
        datasets: datasets,
        start: start,
        end: end
      };
    }(metric), nativeTurns = native.datasets.reduce((mx, d) => Math.max(mx, d.data.length), 0));
    if (loggedTurns > 0 && loggedTurns >= nativeTurns) {
      const {datasets: datasets, start: start, end: end, boundaries: boundaries} = logged;
      setNoData(ui.canvas, ""), setNote(ui, logged.startedLate ? `Tracked since ${prettifyType(logged.firstAgeLabel)} turn ${logged.firstTurn} — Chronicle was enabled mid-game` : "");
      config = {
        type: "line",
        data: {
          datasets: datasets
        },
        options: {
          maintainAspectRatio: !1,
          animation: !1,
          color: "#E8E2D0",
          plugins: plugins,
          scales: {
            x: {
              type: "linear",
              min: start,
              max: end > start ? end : void 0,
              afterBuildTicks: axis => {
                axis.ticks = boundaries.map(b => ({
                  value: b.x
                }));
              },
              ticks: {
                color: AXIS_TICK,
                autoSkip: !1,
                maxRotation: 0,
                callback: v => {
                  const b = boundaries.find(bd => Math.abs(bd.x - v) < .5);
                  return b ? b.label : "";
                }
              },
              grid: {
                color: "#4A4034"
              }
            },
            y: {
              type: "linear",
              min: metric.signed ? void 0 : 0,
              title: axisTitle(metric.yTitle),
              ticks: {
                color: AXIS_TICK
              },
              grid: {
                color: "#4A4034"
              }
            }
          }
        }
      };
    } else {
      if (metric.loggerOnly) return setNote(ui, ""), void setNoData(ui.canvas, `No ${metric.label} recorded yet (tracked only while Chronicle is enabled).`);
      {
        const {datasets: datasets, start: start, end: end} = native, hasData = datasets.some(d => d.data.length > 0);
        if (setNoData(ui.canvas, hasData ? "" : `No data recorded for ${metric.label} this Age.`), 
        setNote(ui, hasData ? `Current Age only (${function() {
          try {
            return prettifyType(resolveAgeMeta(String(Game.age), null).label);
          } catch (e) {
            return "";
          }
        }()})` + (function() {
          try {
            const cur = resolveAgeMeta(String(Game.age), null).ci;
            let min = cur;
            for (const a of GameInfo.Ages) a.ChronologyIndex < min && (min = a.ChronologyIndex);
            return cur > min;
          } catch (e) {
            return !1;
          }
        }() ? " — enable Chronicle earlier for cross-Age history" : "") : ""), !hasData) return;
        config = {
          type: "line",
          data: {
            datasets: datasets
          },
          options: {
            maintainAspectRatio: !1,
            animation: !1,
            color: "#E8E2D0",
            plugins: plugins,
            scales: {
              x: {
                type: "linear",
                min: start,
                max: end > start ? end : void 0,
                title: axisTitle("Turn"),
                ticks: {
                  color: AXIS_TICK
                },
                grid: {
                  color: "#4A4034"
                }
              },
              y: {
                type: "linear",
                min: 0,
                title: axisTitle(metric.yTitle),
                ticks: {
                  color: AXIS_TICK
                },
                grid: {
                  color: "#4A4034"
                }
              }
            }
          }
        };
      }
    }
  }
  activeChart = new Chart(ui.canvas.getContext("2d"), config), requestAnimationFrame(() => {
    activeChart && activeChart.resize();
  });
}

function setNote(ui, text) {
  ui && ui.note && (ui.note.textContent = text || "");
}

function setNoData(canvas, msg) {
  const wrap = canvas.parentNode;
  if (!wrap) return;
  let el = wrap.querySelector(".ozq-nodata");
  el || (el = document.createElement("div"), el.className = "ozq-nodata", el.setAttribute("style", "position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#C9BFA6;font-size:1.2rem;pointer-events:none;text-align:center"), 
  wrap.appendChild(el)), el.textContent = msg || "", el.style.display = msg ? "flex" : "none", 
  canvas.style.display = msg ? "none" : "block";
}

function makeNativeButton(label, onClick, opts) {
  opts = opts || {};
  const button = document.createElement("div");
  opts.id && (button.id = opts.id);
  const sizing = opts.secondary ? "font-body text-sm tracking-100 px-4 py-1.5 " : "font-title text-base uppercase tracking-150 px-5 py-2 ";
  return button.className = "pointer-events-auto fxs-button relative flex items-center justify-center text-accent-1 text-shadow-subtle leading-none text-center cursor-pointer " + sizing + (opts.extraClass || ""), 
  button.setAttribute("data-name", "Button"), button.setAttribute("activatable", "true"), 
  button.setAttribute("data-audio-press-ref", "data-audio-primary-button-press"), 
  button.setAttribute("data-audio-focus-ref", "data-audio-primary-button-focus"), 
  button.innerHTML = '<div class="absolute inset-0"><div class="absolute inset-0 fxs-button__bg fxs-button__bg--base"></div><div class="absolute inset-0 opacity-0 fxs-button__bg fxs-button__bg--focus"></div><div class="absolute inset-0 opacity-0 fxs-button__bg fxs-button__bg--active"></div></div><div class="ozq-btn-label relative flex flex-auto items-center justify-center"></div>', 
  button.querySelector(".ozq-btn-label").textContent = label, button.addEventListener("click", onClick), 
  button;
}

function highlightButton(button, active) {
  const label = button.querySelector(".ozq-btn-label");
  label && (label.style.color = active ? "#FFD98A" : "#E8E2D0"), button.style.opacity = active ? "1" : "0.72";
}

function closeOverlay() {
  activeChart && (activeChart.destroy(), activeChart = null), document.getElementById(OVERLAY_ID)?.remove();
}

function openOverlay() {
  if (document.getElementById(OVERLAY_ID)) return;
  const root = document.createElement("div");
  root.id = OVERLAY_ID;
  const backdrop = document.createElement("div");
  backdrop.setAttribute("style", "position:fixed;left:0;top:0;width:100%;height:100%;z-index:999998;background:rgba(6,7,10,0.78);pointer-events:auto"), 
  backdrop.addEventListener("click", closeOverlay), root.appendChild(backdrop);
  const panel = document.createElement("div");
  panel.setAttribute("style", [ "position:fixed", "left:4%", "top:5%", "width:92%", "height:90%", "box-sizing:border-box", "z-index:999999", "pointer-events:auto", "background:#16130E", "border:2px solid #6B5842", "display:flex", "flex-direction:column", "padding:24px 28px" ].join(";")), 
  root.appendChild(panel);
  const header = document.createElement("div");
  header.setAttribute("style", "display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-shrink:0");
  const titleCol = document.createElement("div");
  titleCol.setAttribute("style", "display:flex;flex-direction:row;align-items:flex-end;gap:20px");
  const title = document.createElement("div");
  title.textContent = "Chronicle — Game Statistics", title.className = "font-title uppercase tracking-150", 
  title.setAttribute("style", "font-size:1.8rem;color:#F0E6D2"), titleCol.appendChild(title);
  const note = document.createElement("div");
  note.className = "font-body text-sm", note.setAttribute("style", "color:#B7A987;font-size:0.85rem;letter-spacing:0.04em;flex-shrink:0;padding-bottom:0.3rem"), 
  titleCol.appendChild(note), header.appendChild(titleCol), header.appendChild(makeNativeButton("Close", closeOverlay, {
    extraClass: ""
  })), panel.appendChild(header);
  const categoryBar = document.createElement("div");
  categoryBar.setAttribute("style", "display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;flex-shrink:0"), 
  panel.appendChild(categoryBar);
  const chartBar = document.createElement("div");
  chartBar.setAttribute("style", "display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;flex-shrink:0"), 
  panel.appendChild(chartBar);
  const chartWrap = document.createElement("div");
  chartWrap.setAttribute("style", "position:relative;flex:1 1 auto;width:100%;min-height:0;overflow:hidden");
  const chartInner = document.createElement("div");
  chartInner.setAttribute("style", "position:relative;width:100%;height:100%");
  const canvas = document.createElement("canvas");
  canvas.setAttribute("style", "display:block;width:100%;height:100%"), chartInner.appendChild(canvas), 
  chartWrap.appendChild(chartInner);
  const board = document.createElement("div");
  board.setAttribute("style", "position:relative;width:100%;height:100%;overflow:auto;display:none"), 
  chartWrap.appendChild(board), panel.appendChild(chartWrap);
  const pageBar = document.createElement("div");
  pageBar.setAttribute("style", "display:flex;gap:12px;align-items:center;justify-content:center;margin-top:10px;flex-shrink:0"), 
  panel.appendChild(pageBar);
  const datasetIds = function() {
    const objectMap = new Map;
    try {
      Game.Summary.getObjects().forEach(o => objectMap.set(o.ID, o));
    } catch (e) {}
    const withData = new Set;
    for (const id of ALL_DATASET_IDS) try {
      for (const ds of Game.Summary.getDataSets(id)) {
        const o = null != ds.owner ? objectMap.get(ds.owner) : null;
        if (o && "Player" === o.type && ds.values && ds.values.length) {
          withData.add(id);
          break;
        }
      }
    } catch (e) {}
    return withData;
  }(), dataPointIds = function() {
    const withData = new Set;
    let dps = [];
    try {
      dps = Game.Summary.getDataPoints();
    } catch (e) {}
    for (const dp of dps) dp.value && null != dp.value.numeric && withData.add(dp.ID);
    return withData;
  }(), cityIds = function(ids) {
    const objectMap = new Map;
    try {
      Game.Summary.getObjects().forEach(o => objectMap.set(o.ID, o));
    } catch (e) {}
    const withData = new Set;
    for (const id of ids) try {
      for (const ds of Game.Summary.getDataSets(id)) {
        const o = null != ds.owner ? objectMap.get(ds.owner) : null;
        if (o && "City" === o.type && ds.values && ds.values.length) {
          withData.add(id);
          break;
        }
      }
    } catch (e) {}
    return withData;
  }(METRICS.filter(m => m.cityRollup).map(m => m.id)), metrics = METRICS.filter(m => {
    if (m.loggerOnly) return loggerMetricHasData(m.loggerKey);
    if ("bar" === m.kind || "board" === m.kind) return dataPointIds.has(m.id);
    return (m.combine ? m.combine.some(c => datasetIds.has(c.id)) : m.cityRollup ? cityIds.has(m.id) : datasetIds.has(m.id)) || m.loggerKey && loggerMetricHasData(m.loggerKey);
  }), catList = CATEGORIES.filter(c => metrics.some(m => m.category === c)), ui = {
    canvas: canvas,
    chartInner: chartInner,
    board: board,
    note: note
  }, chartButtons = [];
  let curMetric = null, curPage = 0;
  const renderPage = () => {
    renderChart(ui, curMetric, curPage), pageBar.textContent = "";
    const pages = "bar" === curMetric.kind ? function(metric) {
      const {typeTotal: typeTotal} = readByTypeData(metric);
      return Math.max(1, Math.ceil(typeTotal.size / 12));
    }(curMetric) : 1;
    if (pages <= 1) return;
    const prev = makeNativeButton("‹ Prev", () => {
      curPage > 0 && (curPage--, renderPage());
    }, {
      secondary: !0
    }), next = makeNativeButton("Next ›", () => {
      curPage < pages - 1 && (curPage++, renderPage());
    }, {
      secondary: !0
    });
    0 === curPage && (prev.style.opacity = "0.4"), curPage === pages - 1 && (next.style.opacity = "0.4");
    const label = document.createElement("div");
    label.textContent = `Page ${curPage + 1} / ${pages}`, label.setAttribute("style", "color:#E8E2D0;font-size:0.9rem;min-width:6rem;text-align:center"), 
    pageBar.appendChild(prev), pageBar.appendChild(label), pageBar.appendChild(next);
  }, selectChart = (inCat, index) => {
    chartButtons.forEach((b, i) => highlightButton(b, i === index)), curMetric = inCat[index], 
    curPage = 0, renderPage();
  }, selectCategory = (catIndex, preferId) => {
    [ ...categoryBar.children ].forEach((b, i) => highlightButton(b, i === catIndex)), 
    chartBar.textContent = "", chartButtons.length = 0;
    const inCat = metrics.filter(m => m.category === catList[catIndex]);
    if (inCat.forEach((metric, i) => {
      const b = makeNativeButton(metric.label, () => selectChart(inCat, i), {
        secondary: !0
      });
      chartButtons.push(b), chartBar.appendChild(b);
    }), inCat.length) {
      const idx = preferId ? Math.max(0, inCat.findIndex(m => m.id === preferId)) : 0;
      selectChart(inCat, idx);
    }
  };
  catList.forEach((cat, i) => {
    categoryBar.appendChild(makeNativeButton(cat, () => selectCategory(i), {}));
  }), document.body.appendChild(root);
  const def = metrics.find(m => m.default) || metrics[0], defCat = def ? Math.max(0, catList.indexOf(def.category)) : 0;
  catList.length && requestAnimationFrame(() => selectCategory(defCat, def && def.id));
}

function injectButton(screen) {
  let tries = 0;
  const attempt = () => {
    if (screen.querySelector("#ozq-chronicle-graphs-button")) return;
    const row = screen.querySelector(".bottom-10.right-10");
    if (!row) return void (tries++ < 180 && requestAnimationFrame(attempt));
    const button = makeNativeButton("Chronicle", openOverlay, {
      id: "ozq-chronicle-graphs-button",
      extraClass: "mr-8"
    });
    row.insertBefore(button, row.firstChild);
  };
  requestAnimationFrame(attempt);
}

function injectPauseMenuButton(container) {
  if (container.querySelector("#ozq-chronicle-pause-button")) return;
  const button = makeNativeButton("Chronicle", openOverlay, {
    id: "ozq-chronicle-pause-button",
    extraClass: "pause-menu-button mt-4"
  }), resume = container.querySelector("#pause-menu-resume-button");
  resume && resume.nextSibling ? container.insertBefore(button, resume.nextSibling) : container.insertBefore(button, container.firstChild);
}

function isResultsScreen(el) {
  return el instanceof HTMLElement && "string" == typeof el.localName && "screen-victory-progress" === el.localName.toLowerCase();
}

function inspectNode(node) {
  if (!(node instanceof HTMLElement)) return;
  if (isResultsScreen(node)) injectButton(node); else if (node.querySelectorAll) for (const el of node.querySelectorAll("*")) if (isResultsScreen(el)) {
    injectButton(el);
    break;
  }
  const pause = function(node) {
    return node instanceof HTMLElement ? "pause-menu-button-container" === node.id ? node : node.querySelector ? node.querySelector("#pause-menu-button-container") : null : null;
  }(node);
  pause && injectPauseMenuButton(pause);
}

function install() {
  const existing = document.querySelector("screen-victory-progress");
  existing && injectButton(existing);
  const existingPause = document.getElementById("pause-menu-button-container");
  existingPause && injectPauseMenuButton(existingPause);
  new MutationObserver(mutations => {
    for (const mutation of mutations) for (const added of mutation.addedNodes) inspectNode(added);
  }).observe(document.body, {
    childList: !0,
    subtree: !0
  }), console.error(`${LOG} loaded.`);
}

!function scheduleInstall() {
  document.body ? install() : "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", install, {
    once: !0
  }) : requestAnimationFrame(scheduleInstall);
}();

export { };