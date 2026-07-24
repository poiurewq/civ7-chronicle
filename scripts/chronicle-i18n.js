!function(root) {
  const EN = {
    LOC_CHRONICLE_CAT_Research: "Research",
    LOC_CHRONICLE_CAT_Economy: "Economy",
    LOC_CHRONICLE_CAT_Society: "Society",
    LOC_CHRONICLE_CAT_Expansion: "Expansion",
    LOC_CHRONICLE_CAT_Military: "Military",
    LOC_CHRONICLE_CAT_Overall: "Overall",
    LOC_CHRONICLE_CAT_World: "World",
    LOC_CHRONICLE_TITLE: "Chronicle — Game Statistics",
    LOC_CHRONICLE_BUTTON: "Chronicle",
    LOC_CHRONICLE_TRENDS: "Trends",
    LOC_CHRONICLE_STANDINGS: "Standings",
    LOC_CHRONICLE_PREV: "‹ Prev",
    LOC_CHRONICLE_NEXT: "Next ›",
    LOC_CHRONICLE_PAGE: "Page {1} / {2}",
    LOC_CHRONICLE_EMPTY_STATS: "No stats yet. Chronicle starts logging when enabled.",
    LOC_CHRONICLE_SOURCE_NATIVE: "Game log",
    LOC_CHRONICLE_SOURCE_LOGGER: "Chronicle log",
    LOC_CHRONICLE_CURRENT_STANDINGS: "Current standings",
    LOC_CHRONICLE_NOTE_STOCK: "Current standings · Owned stock",
    LOC_CHRONICLE_NOTE_EVENT: "Chronicle log · Whole game",
    LOC_CHRONICLE_NOTE_BANKED: "Chronicle log · Current standings",
    LOC_CHRONICLE_LEGEND_HINT: "Click a civ in the legend to toggle it",
    LOC_CHRONICLE_NO_DATA_RECORDED: "No data recorded for {1}.",
    LOC_CHRONICLE_NO_DATA_AVAILABLE: "No data available for {1}.",
    LOC_CHRONICLE_NO_RECORDED_YET: "No {1} recorded yet (tracked only while Chronicle is enabled).",
    LOC_CHRONICLE_NO_TO_SHOW: "No {1} to show.",
    LOC_CHRONICLE_TRACKED_SINCE: "Tracked since {1} turn {2}",
    LOC_CHRONICLE_AGE_ONLY: "{1} only",
    LOC_CHRONICLE_RELIGION: "Religion",
    LOC_CHRONICLE_SETTLEMENT: "Settlement",
    LOC_CHRONICLE_UNKNOWN: "Unknown",
    LOC_CHRONICLE_PLAYER: "Player {1}",
    LOC_CHRONICLE_AGE_TURN: "{1} turn {2}",
    LOC_CHRONICLE_TURN: "Turn {1}",
    LOC_CHRONICLE_VALUE_SEP: "{1}: {2}",
    LOC_GENERIC_CLOSE: "Close",
    LOC_GENERIC_BACK: "Back",
    LOC_HOF_TITLE: "Hall of Fame",
    LOC_HOF_OVERVIEW: "Overview",
    LOC_HOF_HIGHLIGHTS: "Highlights",
    LOC_HOF_HISTORY: "History",
    LOC_HOF_REPORTS: "Reports",
    LOC_HOF_VICTORY: "Victory",
    LOC_HOF_DEFEAT: "Defeat",
    LOC_HOF_NOBODY_WON: "Nobody Won",
    LOC_HOF_VIEWDETAILS: "Game Details",
    LOC_HOF_UNKNOWN: "Unknown",
    LOC_PROFILE_TAB_LEADERS: "Leaders",
    LOC_PROFILE_TAB_CIVILIZATIONS: "Civilizations",
    LOC_CHRONICLE_HOF_IN_PROGRESS: "In progress",
    LOC_CHRONICLE_HOF_EMPTY_CAMPAIGNS: "No campaigns tracked yet.",
    LOC_CHRONICLE_HOF_EMPTY_CAMPAIGNS_HINT: "Play with Chronicle enabled and your games will appear here.",
    LOC_CHRONICLE_HOF_CAMPAIGNS: "Campaigns",
    LOC_CHRONICLE_HOF_RECORD: "Record",
    LOC_CHRONICLE_HOF_TURNS_LOGGED: "Turns logged",
    LOC_CHRONICLE_HOF_FINISHED: "{1} finished",
    LOC_CHRONICLE_HOF_IN_PROGRESS_SUB: "in progress",
    LOC_CHRONICLE_HOF_WIN_RATE: "{1}% win rate",
    LOC_CHRONICLE_HOF_NO_FINISHED: "no finished games yet",
    LOC_CHRONICLE_HOF_ACROSS_CAMPAIGNS: "across all campaigns",
    LOC_CHRONICLE_HOF_VICTORIES_BY_PATH: "Victories by type",
    LOC_CHRONICLE_HOF_HIGH_SCORE: "High score",
    LOC_CHRONICLE_HOF_FASTEST_VICTORY: "Fastest victory",
    LOC_CHRONICLE_HOF_BIGGEST_EMPIRE: "Biggest empire",
    LOC_CHRONICLE_HOF_MOST_KILLS: "Most units killed",
    LOC_CHRONICLE_HOF_N_SETTLEMENTS: "{1} settlements",
    LOC_CHRONICLE_HOF_NO_RECORDS: "No records yet. Finish a game with Chronicle enabled.",
    LOC_CHRONICLE_HOF_NO_LEADERS: "No leader data yet.",
    LOC_CHRONICLE_HOF_NO_CIVS: "No civilization data yet.",
    LOC_CHRONICLE_HOF_NO_GAMES: "No games recorded yet.",
    LOC_CHRONICLE_HOF_NO_SCORES: "No scores recorded yet (needs Chronicle 0.29.7+).",
    LOC_CHRONICLE_HOF_NO_VICTORIES: "No victories recorded yet (needs Chronicle 0.29.7+ finish capture).",
    LOC_CHRONICLE_HOF_SCORE_N: "Score {1}",
    LOC_CHRONICLE_HOF_CHART_UNAVAILABLE: "Chart.js not available.",
    LOC_CHRONICLE_HOF_NO_METRIC_DATA: "No {1} data for this game.",
    LOC_CHRONICLE_HOF_LOG_METRIC: "Chronicle log  ·  {1}",
    LOC_CHRONICLE_HOF_CHART_LOAD_FAIL: "Could not load Chart.js: {1}",
    LOC_CHRONICLE_HOF_N_CAMPAIGNS: "{1} campaigns",
    LOC_CHRONICLE_HOF_ONE_CAMPAIGN: "1 campaign",
    LOC_CHRONICLE_HOF_CAMPAIGNS_CAPTION: "Chronicle campaigns",
    LOC_CHRONICLE_HOF_PLAYED_ONE: "Played 1 game",
    LOC_CHRONICLE_HOF_PLAYED_N: "Played {1} games",
    LOC_CHRONICLE_HOF_WON_OUT_OF: "Won {1} out of {2}",
    LOC_CHRONICLE_HOF_BEST_SCORE: "Best score {1}",
    LOC_CHRONICLE_HOF_PCT_FINISHED: "{1}% of finished games",
    LOC_CHRONICLE_HOF_PTS: "{1} pts",
    LOC_CHRONICLE_HOF_N_TURNS: "{1} turns",
    LOC_CHRONICLE_HOF_SPEED: "{1} turns · {2}"
  }, ZH_HANS = {
    LOC_CHRONICLE_CAT_Research: "研究",
    LOC_CHRONICLE_CAT_Economy: "经济",
    LOC_CHRONICLE_CAT_Society: "社会",
    LOC_CHRONICLE_CAT_Expansion: "扩张",
    LOC_CHRONICLE_CAT_Military: "军事",
    LOC_CHRONICLE_CAT_Overall: "总览",
    LOC_CHRONICLE_CAT_World: "世界",
    LOC_CHRONICLE_TITLE: "编年史 — 游戏统计",
    LOC_CHRONICLE_BUTTON: "编年史",
    LOC_CHRONICLE_TRENDS: "趋势",
    LOC_CHRONICLE_STANDINGS: "排名",
    LOC_CHRONICLE_PREV: "‹ 上一页",
    LOC_CHRONICLE_NEXT: "下一页 ›",
    LOC_CHRONICLE_PAGE: "第 {1} / {2} 页",
    LOC_CHRONICLE_EMPTY_STATS: "尚无统计。启用编年史后开始记录。",
    LOC_CHRONICLE_SOURCE_NATIVE: "游戏记录",
    LOC_CHRONICLE_SOURCE_LOGGER: "编年史记录",
    LOC_CHRONICLE_CURRENT_STANDINGS: "当前排名",
    LOC_CHRONICLE_NOTE_STOCK: "当前排名 · 现有数量",
    LOC_CHRONICLE_NOTE_EVENT: "编年史记录 · 全局累计",
    LOC_CHRONICLE_NOTE_BANKED: "编年史记录 · 当前排名",
    LOC_CHRONICLE_LEGEND_HINT: "点击图例切换文明显示",
    LOC_CHRONICLE_NO_DATA_RECORDED: "尚无{1}的记录。",
    LOC_CHRONICLE_NO_DATA_AVAILABLE: "暂无{1}的数据。",
    LOC_CHRONICLE_NO_RECORDED_YET: "尚未记录{1}（仅在启用编年史时追踪）。",
    LOC_CHRONICLE_NO_TO_SHOW: "没有可显示的{1}。",
    LOC_CHRONICLE_TRACKED_SINCE: "自{1}第{2}回合起记录",
    LOC_CHRONICLE_AGE_ONLY: "仅{1}",
    LOC_CHRONICLE_RELIGION: "宗教",
    LOC_CHRONICLE_SETTLEMENT: "定居点",
    LOC_CHRONICLE_UNKNOWN: "未知",
    LOC_CHRONICLE_PLAYER: "玩家 {1}",
    LOC_CHRONICLE_AGE_TURN: "{1} 第 {2} 回合",
    LOC_CHRONICLE_TURN: "第 {1} 回合",
    LOC_CHRONICLE_VALUE_SEP: "{1}：{2}",
    LOC_GENERIC_CLOSE: "关闭",
    LOC_GENERIC_BACK: "返回",
    LOC_HOF_TITLE: "名人堂",
    LOC_HOF_OVERVIEW: "总览",
    LOC_HOF_HIGHLIGHTS: "高光",
    LOC_HOF_HISTORY: "历史",
    LOC_HOF_REPORTS: "报告",
    LOC_HOF_VICTORY: "胜利",
    LOC_HOF_DEFEAT: "失败",
    LOC_HOF_NOBODY_WON: "无人获胜",
    LOC_HOF_VIEWDETAILS: "对局详情",
    LOC_HOF_UNKNOWN: "未知",
    LOC_PROFILE_TAB_LEADERS: "领袖",
    LOC_PROFILE_TAB_CIVILIZATIONS: "文明",
    LOC_CHRONICLE_HOF_IN_PROGRESS: "进行中",
    LOC_CHRONICLE_HOF_EMPTY_CAMPAIGNS: "尚无已记载的对局。",
    LOC_CHRONICLE_HOF_EMPTY_CAMPAIGNS_HINT: "启用编年史后的游戏记录会出现在这里。",
    LOC_CHRONICLE_HOF_CAMPAIGNS: "对局",
    LOC_CHRONICLE_HOF_RECORD: "战绩",
    LOC_CHRONICLE_HOF_TURNS_LOGGED: "已记录回合",
    LOC_CHRONICLE_HOF_FINISHED: "已完成 {1} 场",
    LOC_CHRONICLE_HOF_IN_PROGRESS_SUB: "进行中",
    LOC_CHRONICLE_HOF_WIN_RATE: "胜率 {1}%",
    LOC_CHRONICLE_HOF_NO_FINISHED: "尚无已完成对局",
    LOC_CHRONICLE_HOF_ACROSS_CAMPAIGNS: "跨全部对局",
    LOC_CHRONICLE_HOF_VICTORIES_BY_PATH: "胜利类型",
    LOC_CHRONICLE_HOF_HIGH_SCORE: "最高分",
    LOC_CHRONICLE_HOF_FASTEST_VICTORY: "最快胜利",
    LOC_CHRONICLE_HOF_BIGGEST_EMPIRE: "最大帝国",
    LOC_CHRONICLE_HOF_MOST_KILLS: "最多击杀",
    LOC_CHRONICLE_HOF_N_SETTLEMENTS: "{1} 个定居点",
    LOC_CHRONICLE_HOF_NO_RECORDS: "尚无纪录。启用编年史完成一局后会出现在这里。",
    LOC_CHRONICLE_HOF_NO_LEADERS: "尚无领袖数据。",
    LOC_CHRONICLE_HOF_NO_CIVS: "尚无文明数据。",
    LOC_CHRONICLE_HOF_NO_GAMES: "尚无已记录对局。",
    LOC_CHRONICLE_HOF_NO_SCORES: "尚无分数记录（需编年史 0.29.7+）。",
    LOC_CHRONICLE_HOF_NO_VICTORIES: "尚无胜利记录（需编年史 0.29.7+ 完赛记录）。",
    LOC_CHRONICLE_HOF_SCORE_N: "分数 {1}",
    LOC_CHRONICLE_HOF_CHART_UNAVAILABLE: "Chart.js 不可用。",
    LOC_CHRONICLE_HOF_NO_METRIC_DATA: "本局没有{1}数据。",
    LOC_CHRONICLE_HOF_LOG_METRIC: "编年史记录  ·  {1}",
    LOC_CHRONICLE_HOF_CHART_LOAD_FAIL: "无法加载 Chart.js：{1}",
    LOC_CHRONICLE_HOF_N_CAMPAIGNS: "{1} 场对局",
    LOC_CHRONICLE_HOF_ONE_CAMPAIGN: "1 场对局",
    LOC_CHRONICLE_HOF_CAMPAIGNS_CAPTION: "编年史对局",
    LOC_CHRONICLE_HOF_PLAYED_ONE: "玩过 1 场",
    LOC_CHRONICLE_HOF_PLAYED_N: "玩过 {1} 场",
    LOC_CHRONICLE_HOF_WON_OUT_OF: "在 {2} 场中获胜 {1} 场",
    LOC_CHRONICLE_HOF_BEST_SCORE: "最高分 {1}",
    LOC_CHRONICLE_HOF_PCT_FINISHED: "胜率 {1}%",
    LOC_CHRONICLE_HOF_PTS: "{1} 分",
    LOC_CHRONICLE_HOF_N_TURNS: "{1} 回合",
    LOC_CHRONICLE_HOF_SPEED: "{1} 回合 · {2}"
  }, ZH_HANT = {
    LOC_CHRONICLE_CAT_Research: "研究",
    LOC_CHRONICLE_CAT_Economy: "經濟",
    LOC_CHRONICLE_CAT_Society: "社會",
    LOC_CHRONICLE_CAT_Expansion: "擴張",
    LOC_CHRONICLE_CAT_Military: "軍事",
    LOC_CHRONICLE_CAT_Overall: "總覽",
    LOC_CHRONICLE_CAT_World: "世界",
    LOC_CHRONICLE_TITLE: "編年史 — 遊戲統計",
    LOC_CHRONICLE_BUTTON: "編年史",
    LOC_CHRONICLE_TRENDS: "趨勢",
    LOC_CHRONICLE_STANDINGS: "排名",
    LOC_CHRONICLE_PREV: "‹ 上一頁",
    LOC_CHRONICLE_NEXT: "下一頁 ›",
    LOC_CHRONICLE_PAGE: "第 {1} / {2} 頁",
    LOC_CHRONICLE_EMPTY_STATS: "尚無統計。啟用編年史後開始記錄。",
    LOC_CHRONICLE_SOURCE_NATIVE: "遊戲記錄",
    LOC_CHRONICLE_SOURCE_LOGGER: "編年史記錄",
    LOC_CHRONICLE_CURRENT_STANDINGS: "目前排名",
    LOC_CHRONICLE_NOTE_STOCK: "目前排名 · 現有數量",
    LOC_CHRONICLE_NOTE_EVENT: "編年史記錄 · 全局累計",
    LOC_CHRONICLE_NOTE_BANKED: "編年史記錄 · 目前排名",
    LOC_CHRONICLE_LEGEND_HINT: "點擊圖例切換文明顯示",
    LOC_CHRONICLE_NO_DATA_RECORDED: "尚無{1}的記錄。",
    LOC_CHRONICLE_NO_DATA_AVAILABLE: "暫無{1}的資料。",
    LOC_CHRONICLE_NO_RECORDED_YET: "尚未記錄{1}（僅在啟用編年史時追蹤）。",
    LOC_CHRONICLE_NO_TO_SHOW: "沒有可顯示的{1}。",
    LOC_CHRONICLE_TRACKED_SINCE: "自{1}第{2}回合起記錄",
    LOC_CHRONICLE_AGE_ONLY: "僅{1}",
    LOC_CHRONICLE_RELIGION: "宗教",
    LOC_CHRONICLE_SETTLEMENT: "聚落",
    LOC_CHRONICLE_UNKNOWN: "未知",
    LOC_CHRONICLE_PLAYER: "玩家 {1}",
    LOC_CHRONICLE_AGE_TURN: "{1} 第 {2} 回合",
    LOC_CHRONICLE_TURN: "第 {1} 回合",
    LOC_CHRONICLE_VALUE_SEP: "{1}：{2}",
    LOC_GENERIC_CLOSE: "關閉",
    LOC_GENERIC_BACK: "返回",
    LOC_HOF_TITLE: "名人堂",
    LOC_HOF_OVERVIEW: "概述",
    LOC_HOF_HIGHLIGHTS: "重大時刻",
    LOC_HOF_HISTORY: "紀錄",
    LOC_HOF_REPORTS: "報告",
    LOC_HOF_VICTORY: "勝利",
    LOC_HOF_DEFEAT: "落敗",
    LOC_HOF_NOBODY_WON: "無人獲勝",
    LOC_HOF_VIEWDETAILS: "遊戲詳情",
    LOC_HOF_UNKNOWN: "未知",
    LOC_PROFILE_TAB_LEADERS: "領袖",
    LOC_PROFILE_TAB_CIVILIZATIONS: "文明",
    LOC_CHRONICLE_HOF_IN_PROGRESS: "進行中",
    LOC_CHRONICLE_HOF_EMPTY_CAMPAIGNS: "尚無已記載的對局。",
    LOC_CHRONICLE_HOF_EMPTY_CAMPAIGNS_HINT: "啟用編年史後的遊戲記錄會出現在這裡。",
    LOC_CHRONICLE_HOF_CAMPAIGNS: "對局",
    LOC_CHRONICLE_HOF_RECORD: "戰績",
    LOC_CHRONICLE_HOF_TURNS_LOGGED: "已記錄回合",
    LOC_CHRONICLE_HOF_FINISHED: "已完成 {1} 場",
    LOC_CHRONICLE_HOF_IN_PROGRESS_SUB: "進行中",
    LOC_CHRONICLE_HOF_WIN_RATE: "勝率 {1}%",
    LOC_CHRONICLE_HOF_NO_FINISHED: "尚無已完成對局",
    LOC_CHRONICLE_HOF_ACROSS_CAMPAIGNS: "跨全部對局",
    LOC_CHRONICLE_HOF_VICTORIES_BY_PATH: "勝利類型",
    LOC_CHRONICLE_HOF_HIGH_SCORE: "最高分",
    LOC_CHRONICLE_HOF_FASTEST_VICTORY: "最快勝利",
    LOC_CHRONICLE_HOF_BIGGEST_EMPIRE: "最大帝國",
    LOC_CHRONICLE_HOF_MOST_KILLS: "最多擊殺",
    LOC_CHRONICLE_HOF_N_SETTLEMENTS: "{1} 個聚落",
    LOC_CHRONICLE_HOF_NO_RECORDS: "尚無紀錄。啟用編年史完成一局後會出現在這裡。",
    LOC_CHRONICLE_HOF_NO_LEADERS: "尚無領袖資料。",
    LOC_CHRONICLE_HOF_NO_CIVS: "尚無文明資料。",
    LOC_CHRONICLE_HOF_NO_GAMES: "尚無已記錄對局。",
    LOC_CHRONICLE_HOF_NO_SCORES: "尚無分數記錄（需編年史 0.29.7+）。",
    LOC_CHRONICLE_HOF_NO_VICTORIES: "尚無勝利記錄（需編年史 0.29.7+ 完賽記錄）。",
    LOC_CHRONICLE_HOF_SCORE_N: "分數 {1}",
    LOC_CHRONICLE_HOF_CHART_UNAVAILABLE: "Chart.js 不可用。",
    LOC_CHRONICLE_HOF_NO_METRIC_DATA: "本局沒有{1}資料。",
    LOC_CHRONICLE_HOF_LOG_METRIC: "編年史記錄  ·  {1}",
    LOC_CHRONICLE_HOF_CHART_LOAD_FAIL: "無法載入 Chart.js：{1}",
    LOC_CHRONICLE_HOF_N_CAMPAIGNS: "{1} 場對局",
    LOC_CHRONICLE_HOF_ONE_CAMPAIGN: "1 場對局",
    LOC_CHRONICLE_HOF_CAMPAIGNS_CAPTION: "編年史對局",
    LOC_CHRONICLE_HOF_PLAYED_ONE: "玩過 1 場",
    LOC_CHRONICLE_HOF_PLAYED_N: "玩過 {1} 場",
    LOC_CHRONICLE_HOF_WON_OUT_OF: "在 {2} 場中獲勝 {1} 場",
    LOC_CHRONICLE_HOF_BEST_SCORE: "最高分 {1}",
    LOC_CHRONICLE_HOF_PCT_FINISHED: "勝率 {1}%",
    LOC_CHRONICLE_HOF_PTS: "{1} 分",
    LOC_CHRONICLE_HOF_N_TURNS: "{1} 回合",
    LOC_CHRONICLE_HOF_SPEED: "{1} 回合 · {2}"
  }, METRICS = {
    score: {
      en: "Score",
      zh: "分数",
      zhHant: "分數"
    },
    vCul: {
      en: "Cultural",
      zh: "文化",
      zhHant: "文化"
    },
    vEco: {
      en: "Economic",
      zh: "经济",
      zhHant: "經濟"
    },
    vMil: {
      en: "Military",
      zh: "军事",
      zhHant: "軍事"
    },
    vSci: {
      en: "Scientific",
      zh: "科学",
      zhHant: "科學"
    },
    Science: {
      en: "Science / Turn",
      zh: "科技值/回合",
      zhHant: "科技值/回合"
    },
    Culture: {
      en: "Culture / Turn",
      zh: "文化值/回合",
      zhHant: "文化值/回合"
    },
    TechsAcquired: {
      en: "Technologies",
      zh: "科技",
      zhHant: "科技"
    },
    CivicsAcquired: {
      en: "Civics",
      zh: "市政",
      zhHant: "市政"
    },
    ratioSciPerCitizen: {
      en: "Science / Citizen",
      zh: "科技值/人口",
      zhHant: "科技值/人口"
    },
    ratioCulPerCitizen: {
      en: "Culture / Citizen",
      zh: "文化值/人口",
      zhHant: "文化值/人口"
    },
    trendGreatWorks: {
      en: "Great Works",
      zh: "巨作",
      zhHant: "巨作"
    },
    goldNet: {
      en: "Gold / Turn",
      zh: "金币/回合",
      zhHant: "金幣/回合"
    },
    ratioGoldPerCitizen: {
      en: "Gold / Citizen",
      zh: "金币/人口",
      zhHant: "金幣/人口"
    },
    Gold: {
      en: "Treasury",
      zh: "国库",
      zhHant: "國庫"
    },
    trendTrade: {
      en: "Trade Routes",
      zh: "贸易路线",
      zhHant: "貿易路線"
    },
    Production: {
      en: "Production / Turn",
      zh: "生产力/回合",
      zhHant: "生產力/回合"
    },
    trendBuildings: {
      en: "Buildings",
      zh: "建筑",
      zhHant: "建築",
      y: {
        en: "Buildings owned",
        zh: "拥有的建筑",
        zhHant: "擁有的建築"
      },
      ySummary: {
        en: "Buildings built",
        zh: "建成的建筑",
        zhHant: "建成的建築"
      }
    },
    trendImprovements: {
      en: "Improvements",
      zh: "改良设施",
      zhHant: "改良設施"
    },
    trendOverbuilds: {
      en: "Overbuilds",
      zh: "加建",
      zhHant: "翻新增建"
    },
    WondersConstructed: {
      en: "Wonders",
      zh: "奇观",
      zhHant: "奇觀",
      y: {
        en: "Wonders owned",
        zh: "拥有的奇观",
        zhHant: "擁有的奇觀"
      },
      ySummary: {
        en: "Wonders built",
        zh: "建成的奇观",
        zhHant: "建成的奇觀"
      }
    },
    gp: {
      en: "Great People",
      zh: "伟人",
      zhHant: "偉人"
    },
    Population: {
      en: "Population",
      zh: "人口",
      zhHant: "人口"
    },
    Food: {
      en: "Food / Turn",
      zh: "食物/回合",
      zhHant: "食物/回合"
    },
    hap: {
      en: "Happiness / Turn",
      zh: "幸福值/回合",
      zhHant: "幸福感/回合"
    },
    inf: {
      en: "Influence / Turn",
      zh: "影响力/回合",
      zhHant: "影響力/回合"
    },
    trendUrban: {
      en: "Urban Districts",
      zh: "市区区块",
      zhHant: "都會區域"
    },
    ratioUrban: {
      en: "Urbanization %",
      zh: "市区人口 %",
      zhHant: "市區人口 %"
    },
    tour: {
      en: "Tourism",
      zh: "观光值",
      zhHant: "觀光值"
    },
    CitiesTotal: {
      en: "Settlements Total",
      zh: "定居点总数",
      zhHant: "聚落總數",
      y: {
        en: "Settlements owned",
        zh: "拥有的定居点",
        zhHant: "擁有的聚落"
      },
      ySummary: {
        en: "Settlements founded",
        zh: "建立的定居点",
        zhHant: "建立的聚落"
      }
    },
    trendCities: {
      en: "Cities",
      zh: "城市",
      zhHant: "城市"
    },
    trendTowns: {
      en: "Towns",
      zh: "城镇",
      zhHant: "城鎮"
    },
    trendSettlementsLost: {
      en: "Settlements Lost",
      zh: "失去的定居点",
      zhHant: "失去的聚落"
    },
    trendSettlementCap: {
      en: "Settlement Cap",
      zh: "定居点上限",
      zhHant: "聚落上限"
    },
    ratioSettlementCap: {
      en: "Settlement Cap %",
      zh: "定居点上限 %",
      zhHant: "聚落上限 %"
    },
    uKill: {
      en: "Units Killed",
      zh: "击杀单位",
      zhHant: "擊殺單位"
    },
    uLost: {
      en: "Units Lost",
      zh: "损失单位",
      zhHant: "損失單位"
    },
    UnitsOwnedByType: {
      en: "Units Owned",
      zh: "现有兵种",
      zhHant: "現有兵種",
      y: {
        en: "Number owned",
        zh: "拥有数量",
        zhHant: "擁有數量"
      }
    },
    UnitsKilledByType: {
      en: "Kills by Unit",
      zh: "击杀兵种",
      zhHant: "擊殺兵種",
      y: {
        en: "Kills by that unit type",
        zh: "该兵种击杀数",
        zhHant: "該兵種擊殺數"
      }
    },
    UnitsLostByType: {
      en: "Losses by Unit",
      zh: "损失兵种",
      zhHant: "損失兵種",
      y: {
        en: "Number lost",
        zh: "损失数量",
        zhHant: "損失數量"
      }
    },
    CitiesConquered: {
      en: "Settlements Conquered",
      zh: "征服的定居点",
      zhHant: "征服的聚落"
    },
    ratioConquest: {
      en: "Conquest %",
      zh: "征服 %",
      zhHant: "征服 %",
      y: {
        en: "% of settlements conquered",
        zh: "征服定居点占比",
        zhHant: "征服聚落佔比"
      }
    },
    trendRazed: {
      en: "Settlements Razed",
      zh: "夷平的定居点",
      zhHant: "夷平的聚落"
    },
    trendIndDisp: {
      en: "IPs Dispersed",
      zh: "驱散独立势力",
      zhHant: "驅散獨立軍勢力"
    },
    BuildingsOwnedByType: {
      en: "Buildings",
      zh: "建筑",
      zhHant: "建築",
      y: {
        en: "Number owned",
        zh: "拥有数量",
        zhHant: "擁有數量"
      }
    },
    ImprovementsOwnedByType: {
      en: "Improvements",
      zh: "改良设施",
      zhHant: "改良設施",
      y: {
        en: "Number owned",
        zh: "拥有数量",
        zhHant: "擁有數量"
      }
    },
    DistrictsOwnedByType: {
      en: "Districts",
      zh: "区块",
      zhHant: "區域",
      y: {
        en: "Number owned",
        zh: "拥有数量",
        zhHant: "擁有數量"
      }
    },
    WondersOwnedByType: {
      en: "Wonders",
      zh: "奇观",
      zhHant: "奇觀"
    },
    liveLargestCities: {
      en: "Largest Settlements",
      zh: "最大定居点",
      zhHant: "最大聚落"
    },
    liveMostUrbanized: {
      en: "Most Urbanized",
      zh: "市区占比最高",
      zhHant: "市區佔比最高"
    },
    liveSizeDist: {
      en: "Settlement Sizes",
      zh: "定居点规模",
      zhHant: "聚落規模"
    },
    popShare: {
      en: "Population Share",
      zh: "人口占比",
      zhHant: "人口佔比"
    },
    relSpread: {
      en: "Religion Spread",
      zh: "宗教传播",
      zhHant: "宗教傳播"
    },
    relPop: {
      en: "Religion by Population",
      zh: "宗教人口",
      zhHant: "宗教人口"
    },
    gold: {
      en: "Treasury",
      zh: "国库",
      zhHant: "國庫"
    },
    tpop: {
      en: "Population",
      zh: "人口",
      zhHant: "人口"
    },
    set: {
      en: "Settlements",
      zh: "定居点",
      zhHant: "聚落"
    }
  };
  function normalizeLocale(locale) {
    if (null == locale || "" === locale) return "en";
    const s = String(locale);
    return "zh_Hant_HK" === s || "zh_Hant" === s || "zh-Hant" === s || "zh_TW" === s || "zh-TW" === s || "zh_HK" === s || "zh-HK" === s || 0 === s.indexOf("zh_Hant") || 0 === s.indexOf("zh-Hant") || 0 === s.indexOf("zh_TW") || 0 === s.indexOf("zh-TW") || 0 === s.indexOf("zh_HK") || 0 === s.indexOf("zh-HK") ? "zh_Hant_HK" : "zh_Hans_CN" === s || "zh_Hans" === s || "zh-CN" === s || "zh_CN" === s || "zh" === s || 0 === s.indexOf("zh_Hans") || 0 === s.indexOf("zh-Hans") || 0 === s.indexOf("zh_CN") || 0 === s.indexOf("zh-CN") ? "zh_Hans_CN" : (s.indexOf("en"), 
    "en");
  }
  function getDisplayLocale() {
    try {
      if ("undefined" != typeof Locale && "function" == typeof Locale.getCurrentDisplayLocale) {
        const loc = Locale.getCurrentDisplayLocale();
        if (loc) return String(loc);
      }
    } catch (e) {}
    return "en";
  }
  function isZh() {
    const lang = normalizeLocale(getDisplayLocale());
    return "zh_Hans_CN" === lang || "zh_Hant_HK" === lang;
  }
  function pickPair(pair) {
    if (!pair) return "";
    const lang = normalizeLocale(getDisplayLocale());
    return "zh_Hant_HK" === lang ? null != pair.zhHant ? String(pair.zhHant) : String(pair.en || "") : "zh_Hans_CN" === lang ? null != pair.zh ? String(pair.zh) : String(pair.en || "") : null != pair.en ? String(pair.en) : "";
  }
  function resolve(locale, key) {
    const args = Array.prototype.slice.call(arguments, 2);
    if (null == key || "" === key) return "";
    const k = String(key);
    let text = function(lang) {
      return "zh_Hant_HK" === lang ? ZH_HANT : "zh_Hans_CN" === lang ? ZH_HANS : EN;
    }(normalizeLocale(locale))[k];
    return null == text && (text = EN[k]), null == text ? /^LOC_[A-Z0-9_]+$/i.test(k) ? "" : k : function(text, args) {
      let s = String(text);
      if (!args || !args.length) return s;
      for (let i = 0; i < args.length; i++) s = s.replace(new RegExp("\\{" + (i + 1) + "(_[^}]*)?\\}", "g"), String(args[i]));
      return s;
    }(text, args);
  }
  function L(key) {
    const args = Array.prototype.slice.call(arguments, 1);
    return resolve.apply(null, [ getDisplayLocale(), key ].concat(args));
  }
  const EN_MONTHS_SHORT = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
  function metricEntry(id) {
    return null != id ? METRICS[id] : null;
  }
  const api = {
    EN: EN,
    ZH_HANS: ZH_HANS,
    ZH_HANT: ZH_HANT,
    METRICS: METRICS,
    normalizeLocale: normalizeLocale,
    resolve: resolve,
    L: L,
    typeDisplayName: function(type) {
      if (null == type || "" === type) return L("LOC_HOF_UNKNOWN") || L("LOC_CHRONICLE_UNKNOWN") || "";
      const t = String(type).trim();
      if (!t) return L("LOC_HOF_UNKNOWN") || L("LOC_CHRONICLE_UNKNOWN") || "";
      const tryCompose = key => {
        try {
          if ("undefined" == typeof Locale || "function" != typeof Locale.compose) return null;
          const n = Locale.compose(key);
          if (function(s, key) {
            if (null == s) return !1;
            const t = String(s).trim();
            return !(!t || null != key && t === String(key) || /^LOC_[A-Z0-9_]+$/i.test(t));
          }(n, key)) {
            return String(n).replace(/\[icon:[^\]]*\]/gi, "").replace(/\[COLOR_[^\]]*\]/gi, "").replace(/\[ENDCOLOR\]/gi, "").replace(/\[\/?(?:b|i|u|N|BLIST|LIST|LI|NN)\]/gi, "").replace(/\[TIP:[^\]]*\]/gi, "").replace(/\[\/TIP\]/gi, "").replace(/\s+/g, " ").trim() || String(n);
          }
        } catch (e) {}
        return null;
      };
      let n = tryCompose("LOC_" + t + "_NAME");
      if (n) return n;
      if (0 === t.indexOf("VICTORY_CLASS_") && (n = tryCompose("LOC_LEGACY_PATH_CLASS_" + t.slice(14) + "_NAME"), 
      n)) return n;
      try {
        if ("undefined" != typeof GameInfo) {
          const tables = [ "Ages", "Difficulties", "Maps", "MapSizes", "GameSpeeds", "VictoryClasses" ];
          for (let i = 0; i < tables.length; i++) {
            const table = tables[i];
            if (!GameInfo[table] || "function" != typeof GameInfo[table].lookup) continue;
            const def = GameInfo[table].lookup(t);
            if (!def) continue;
            const nameField = null != def.Name ? def.Name : def.name;
            if (null == nameField) continue;
            const nf = String(nameField);
            if (0 === nf.indexOf("LOC_") && (n = tryCompose(nf), n)) return n;
          }
        }
      } catch (e) {}
      return function(type) {
        if (null == type || "" === type) return "";
        let s = String(type);
        return s = s.replace(/^(LEADER_|CIVILIZATION_|DIFFICULTY_|AGE_|VICTORY_CLASS_|MAPSIZE_|GAMESPEED_|VICTORY_)/, ""), 
        s = s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()), s;
      }(t) || t;
    },
    formatDate: function(ms) {
      if (!ms) return "";
      try {
        const d = new Date(Number(ms));
        if (isNaN(d.getTime())) return "";
        const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
        return isZh() ? y + "年" + (m + 1) + "月" + day + "日" : EN_MONTHS_SHORT[m] + " " + day + ", " + y;
      } catch (e) {
        return "";
      }
    },
    metricLabel: function(id) {
      const m = metricEntry(id);
      return m ? pickPair(m) : "";
    },
    metricYTitle: function(id, opts) {
      const m = metricEntry(id);
      return m ? opts && opts.summary && m.ySummary ? pickPair(m.ySummary) : m.y ? pickPair(m.y) : pickPair(m) : "";
    },
    formatChartNumber: function(n, opts) {
      if (null == n || "" === n) return "";
      const num = Number(n);
      if (!isFinite(num)) return "";
      const dp = opts && null != opts.dp ? opts.dp : null;
      if (isZh()) return null != dp ? num.toFixed(dp) : Number.isInteger(num) ? String(num) : String(Math.round(1e3 * num) / 1e3);
      try {
        if ("undefined" != typeof Locale && "function" == typeof Locale.toNumber) return String(null != dp ? Locale.toNumber(num, "0." + "0".repeat(dp)) : Locale.toNumber(num));
      } catch (e) {}
      if (null != dp) return num.toFixed(dp);
      try {
        return num.toLocaleString("en-US");
      } catch (e2) {
        return String(num);
      }
    }
  };
  root.ozqChronicleI18n = api, "undefined" != typeof module && module.exports && (module.exports = api);
}("undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : this);