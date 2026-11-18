!function(root) {
  const data = {
    leaders: {
      LEADER_ADA_LOVELACE: {
        en: "Ada Lovelace",
        zh: "埃达·洛夫莱斯",
        zhHant: "愛達‧勒芙蕾絲"
      },
      LEADER_ALEXANDER: {
        en: "Alexander",
        zh: "亚历山大",
        zhHant: "亞歷山大"
      },
      LEADER_ASHOKA_ALT: {
        en: "Ashoka, World Conqueror",
        zh: "阿育王（制霸者）",
        zhHant: "阿育王（征服天下者）"
      },
      LEADER_BOLIVAR: {
        en: "Simón Bolívar",
        zh: "西蒙·玻利瓦尔",
        zhHant: "西蒙‧玻利瓦"
      },
      LEADER_EDWARD_TEACH: {
        en: "Edward Teach",
        zh: "爱德华·蒂奇",
        zhHant: "愛德華‧蒂奇"
      },
      LEADER_ELIZABETH: {
        en: "Elizabeth",
        zh: "伊丽莎白一世",
        zhHant: "伊莉莎白一世"
      },
      LEADER_FRIEDRICH_ALT: {
        en: "Friedrich, Baroque",
        zh: "腓特烈（文艺爱好者）",
        zhHant: "腓特烈（巴洛克）"
      },
      LEADER_GENGHIS_KHAN: {
        en: "Genghis Khan",
        zh: "成吉思汗",
        zhHant: "成吉思汗"
      },
      LEADER_GILGAMESH: {
        en: "Gilgamesh",
        zh: "吉尔伽美什",
        zhHant: "吉爾伽美什"
      },
      LEADER_HIMIKO_ALT: {
        en: "Himiko, High Shaman",
        zh: "卑弥呼（大巫师）",
        zhHant: "卑彌呼（巫女王）"
      },
      LEADER_LAKSHMIBAI: {
        en: "Lakshmibai",
        zh: "拉克什米芭伊",
        zhHant: "拉克什米芭伊"
      },
      LEADER_NAPOLEON: {
        en: "Napoleon, Emperor",
        zh: "拿破仑（皇帝）",
        zhHant: "拿破崙（皇帝）"
      },
      LEADER_NAPOLEON_ALT: {
        en: "Napoleon, Revolutionary",
        zh: "拿破仑（革命者）",
        zhHant: "拿破崙（革命家）"
      },
      LEADER_SAYYIDA_AL_HURRA: {
        en: "Sayyida al Hurra",
        zh: "萨伊达·胡拉",
        zhHant: "薩伊達‧胡拉"
      },
      LEADER_TECUMSEH: {
        en: "Tecumseh",
        zh: "特库姆塞",
        zhHant: "特庫姆塞"
      },
      LEADER_TOYOTOMI_HIDEYOSHI: {
        en: "Toyotomi Hideyoshi",
        zh: "丰臣秀吉",
        zhHant: "豐臣秀吉"
      },
      LEADER_WASHINGTON: {
        en: "George Washington",
        zh: "乔治·华盛顿",
        zhHant: "喬治‧華盛頓"
      },
      LEADER_XERXES_ALT: {
        en: "Xerxes, the Achaemenid",
        zh: "薛西斯（阿契美尼德）",
        zhHant: "薛西斯（阿契美尼德）"
      },
      LEADER_YI_SUN_SIN: {
        en: "Yi Sun-sin",
        zh: "李舜臣",
        zhHant: "李舜臣"
      }
    },
    civs: {
      CIVILIZATION_ASSYRIA: {
        en: "Assyria",
        zh: "亚述",
        zhHant: "亞述"
      },
      CIVILIZATION_BABYLON: {
        en: "Babylon",
        zh: "巴比伦",
        zhHant: "巴比倫"
      },
      CIVILIZATION_BULGARIA: {
        en: "Bulgaria",
        zh: "保加利亚",
        zhHant: "保加利亞"
      },
      CIVILIZATION_CARTHAGE: {
        en: "Carthage",
        zh: "迦太基",
        zhHant: "迦太基"
      },
      CIVILIZATION_DAI_VIET: {
        en: "Đại Việt",
        zh: "大越",
        zhHant: "大越"
      },
      CIVILIZATION_ENGLAND: {
        en: "England",
        zh: "英格兰",
        zhHant: "英格蘭"
      },
      CIVILIZATION_GAUL: {
        en: "Gauls",
        zh: "高卢",
        zhHant: "高盧"
      },
      CIVILIZATION_GORYEO: {
        en: "Goryeo",
        zh: "高丽",
        zhHant: "高麗"
      },
      CIVILIZATION_GREAT_BRITAIN: {
        en: "Great Britain",
        zh: "大不列颠",
        zhHant: "大不列顛"
      },
      CIVILIZATION_HEIAN: {
        en: "Heian Japan",
        zh: "平安日本",
        zhHant: "平安日本"
      },
      CIVILIZATION_ICELAND: {
        en: "Iceland",
        zh: "冰岛",
        zhHant: "冰島"
      },
      CIVILIZATION_JOSEON: {
        en: "Joseon",
        zh: "朝鲜",
        zhHant: "朝鮮"
      },
      CIVILIZATION_NEPAL: {
        en: "Nepal",
        zh: "尼泊尔",
        zhHant: "尼泊爾"
      },
      CIVILIZATION_OTTOMANS: {
        en: "Ottomans",
        zh: "奥斯曼",
        zhHant: "鄂圖曼"
      },
      CIVILIZATION_PIRATE_REPUBLIC: {
        en: "Republic of Pirates",
        zh: "海盗共和国",
        zhHant: "海盜共和國"
      },
      CIVILIZATION_QAJAR: {
        en: "Qajar",
        zh: "卡扎尔",
        zhHant: "卡扎爾"
      },
      CIVILIZATION_SENGOKU: {
        en: "Sengoku Japan",
        zh: "战国日本",
        zhHant: "戰國日本"
      },
      CIVILIZATION_SHAWNEE: {
        en: "Shawnee",
        zh: "肖尼族",
        zhHant: "肖尼族"
      },
      CIVILIZATION_SILLA: {
        en: "Silla",
        zh: "新罗",
        zhHant: "新羅"
      },
      CIVILIZATION_TONGA: {
        en: "Tonga",
        zh: "汤加",
        zhHant: "東加"
      }
    }
  };
  root.ozqChronicleDlcNames = data, "undefined" != typeof module && module.exports && (module.exports = data);
}("undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : this);