!function(root) {
  const data = {
    ages: [ "AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN" ],
    attrs: [ {
      type: "LEGACY_CULTURAL",
      name: {
        en: "Cultural",
        zh: "文化",
        zhHant: "文化"
      }
    }, {
      type: "LEGACY_DIPLOMATIC",
      name: {
        en: "Diplomatic",
        zh: "外交",
        zhHant: "外交"
      }
    }, {
      type: "LEGACY_ECONOMIC",
      name: {
        en: "Economic",
        zh: "经济",
        zhHant: "經濟"
      }
    }, {
      type: "LEGACY_EXPANSIONIST",
      name: {
        en: "Expansionist",
        zh: "扩张",
        zhHant: "擴張"
      }
    }, {
      type: "LEGACY_MILITARISTIC",
      name: {
        en: "Militaristic",
        zh: "军事",
        zhHant: "軍事"
      }
    }, {
      type: "LEGACY_SCIENTIFIC",
      name: {
        en: "Scientific",
        zh: "科技",
        zhHant: "科學"
      }
    } ],
    triumphs: [ {
      id: "LEGACY_AQ_CULTURAL_1",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_CULTURAL",
      major: !0,
      types: [ "LEGACY_AQ_CULTURAL_1", "LEGACY_AQ_CULTURAL_1_RACE" ],
      ch: "CHALLENGE_CULTURE_MAJOR_TRIUMPH_1_COMPLETED_ANTIQUITY",
      name: {
        en: "Wonders of the Ancient World",
        zh: "古代世界奇观",
        zhHant: "遠古世界的奇觀"
      },
      req: {
        en: "Build [B]7 [icon:WONDER][/B] Wonders.",
        zh: "建成[B]7座[icon:WONDER][/B]奇观。",
        zhHant: "建造[B]7座[icon:WONDER][/B]奇觀。"
      }
    }, {
      id: "LEGACY_AQ_CULTURAL_2",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_CULTURAL",
      major: !0,
      types: [ "LEGACY_AQ_CULTURAL_2", "LEGACY_AQ_CULTURAL_2_RACE" ],
      ch: "CHALLENGE_CULTURE_MAJOR_TRIUMPH_2_COMPLETED_ANTIQUITY",
      name: {
        en: "Orphic Mysteries",
        zh: "俄耳甫斯秘仪",
        zhHant: "奧耳菲祕儀"
      },
      req: {
        en: "First to have [B]6 Altars[/B].",
        zh: "率先拥有[B]6座祭坛[/B]。",
        zhHant: "最先擁有[B]6座祭壇[/B]。"
      }
    }, {
      id: "LEGACY_AQ_CULTURAL_3",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_CULTURAL",
      major: !0,
      types: [ "LEGACY_AQ_CULTURAL_3", "LEGACY_AQ_CULTURAL_3_RACE" ],
      ch: "CHALLENGE_CULTURE_MAJOR_TRIUMPH_3_COMPLETED_ANTIQUITY",
      name: {
        en: "Code of Hammurabi",
        zh: "《汉谟拉比法典》",
        zhHant: "漢摩拉比法典"
      },
      req: {
        en: "First to slot [B]9 [icon:SOCIAL_POLICY][/B] Social Policies or [icon:TRADITION] Traditions.",
        zh: "率先在槽位中放置[B]9项[icon:SOCIAL_POLICY][/B]社会政策或[icon:TRADITION]传统。",
        zhHant: "最先在槽位中放入[B]9個[icon:SOCIAL_POLICY][/B]政策或[icon:TRADITION]傳統。"
      }
    }, {
      id: "LEGACY_AQ_CULTURAL_4",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_CULTURAL",
      major: !1,
      types: [ "LEGACY_AQ_CULTURAL_4", "LEGACY_AQ_CULTURAL_4_RACE" ],
      ch: "CHALLENGE_CULTURE_MINOR_TRIUMPH_1_COMPLETED_ANTIQUITY",
      name: {
        en: "I Know That I Know Nothing",
        zh: "我深知自己一无所知",
        zhHant: "我知道自己一無所知"
      },
      req: {
        en: "First to study Philosophy.",
        zh: "率先研习完哲学。",
        zhHant: "最先研究完哲學。"
      }
    }, {
      id: "LEGACY_AQ_CULTURAL_5",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_CULTURAL",
      major: !1,
      types: [ "LEGACY_AQ_CULTURAL_5", "LEGACY_AQ_CULTURAL_5_RACE" ],
      ch: "CHALLENGE_CULTURE_MINOR_TRIUMPH_2_COMPLETED_ANTIQUITY",
      name: {
        en: "Hundred Schools of Thought",
        zh: "百家争鸣",
        zhHant: "百家思想"
      },
      req: {
        en: "First to study all generic [icon:RADIAL_CIVICS] Civics and Masteries.",
        zh: "率先研习完所有普通[icon:RADIAL_CIVICS]市政和精通。",
        zhHant: "最先研究完所有一般[icon:RADIAL_CIVICS]市政和精通。"
      }
    }, {
      id: "LEGACY_AQ_DIPLOMATIC_1",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_DIPLOMATIC",
      major: !0,
      types: [ "LEGACY_AQ_DIPLOMATIC_1", "LEGACY_AQ_DIPLOMATIC_1_RACE" ],
      ch: "CHALLENGE_DIPLOMATIC_MAJOR_TRIUMPH_1_COMPLETED_ANTIQUITY",
      name: {
        en: "Pulling the Strings",
        zh: "幕后操纵",
        zhHant: "幕後操縱"
      },
      req: {
        en: "Become Suzerain of [B]4 [icon:CITYSTATE][/B] City-States.",
        zh: "成为[B]4个[icon:CITYSTATE][/B]城邦的宗主国。",
        zhHant: "成為[B]4個[icon:CITYSTATE][/B]城邦的宗主國。"
      }
    }, {
      id: "LEGACY_AQ_DIPLOMATIC_2",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_DIPLOMATIC",
      major: !0,
      types: [ "LEGACY_AQ_DIPLOMATIC_2", "LEGACY_AQ_DIPLOMATIC_2_RACE" ],
      ch: "CHALLENGE_DIPLOMATIC_MAJOR_TRIUMPH_2_COMPLETED_ANTIQUITY",
      name: {
        en: "Arthasastra",
        zh: "政事论",
        zhHant: "政事論"
      },
      req: {
        en: "Successfully complete [B]5 [icon:ESPIONAGE][/B] Espionage Actions.",
        zh: "成功完成[B]5次[icon:ESPIONAGE][/B]谍报行动。",
        zhHant: "成功完成[B]5項[icon:ESPIONAGE][/B]諜報行動。"
      }
    }, {
      id: "LEGACY_AQ_DIPLOMATIC_3",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_DIPLOMATIC",
      major: !0,
      types: [ "LEGACY_AQ_DIPLOMATIC_3", "LEGACY_AQ_DIPLOMATIC_3_RACE" ],
      ch: "CHALLENGE_DIPLOMATIC_MAJOR_TRIUMPH_3_COMPLETED_ANTIQUITY",
      name: {
        en: "League of Legendary Friends",
        zh: "传奇之友联盟",
        zhHant: "傳奇盟友聯盟"
      },
      req: {
        en: "Have [B]2[/B] [icon:PLAYER_RELATIONSHIP_ALLIANCE] Alliances.",
        zh: "拥有[B]2个[/B][icon:PLAYER_RELATIONSHIP_ALLIANCE]同盟。",
        zhHant: "擁有[B]2個[/B][icon:PLAYER_RELATIONSHIP_ALLIANCE]同盟關係。"
      }
    }, {
      id: "LEGACY_AQ_DIPLOMATIC_4",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_DIPLOMATIC",
      major: !1,
      types: [ "LEGACY_AQ_DIPLOMATIC_4", "LEGACY_AQ_DIPLOMATIC_4_RACE" ],
      ch: "CHALLENGE_DIPLOMATIC_MINOR_TRIUMPH_1_COMPLETED_ANTIQUITY",
      name: {
        en: "Herodotus Says Hello",
        zh: "希罗多德的问好",
        zhHant: "希羅多德向你問好"
      },
      req: {
        en: "Complete [B]10 [icon:ENDEAVOR][/B] Endeavors that you initiated.",
        zh: "完成[B]10项[/B]你发起的[icon:ENDEAVOR]外交努力。",
        zhHant: "完成你發動的[B]10項[icon:ENDEAVOR][/B]外交手段。"
      }
    }, {
      id: "LEGACY_AQ_DIPLOMATIC_5",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_DIPLOMATIC",
      major: !1,
      types: [ "LEGACY_AQ_DIPLOMATIC_5", "LEGACY_AQ_DIPLOMATIC_5_RACE" ],
      ch: "CHALLENGE_DIPLOMATIC_MINOR_TRIUMPH_2_COMPLETED_ANTIQUITY",
      name: {
        en: "Bread & Circuses",
        zh: "面包与马戏",
        zhHant: "麵包和馬戲"
      },
      req: {
        en: "Have [B]50 excess [icon:YIELD_HAPPINESS][/B] in a Settlement.",
        zh: "在一个定居点中拥有[B]50溢出的[icon:YIELD_HAPPINESS][/B]。",
        zhHant: "在一個聚落中擁有[B]50多餘的[icon:YIELD_HAPPINESS][/B]。"
      }
    }, {
      id: "LEGACY_AQ_ECONOMIC_1",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_ECONOMIC",
      major: !0,
      types: [ "LEGACY_AQ_ECONOMIC_1", "LEGACY_AQ_ECONOMIC_1_RACE" ],
      ch: "CHALLENGE_ECONOMIC_MAJOR_TRIUMPH_1_COMPLETED_ANTIQUITY",
      name: {
        en: "Abundance",
        zh: "丰裕",
        zhHant: "富饒"
      },
      req: {
        en: "Assign [B]26 [icon:RADIAL_RESOURCES][/B] Resources.",
        zh: "分配[B]26[icon:RADIAL_RESOURCES][/B]资源。",
        zhHant: "指派[B]26[icon:RADIAL_RESOURCES][/B]資源。"
      }
    }, {
      id: "LEGACY_AQ_ECONOMIC_2",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_ECONOMIC",
      major: !0,
      types: [ "LEGACY_AQ_ECONOMIC_2", "LEGACY_AQ_ECONOMIC_2_RACE" ],
      ch: "CHALLENGE_ECONOMIC_MAJOR_TRIUMPH_2_COMPLETED_ANTIQUITY",
      name: {
        en: "Silk Roads",
        zh: "丝绸之路",
        zhHant: "絲路"
      },
      req: {
        en: "Have [B]7 [icon:TRADE_ROUTE][/B] Trade Routes.",
        zh: "拥有[B]7条[icon:TRADE_ROUTE][/B]贸易路线。",
        zhHant: "擁有[B]7條[icon:TRADE_ROUTE][/B]貿易路線。"
      }
    }, {
      id: "LEGACY_AQ_ECONOMIC_3",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_ECONOMIC",
      major: !0,
      types: [ "LEGACY_AQ_ECONOMIC_3", "LEGACY_AQ_ECONOMIC_3_RACE" ],
      ch: "CHALLENGE_ECONOMIC_MAJOR_TRIUMPH_3_COMPLETED_ANTIQUITY",
      name: {
        en: "Midas Touch",
        zh: "点石成金",
        zhHant: "邁達斯之觸"
      },
      req: {
        en: "Have [B]8[/B] Gold Buildings.",
        zh: "拥有[B]8座[/B]金币建筑。",
        zhHant: "擁有[B]8座[/B]金幣建築。"
      }
    }, {
      id: "LEGACY_AQ_ECONOMIC_4",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_ECONOMIC",
      major: !1,
      types: [ "LEGACY_AQ_ECONOMIC_4", "LEGACY_AQ_ECONOMIC_4_RACE" ],
      ch: "CHALLENGE_ECONOMIC_MINOR_TRIUMPH_1_COMPLETED_ANTIQUITY",
      name: {
        en: "Greed is Golden",
        zh: "贪婪是金",
        zhHant: "貪婪是金"
      },
      req: {
        en: "Make [B]10,000 [icon:YIELD_GOLD][/B] worth of purchases this Age. Maintenance does not count.",
        zh: "在本时代达成[B]10000[icon:YIELD_GOLD][/B]等值的购买。维护费用不计入在内。",
        zhHant: "在本時代中，完成總價值[B]10000[icon:YIELD_GOLD][/B]的購買。維護費用不計入其中。"
      }
    }, {
      id: "LEGACY_AQ_ECONOMIC_5",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_ECONOMIC",
      major: !1,
      types: [ "LEGACY_AQ_ECONOMIC_5", "LEGACY_AQ_ECONOMIC_5_RACE" ],
      ch: "CHALLENGE_ECONOMIC_MINOR_TRIUMPH_2_COMPLETED_ANTIQUITY",
      name: {
        en: "Trajan's Market",
        zh: "图拉真市集",
        zhHant: "圖拉真的市集"
      },
      req: {
        en: "Have [B]18 [icon:RESOURCECLASS_EMPIRE][/B] Empire Resources.",
        zh: "拥有[B]18[icon:RESOURCECLASS_EMPIRE][/B]帝国资源。",
        zhHant: "擁有[B]18[icon:RESOURCECLASS_EMPIRE][/B]帝國資源。"
      }
    }, {
      id: "LEGACY_AQ_EXPANSIONIST_1",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_EXPANSIONIST",
      major: !0,
      types: [ "LEGACY_AQ_EXPANSIONIST_1", "LEGACY_AQ_EXPANSIONIST_1_RACE" ],
      ch: "CHALLENGE_EXPANSIONIST_MAJOR_TRIUMPH_1_COMPLETED_ANTIQUITY",
      name: {
        en: "Four Corners of the World",
        zh: "世界四方",
        zhHant: "世界四極"
      },
      req: {
        en: "Found [B]8[/B] Settlements.",
        zh: "创建[B]8个[/B]定居点。",
        zhHant: "創立[B]8個[/B]聚落。"
      }
    }, {
      id: "LEGACY_AQ_EXPANSIONIST_2",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_EXPANSIONIST",
      major: !0,
      types: [ "LEGACY_AQ_EXPANSIONIST_2", "LEGACY_AQ_EXPANSIONIST_2_RACE" ],
      ch: "CHALLENGE_EXPANSIONIST_MAJOR_TRIUMPH_2_COMPLETED_ANTIQUITY",
      name: {
        en: "We Need More Sacbeob",
        zh: "我们需要更多圣道",
        zhHant: "我們需要更多薩克貝道路"
      },
      req: {
        en: "Have [B]10 [icon:SPECIALIST][/B] Specialists.",
        zh: "拥有[B]10名[icon:SPECIALIST][/B]专家。",
        zhHant: "擁有[B]10名[icon:SPECIALIST][/B]專家。"
      }
    }, {
      id: "LEGACY_AQ_EXPANSIONIST_3",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_EXPANSIONIST",
      major: !0,
      types: [ "LEGACY_AQ_EXPANSIONIST_3", "LEGACY_AQ_EXPANSIONIST_3_RACE" ],
      ch: "CHALLENGE_EXPANSIONIST_MAJOR_TRIUMPH_3_COMPLETED_ANTIQUITY",
      name: {
        en: "Tower of Babel",
        zh: "巴别塔",
        zhHant: "巴別塔"
      },
      req: {
        en: "Have [B]150 [icon:YIELD_POPULATION][/B] Population.",
        zh: "拥有[B]150[icon:YIELD_POPULATION][/B]人口。",
        zhHant: "擁有[B]150[icon:YIELD_POPULATION][/B]人口。"
      }
    }, {
      id: "LEGACY_AQ_EXPANSIONIST_4",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_EXPANSIONIST",
      major: !1,
      types: [ "LEGACY_AQ_EXPANSIONIST_4", "LEGACY_AQ_EXPANSIONIST_4_RACE" ],
      ch: "CHALLENGE_EXPANSIONIST_MINOR_TRIUMPH_1_COMPLETED_ANTIQUITY",
      name: {
        en: "From Nagû to Nagû",
        zh: "从纳古到纳古",
        zhHant: "從納古到納古"
      },
      req: {
        en: "Reveal [B]33%[/B] of the Map.",
        zh: "探明[B]33%[/B]的地图。",
        zhHant: "揭露[B]33%[/B]的地圖。"
      }
    }, {
      id: "LEGACY_AQ_EXPANSIONIST_5",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_EXPANSIONIST",
      major: !1,
      types: [ "LEGACY_AQ_EXPANSIONIST_5", "LEGACY_AQ_EXPANSIONIST_5_RACE" ],
      ch: "CHALLENGE_EXPANSIONIST_MINOR_TRIUMPH_2_COMPLETED_ANTIQUITY",
      name: {
        en: "Yok'ol-kab",
        zh: "淌蜜大地",
        zhHant: "地上世界"
      },
      req: {
        en: "Improve at least 1 tile from all [icon:NOTIFICATION_DISCOVER_NATURAL_WONDER] Natural Wonders in your Homelands.",
        zh: "改良本土中所有[icon:NOTIFICATION_DISCOVER_NATURAL_WONDER]自然奇观的至少1个地块。",
        zhHant: "改良你家鄉土地中所有[icon:NOTIFICATION_DISCOVER_NATURAL_WONDER]自然奇觀的至少1個格位。"
      }
    }, {
      id: "LEGACY_AQ_MILITARISTIC_1",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_MILITARISTIC",
      major: !0,
      types: [ "LEGACY_AQ_MILITARISTIC_1", "LEGACY_AQ_MILITARISTIC_1_RACE" ],
      ch: "CHALLENGE_MILITARISTIC_MAJOR_TRIUMPH_1_COMPLETED_ANTIQUITY",
      name: {
        en: "Pax Imperatoria",
        zh: "帝国和平",
        zhHant: "和平帝國"
      },
      req: {
        en: "Conquer and hold [B]6[/B] Settlements.",
        zh: "征服并保留[B]6座[/B]定居点。",
        zhHant: "征服並保留[B]6個[/B]聚落。"
      }
    }, {
      id: "LEGACY_AQ_MILITARISTIC_2",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_MILITARISTIC",
      major: !0,
      types: [ "LEGACY_AQ_MILITARISTIC_2", "LEGACY_AQ_MILITARISTIC_2_RACE" ],
      ch: "CHALLENGE_MILITARISTIC_MAJOR_TRIUMPH_2_COMPLETED_ANTIQUITY",
      name: {
        en: "To Fell a Giant",
        zh: "击倒巨人",
        zhHant: "砍倒巨人"
      },
      req: {
        en: "Suffer [B]-5[/B] War Weariness in a single War.",
        zh: "在一次战争中蒙受[B]-5[/B]厌战情绪。",
        zhHant: "在一場戰爭中承受[B]-5[/B]厭戰情緒。"
      }
    }, {
      id: "LEGACY_AQ_MILITARISTIC_3",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_MILITARISTIC",
      major: !0,
      types: [ "LEGACY_AQ_MILITARISTIC_3", "LEGACY_AQ_MILITARISTIC_3_RACE" ],
      ch: "CHALLENGE_MILITARISTIC_MAJOR_TRIUMPH_3_COMPLETED_ANTIQUITY",
      name: {
        en: "What a Gaius",
        zh: "盖乌斯之道",
        zhHant: "好一個蓋烏斯"
      },
      req: {
        en: "Have a Level [B]8 [icon:UNIT_ARMY_COMMANDER][/B] Commander.",
        zh: "拥有一位[B]8级[icon:UNIT_ARMY_COMMANDER][/B]的指挥官。",
        zhHant: "擁有一個[B]8級[icon:UNIT_ARMY_COMMANDER][/B]的指揮官。"
      }
    }, {
      id: "LEGACY_AQ_MILITARISTIC_4",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_MILITARISTIC",
      major: !1,
      types: [ "LEGACY_AQ_MILITARISTIC_4", "LEGACY_AQ_MILITARISTIC_4_RACE" ],
      ch: "CHALLENGE_MILITARISTIC_MINOR_TRIUMPH_1_COMPLETED_ANTIQUITY",
      name: {
        en: "First Blood",
        zh: "第一滴血",
        zhHant: "第一滴血"
      },
      req: {
        en: "First to conquer a [icon:NOTIFICATION_SELECT_CAPITAL] Capital.",
        zh: "率先征服一座[icon:NOTIFICATION_SELECT_CAPITAL]首都。",
        zhHant: "最先征服一個[icon:NOTIFICATION_SELECT_CAPITAL]首都。"
      }
    }, {
      id: "LEGACY_AQ_MILITARISTIC_5",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_MILITARISTIC",
      major: !1,
      types: [ "LEGACY_AQ_MILITARISTIC_5", "LEGACY_AQ_MILITARISTIC_5_RACE" ],
      ch: "CHALLENGE_MILITARISTIC_MINOR_TRIUMPH_2_COMPLETED_ANTIQUITY",
      name: {
        en: "Jebel Seheba",
        zh: "同伴之山",
        zhHant: "賽赫巴山"
      },
      req: {
        en: "Be at War with all Civilizations in the Homelands.",
        zh: "与本土中的所有文明交战。",
        zhHant: "在家鄉土地中與所有文明交戰。"
      }
    }, {
      id: "LEGACY_AQ_SCIENTIFIC_1",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_SCIENTIFIC",
      major: !0,
      types: [ "LEGACY_AQ_SCIENTIFIC_1", "LEGACY_AQ_SCIENTIFIC_1_RACE" ],
      ch: "CHALLENGE_SCIENTIFIC_MAJOR_TRIUMPH_1_COMPLETED_ANTIQUITY",
      name: {
        en: "Round Earther",
        zh: "地圆论者",
        zhHant: "地圓論者"
      },
      req: {
        en: "Complete [B]Chart the Stars[/B] and [B]Spherical Earth[/B] [icon:DEFAULT_PROJECT] Projects.",
        zh: "完成[B]“绘制星图”[/B]和[B]“地圆说”[/B][icon:DEFAULT_PROJECT]项目。",
        zhHant: "完成[B]「繪製星圖」[/B]和[B]「地圓說」[/B][icon:DEFAULT_PROJECT]專案。"
      }
    }, {
      id: "LEGACY_AQ_SCIENTIFIC_2",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_SCIENTIFIC",
      major: !0,
      types: [ "LEGACY_AQ_SCIENTIFIC_2", "LEGACY_AQ_SCIENTIFIC_2_RACE" ],
      ch: "CHALLENGE_SCIENTIFIC_MAJOR_TRIUMPH_2_COMPLETED_ANTIQUITY",
      name: {
        en: "Kaogongji",
        zh: "考工记",
        zhHant: "考工記"
      },
      req: {
        en: "Have [B]5 [icon:CITY_URBAN][/B] non-City Center Districts with [B]30+ Yield[/B].",
        zh: "拥有[B]5个[icon:CITY_URBAN][/B][B]产量30+[/B]的非市中心区块。",
        zhHant: "擁有[B]5個[icon:CITY_URBAN][/B][B]收益30+[/B]的非城市中心區域。"
      }
    }, {
      id: "LEGACY_AQ_SCIENTIFIC_3",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_SCIENTIFIC",
      major: !0,
      types: [ "LEGACY_AQ_SCIENTIFIC_3", "LEGACY_AQ_SCIENTIFIC_3_RACE" ],
      ch: "CHALLENGE_SCIENTIFIC_MAJOR_TRIUMPH_3_COMPLETED_ANTIQUITY",
      name: {
        en: "Library of Ashurbanipal",
        zh: "亚述巴尼拔藏书馆",
        zhHant: "亞述巴尼拔的藏書館"
      },
      req: {
        en: "Display [B]12 [icon:NAR_REW_GREATWORK][/B] Codices.",
        zh: "展示[B]12部[icon:NAR_REW_GREATWORK][/B]抄本。",
        zhHant: "展示[B]12本[icon:NAR_REW_GREATWORK][/B]抄本。"
      }
    }, {
      id: "LEGACY_AQ_SCIENTIFIC_4",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_SCIENTIFIC",
      major: !1,
      types: [ "LEGACY_AQ_SCIENTIFIC_4", "LEGACY_AQ_SCIENTIFIC_4_RACE" ],
      ch: "CHALLENGE_SCIENTIFIC_MINOR_TRIUMPH_1_COMPLETED_ANTIQUITY",
      name: {
        en: "Abracadabacus",
        zh: "魔法算盘",
        zhHant: "魔法算盤"
      },
      req: {
        en: "First to research [B]Mathematics[/B].",
        zh: "率先研究完[B]数学[/B]。",
        zhHant: "最先研發完[B]數學[/B]。"
      }
    }, {
      id: "LEGACY_AQ_SCIENTIFIC_5",
      age: "AGE_ANTIQUITY",
      attr: "LEGACY_SCIENTIFIC",
      major: !1,
      types: [ "LEGACY_AQ_SCIENTIFIC_5", "LEGACY_AQ_SCIENTIFIC_5_RACE" ],
      ch: "CHALLENGE_SCIENTIFIC_MINOR_TRIUMPH_2_COMPLETED_ANTIQUITY",
      name: {
        en: "a²+b²=c²",
        zh: "a²+b²=c²",
        zhHant: "a²+b²=c²"
      },
      req: {
        en: "First to research all [icon:RADIAL_TECH] Technologies and Masteries.",
        zh: "率先研究完所有[icon:RADIAL_TECH]科技和精通。",
        zhHant: "最先研究完所有[icon:RADIAL_TECH]科技和精通。"
      }
    }, {
      id: "LEGACY_EX_CULTURAL_1",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_CULTURAL",
      major: !0,
      types: [ "LEGACY_EX_CULTURAL_1", "LEGACY_EX_CULTURAL_1_RACE" ],
      ch: "CHALLENGE_CULTURE_MAJOR_TRIUMPH_1_COMPLETED_EXPLORATION",
      name: {
        en: "Toshakhana",
        zh: "皇家宝库",
        zhHant: "藏寶庫"
      },
      req: {
        en: "Display [B]20 [icon:NAR_REW_GREATWORK][/B] Relics.",
        zh: "展示[B]20件[icon:NAR_REW_GREATWORK][/B]遗物。",
        zhHant: "展示[B]20個[icon:NAR_REW_GREATWORK][/B]遺物。"
      }
    }, {
      id: "LEGACY_EX_CULTURAL_2",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_CULTURAL",
      major: !0,
      types: [ "LEGACY_EX_CULTURAL_2", "LEGACY_EX_CULTURAL_2_RACE" ],
      ch: "CHALLENGE_CULTURE_MAJOR_TRIUMPH_2_COMPLETED_EXPLORATION",
      name: {
        en: "Wonders of the Renaissance World",
        zh: "复兴世界奇观",
        zhHant: "復興世界的奇觀"
      },
      req: {
        en: "Build [B]6[/B] Exploration Age [icon:WONDER] Wonders.",
        zh: "建成[B]6座[/B]探索时代[icon:WONDER]奇观。",
        zhHant: "建造[B]6座[/B]探索時代[icon:WONDER]奇觀。"
      }
    }, {
      id: "LEGACY_EX_CULTURAL_3",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_CULTURAL",
      major: !0,
      types: [ "LEGACY_EX_CULTURAL_3", "LEGACY_EX_CULTURAL_3_RACE" ],
      ch: "CHALLENGE_CULTURE_MAJOR_TRIUMPH_3_COMPLETED_EXPLORATION",
      name: {
        en: "Eightfold Path",
        zh: "八正道",
        zhHant: "八聖道分"
      },
      req: {
        en: "First to have [B]8 Temples[/B].",
        zh: "率先拥有[B]8座寺庙[/B]。",
        zhHant: "最先擁有[B]8座寺廟[/B]。"
      }
    }, {
      id: "LEGACY_EX_CULTURAL_4",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_CULTURAL",
      major: !1,
      types: [ "LEGACY_EX_CULTURAL_4", "LEGACY_EX_CULTURAL_4_RACE" ],
      ch: "CHALLENGE_CULTURE_MINOR_TRIUMPH_1_COMPLETED_EXPLORATION",
      name: {
        en: "Ingenious Al-Jazari",
        zh: "巧匠加扎利",
        zhHant: "能工巧匠加扎利"
      },
      req: {
        en: "Have [B]2 [icon:WONDER][/B] Wonders from any Age that grant [icon:SCIENCE_VP] Innovation.",
        zh: "拥有[B]2座[icon:WONDER][/B]属于任意时代、提供[icon:SCIENCE_VP]创新点的奇观。",
        zhHant: "擁有[B]2個[icon:WONDER][/B]提供[icon:SCIENCE_VP]創新值的任意時代的奇觀。"
      }
    }, {
      id: "LEGACY_EX_CULTURAL_5",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_CULTURAL",
      major: !1,
      types: [ "LEGACY_EX_CULTURAL_5", "LEGACY_EX_CULTURAL_5_RACE" ],
      ch: "CHALLENGE_CULTURE_MINOR_TRIUMPH_2_COMPLETED_EXPLORATION",
      name: {
        en: "Kingdom of Heaven",
        zh: "天堂王国",
        zhHant: "天堂王國"
      },
      req: {
        en: "Convert [B]25[/B] Settlements to your [icon:NAR_REW_RELIGION] Religion.",
        zh: "让[B]25个[/B]定居点皈依你的[icon:NAR_REW_RELIGION]宗教。",
        zhHant: "讓[B]25個[/B]聚落皈依你的[icon:NAR_REW_RELIGION]宗教。"
      }
    }, {
      id: "LEGACY_EX_DIPLOMATIC_1",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_DIPLOMATIC",
      major: !0,
      types: [ "LEGACY_EX_DIPLOMATIC_1", "LEGACY_EX_DIPLOMATIC_1_RACE" ],
      ch: "CHALLENGE_DIPLOMATIC_MAJOR_TRIUMPH_1_COMPLETED_EXPLORATION",
      name: {
        en: "Puppeteer",
        zh: "傀儡师",
        zhHant: "操偶師"
      },
      req: {
        en: "Become Suzerain of [B]5 [icon:CITYSTATE][/B] City-States.",
        zh: "成为[B]5个[icon:CITYSTATE][/B]城邦的宗主国。",
        zhHant: "成為[B]5個[icon:CITYSTATE][/B]城邦的宗主國。"
      }
    }, {
      id: "LEGACY_EX_DIPLOMATIC_2",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_DIPLOMATIC",
      major: !0,
      types: [ "LEGACY_EX_DIPLOMATIC_2", "LEGACY_EX_DIPLOMATIC_2_RACE" ],
      ch: "CHALLENGE_DIPLOMATIC_MAJOR_TRIUMPH_2_COMPLETED_EXPLORATION",
      name: {
        en: "Order of Assassins",
        zh: "阿萨辛派",
        zhHant: "阿薩辛派"
      },
      req: {
        en: "Successfully complete [B]10 [icon:ESPIONAGE][/B] Espionage Actions.",
        zh: "成功完成[B]10次[icon:ESPIONAGE][/B]谍报行动。",
        zhHant: "成功完成[B]10項[icon:ESPIONAGE][/B]諜報行動。"
      }
    }, {
      id: "LEGACY_EX_DIPLOMATIC_3",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_DIPLOMATIC",
      major: !0,
      types: [ "LEGACY_EX_DIPLOMATIC_3", "LEGACY_EX_DIPLOMATIC_3_RACE" ],
      ch: "CHALLENGE_DIPLOMATIC_MAJOR_TRIUMPH_3_COMPLETED_EXPLORATION",
      name: {
        en: "Quadruple Alliance",
        zh: "四国同盟",
        zhHant: "四國同盟"
      },
      req: {
        en: "Have [B]3[/B] [icon:PLAYER_RELATIONSHIP_ALLIANCE] Alliances.",
        zh: "拥有[B]3个[/B][icon:PLAYER_RELATIONSHIP_ALLIANCE]同盟。",
        zhHant: "擁有[B]3個[/B][icon:PLAYER_RELATIONSHIP_ALLIANCE]同盟關係。"
      }
    }, {
      id: "LEGACY_EX_DIPLOMATIC_4",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_DIPLOMATIC",
      major: !1,
      types: [ "LEGACY_EX_DIPLOMATIC_4", "LEGACY_EX_DIPLOMATIC_4_RACE" ],
      ch: "CHALLENGE_DIPLOMATIC_MINOR_TRIUMPH_1_COMPLETED_EXPLORATION",
      name: {
        en: "Gregarious Animal",
        zh: "群居动物",
        zhHant: "群居動物"
      },
      req: {
        en: "Start a Diplomatic Action with all Leaders.",
        zh: "与所有领袖开始一项外交行动。",
        zhHant: "與所有領袖展開一項外交行動。"
      }
    }, {
      id: "LEGACY_EX_DIPLOMATIC_5",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_DIPLOMATIC",
      major: !1,
      types: [ "LEGACY_EX_DIPLOMATIC_5", "LEGACY_EX_DIPLOMATIC_5_RACE" ],
      ch: "CHALLENGE_DIPLOMATIC_MINOR_TRIUMPH_2_COMPLETED_EXPLORATION",
      name: {
        en: "Sejong's Legacy",
        zh: "世宗遗泽",
        zhHant: "世宗大王的遺產"
      },
      req: {
        en: "Have [B]150 excess [icon:YIELD_HAPPINESS][/B] in a Settlement.",
        zh: "在一个定居点中拥有[B]150溢出的[icon:YIELD_HAPPINESS][/B]。",
        zhHant: "在一個聚落中擁有[B]150多餘的[icon:YIELD_HAPPINESS][/B]。"
      }
    }, {
      id: "LEGACY_EX_ECONOMIC_1",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_ECONOMIC",
      major: !0,
      types: [ "LEGACY_EX_ECONOMIC_1", "LEGACY_EX_ECONOMIC_1_RACE" ],
      ch: "CHALLENGE_ECONOMIC_MAJOR_TRIUMPH_1_COMPLETED_EXPLORATION",
      name: {
        en: "Khan el-Khalili",
        zh: "哈利利汗市集",
        zhHant: "汗‧哈利利市集"
      },
      req: {
        en: "Assign [B]45 [icon:RADIAL_RESOURCES][/B] Resources.",
        zh: "分配[B]45[icon:RADIAL_RESOURCES][/B]资源。",
        zhHant: "指派[B]45[icon:RADIAL_RESOURCES][/B]資源。"
      }
    }, {
      id: "LEGACY_EX_ECONOMIC_2",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_ECONOMIC",
      major: !0,
      types: [ "LEGACY_EX_ECONOMIC_2", "LEGACY_EX_ECONOMIC_2_RACE" ],
      ch: "CHALLENGE_ECONOMIC_MAJOR_TRIUMPH_2_COMPLETED_EXPLORATION",
      name: {
        en: "Treasure Fleet",
        zh: "宝藏舰队",
        zhHant: "寶藏艦隊"
      },
      req: {
        en: "Score [B]800 [icon:ECONOMIC_VP][/B] GDP by unloading [icon:UNIT_TREASURE_FLEET] Treasure Convoys.",
        zh: "通过卸载[icon:UNIT_TREASURE_FLEET]宝藏护送队得到[B]800[icon:ECONOMIC_VP][/B]GDP。",
        zhHant: "透過卸下[icon:UNIT_TREASURE_FLEET]寶藏護衛隊來得到[B]800[icon:ECONOMIC_VP][/B] GDP。"
      }
    }, {
      id: "LEGACY_EX_ECONOMIC_3",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_ECONOMIC",
      major: !0,
      types: [ "LEGACY_EX_ECONOMIC_3", "LEGACY_EX_ECONOMIC_3_RACE" ],
      ch: "CHALLENGE_ECONOMIC_MAJOR_TRIUMPH_3_COMPLETED_EXPLORATION",
      name: {
        en: "Let's Calicut a Deal",
        zh: "来卡利卡特做买卖",
        zhHant: "讓我們來卡利卡特談一筆交易"
      },
      req: {
        en: "First to start a [icon:TRADE_ROUTE] Trade Route with every Leader.",
        zh: "率先与每位领袖建立[icon:TRADE_ROUTE]贸易路线。",
        zhHant: "最先與每位領袖建立[icon:TRADE_ROUTE]貿易路線。"
      }
    }, {
      id: "LEGACY_EX_ECONOMIC_4",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_ECONOMIC",
      major: !1,
      types: [ "LEGACY_EX_ECONOMIC_4", "LEGACY_EX_ECONOMIC_4_RACE" ],
      ch: "CHALLENGE_ECONOMIC_MINOR_TRIUMPH_1_COMPLETED_EXPLORATION",
      name: {
        en: "Greed Is Good",
        zh: "贪婪即正义",
        zhHant: "貪婪是好事"
      },
      req: {
        en: "Make 50,000 [icon:YIELD_GOLD] worth of purchases this Age. Maintenance does not count.",
        zh: "在本时代达成50000[icon:YIELD_GOLD]等值的购买。维护费用不计入在内。",
        zhHant: "在本時代中，完成總價值50000[icon:YIELD_GOLD]的購買。維護費用不計入其中。"
      }
    }, {
      id: "LEGACY_EX_ECONOMIC_5",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_ECONOMIC",
      major: !1,
      types: [ "LEGACY_EX_ECONOMIC_5", "LEGACY_EX_ECONOMIC_5_RACE" ],
      ch: "CHALLENGE_ECONOMIC_MINOR_TRIUMPH_2_COMPLETED_EXPLORATION",
      name: {
        en: "Nuestra Señora de Atocha",
        zh: "阿托查圣母号",
        zhHant: "阿托查聖母號"
      },
      req: {
        en: "Unload a [icon:UNIT_TREASURE_FLEET] Treasure Convoy worth at least [B]10 Cargo[/B].",
        zh: "卸载一支计至少[B]10货物点[/B]的[icon:UNIT_TREASURE_FLEET]宝藏护送队。",
        zhHant: "卸下一支擁有至少[B]10貨物值[/B]的[icon:UNIT_TREASURE_FLEET]寶藏護衛隊。"
      }
    }, {
      id: "LEGACY_EX_EXPANSIONIST_1",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_EXPANSIONIST",
      major: !0,
      types: [ "LEGACY_EX_EXPANSIONIST_1", "LEGACY_EX_EXPANSIONIST_1_RACE" ],
      ch: "CHALLENGE_EXPANSIONIST_MAJOR_TRIUMPH_1_COMPLETED_EXPLORATION",
      name: {
        en: "Hic Sunt Dracones",
        zh: "此处有龙",
        zhHant: "未知危險之地"
      },
      req: {
        en: "First to found [B]6[/B] Settlements in Distant Lands.",
        zh: "率先在遥远土地上建立[B]6个[/B]定居点。",
        zhHant: "最先在遙遠土地中建立[B]6個[/B]聚落。"
      }
    }, {
      id: "LEGACY_EX_EXPANSIONIST_2",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_EXPANSIONIST",
      major: !0,
      types: [ "LEGACY_EX_EXPANSIONIST_2", "LEGACY_EX_EXPANSIONIST_2_RACE" ],
      ch: "CHALLENGE_EXPANSIONIST_MAJOR_TRIUMPH_2_COMPLETED_EXPLORATION",
      name: {
        en: "We Have Habsburgs at Home",
        zh: "哈布斯堡就在我家",
        zhHant: "自家也有哈布斯堡"
      },
      req: {
        en: "Found [B]16[/B] Settlements in the Homelands. Previous Age Settlements count as founded by you.",
        zh: "在本土建立[B]16个[/B]定居点。之前时代的定居点视为由你建立。",
        zhHant: "在家鄉土地中建立[B]16個[/B]聚落。前一個時代的聚落也視為由你建立。"
      }
    }, {
      id: "LEGACY_EX_EXPANSIONIST_3",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_EXPANSIONIST",
      major: !0,
      types: [ "LEGACY_EX_EXPANSIONIST_3", "LEGACY_EX_EXPANSIONIST_3_RACE" ],
      ch: "CHALLENGE_EXPANSIONIST_MAJOR_TRIUMPH_3_COMPLETED_EXPLORATION",
      name: {
        en: "Three Field System",
        zh: "三圃制",
        zhHant: "三圃制"
      },
      req: {
        en: "Have [B]350 [icon:YIELD_POPULATION][/B] Population.",
        zh: "拥有[B]350[icon:YIELD_POPULATION][/B]人口。",
        zhHant: "擁有[B]350[icon:YIELD_POPULATION][/B]人口。"
      }
    }, {
      id: "LEGACY_EX_EXPANSIONIST_4",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_EXPANSIONIST",
      major: !1,
      types: [ "LEGACY_EX_EXPANSIONIST_4", "LEGACY_EX_EXPANSIONIST_4_RACE" ],
      ch: "CHALLENGE_EXPANSIONIST_MINOR_TRIUMPH_1_COMPLETED_EXPLORATION",
      name: {
        en: "Wanderlust",
        zh: "探索癖",
        zhHant: "流浪癖"
      },
      req: {
        en: "Discover all [icon:NOTIFICATION_DISCOVER_NATURAL_WONDER] Natural Wonders.",
        zh: "发现所有[icon:NOTIFICATION_DISCOVER_NATURAL_WONDER]自然奇观。",
        zhHant: "發現所有的[icon:NOTIFICATION_DISCOVER_NATURAL_WONDER]自然奇觀。"
      }
    }, {
      id: "LEGACY_EX_EXPANSIONIST_5",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_EXPANSIONIST",
      major: !1,
      types: [ "LEGACY_EX_EXPANSIONIST_5", "LEGACY_EX_EXPANSIONIST_5_RACE" ],
      ch: "CHALLENGE_EXPANSIONIST_MINOR_TRIUMPH_2_COMPLETED_EXPLORATION",
      name: {
        en: "Limes and Hardtack",
        zh: "酸橙与硬饼干",
        zhHant: "青檸與硬餅"
      },
      req: {
        en: "First to Circumnavigate.",
        zh: "率先完成环球航行。",
        zhHant: "最先完成環球航行。"
      }
    }, {
      id: "LEGACY_EX_MILITARISTIC_1",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_MILITARISTIC",
      major: !0,
      types: [ "LEGACY_EX_MILITARISTIC_1", "LEGACY_EX_MILITARISTIC_1_RACE" ],
      ch: "CHALLENGE_MILITARISTIC_MAJOR_TRIUMPH_1_COMPLETED_EXPLORATION",
      name: {
        en: "Non Sufficit Orbis",
        zh: "世界不够大",
        zhHant: "世界不夠大"
      },
      req: {
        en: "Conquer and hold [B]6[/B] Settlements in Distant Lands.",
        zh: "在遥远土地上征服并保留[B]6[/B]座定居点。",
        zhHant: "征服並保留遙遠土地中的[B]6個[/B]聚落。"
      }
    }, {
      id: "LEGACY_EX_MILITARISTIC_2",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_MILITARISTIC",
      major: !0,
      types: [ "LEGACY_EX_MILITARISTIC_2", "LEGACY_EX_MILITARISTIC_2_RACE" ],
      ch: "CHALLENGE_MILITARISTIC_MAJOR_TRIUMPH_2_COMPLETED_EXPLORATION",
      name: {
        en: "Pax Mongolica",
        zh: "蒙古治世",
        zhHant: "蒙古治世"
      },
      req: {
        en: "Conquer and hold [B]8[/B] Settlements in the Homelands.",
        zh: "在本土上征服并保留[B]8[/B]座定居点。",
        zhHant: "征服並保留家鄉土地上的[B]8個[/B]聚落。"
      }
    }, {
      id: "LEGACY_EX_MILITARISTIC_3",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_MILITARISTIC",
      major: !0,
      types: [ "LEGACY_EX_MILITARISTIC_3", "LEGACY_EX_MILITARISTIC_3_RACE" ],
      ch: "CHALLENGE_MILITARISTIC_MAJOR_TRIUMPH_3_COMPLETED_EXPLORATION",
      name: {
        en: "Master & Commander",
        zh: "怒海称雄",
        zhHant: "大師與指揮官"
      },
      req: {
        en: "Have a Level [B]8 [icon:UNIT_FLEET_COMMANDER][/B] Fleet Commander.",
        zh: "拥有一位[B]8级[icon:UNIT_FLEET_COMMANDER][/B]的舰队指挥官。",
        zhHant: "擁有一個[B]8級[icon:UNIT_FLEET_COMMANDER][/B]的艦隊指揮官。"
      }
    }, {
      id: "LEGACY_EX_MILITARISTIC_4",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_MILITARISTIC",
      major: !1,
      types: [ "LEGACY_EX_MILITARISTIC_4", "LEGACY_EX_MILITARISTIC_4_RACE" ],
      ch: "CHALLENGE_MILITARISTIC_MINOR_TRIUMPH_1_COMPLETED_EXPLORATION",
      name: {
        en: "Sack!",
        zh: "大劫掠！",
        zhHant: "打劫！"
      },
      req: {
        en: "First to conquer a [icon:NOTIFICATION_SELECT_CAPITAL] Capital.",
        zh: "率先征服一座[icon:NOTIFICATION_SELECT_CAPITAL]首都。",
        zhHant: "最先征服一個[icon:NOTIFICATION_SELECT_CAPITAL]首都。"
      }
    }, {
      id: "LEGACY_EX_MILITARISTIC_5",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_MILITARISTIC",
      major: !1,
      types: [ "LEGACY_EX_MILITARISTIC_5", "LEGACY_EX_MILITARISTIC_5_RACE" ],
      ch: "CHALLENGE_MILITARISTIC_MINOR_TRIUMPH_2_COMPLETED_EXPLORATION",
      name: {
        en: "Gwlad y Cestyll",
        zh: "城堡之地",
        zhHant: "城堡之地"
      },
      req: {
        en: "Have [B]30 Fortifications[/B].",
        zh: "拥有[B]30个防御工事[/B]。",
        zhHant: "擁有[B]30個防禦工事[/B]。"
      }
    }, {
      id: "LEGACY_EX_SCIENTIFIC_1",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_SCIENTIFIC",
      major: !0,
      types: [ "LEGACY_EX_SCIENTIFIC_1", "LEGACY_EX_SCIENTIFIC_1_RACE" ],
      ch: "CHALLENGE_SCIENTIFIC_MAJOR_TRIUMPH_1_COMPLETED_EXPLORATION",
      name: {
        en: "Enlightenment",
        zh: "启蒙",
        zhHant: "啟蒙"
      },
      req: {
        en: "Have [B]5 [icon:CITY_URBAN][/B] non-City Center Districts with [B]75+ Yield[/B].",
        zh: "拥有[B]5个[icon:CITY_URBAN][/B][B]产量75+[/B]的非市中心区块。",
        zhHant: "擁有[B]5個[icon:CITY_URBAN][/B][B]收益75+[/B]的非城市中心區域。"
      }
    }, {
      id: "LEGACY_EX_SCIENTIFIC_2",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_SCIENTIFIC",
      major: !0,
      types: [ "LEGACY_EX_SCIENTIFIC_2", "LEGACY_EX_SCIENTIFIC_2_RACE" ],
      ch: "CHALLENGE_SCIENTIFIC_MAJOR_TRIUMPH_2_COMPLETED_EXPLORATION",
      name: {
        en: "On the Revolutions of the Celestial Spheres",
        zh: "天体运行论",
        zhHant: "天體運行論"
      },
      req: {
        en: "Complete the [B]Heliocentric Model[/B] and [B]Discover Calculus[/B] [icon:DEFAULT_PROJECT] Projects.",
        zh: "完成[B]“日心模型”[/B]和[B]“发现微积分”[/B][icon:DEFAULT_PROJECT]项目。",
        zhHant: "完成[B]「日心模型」[/B]和[B]「發現微積分」[/B][icon:DEFAULT_PROJECT]專案。"
      }
    }, {
      id: "LEGACY_EX_SCIENTIFIC_3",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_SCIENTIFIC",
      major: !0,
      types: [ "LEGACY_EX_SCIENTIFIC_3", "LEGACY_EX_SCIENTIFIC_3_RACE" ],
      ch: "CHALLENGE_SCIENTIFIC_MAJOR_TRIUMPH_3_COMPLETED_EXPLORATION",
      name: {
        en: "Tuhuoqiang",
        zh: "突火枪",
        zhHant: "突火槍"
      },
      req: {
        en: "First to research [B]Gunpowder[/B].",
        zh: "率先研究完[B]火药[/B]。",
        zhHant: "最先研發完[B]火藥[/B]。"
      }
    }, {
      id: "LEGACY_EX_SCIENTIFIC_4",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_SCIENTIFIC",
      major: !1,
      types: [ "LEGACY_EX_SCIENTIFIC_4", "LEGACY_EX_SCIENTIFIC_4_RACE" ],
      ch: "CHALLENGE_SCIENTIFIC_MINOR_TRIUMPH_1_COMPLETED_EXPLORATION",
      name: {
        en: "Timurid Renaissance",
        zh: "帖木儿文艺复兴",
        zhHant: "帖木兒文藝復興"
      },
      req: {
        en: "Have [B]7 Universities[/B] in your Empire.",
        zh: "在帝国中拥有[B]7所大学[/B]。",
        zhHant: "在帝國中擁有[B]7所大學[/B]。"
      }
    }, {
      id: "LEGACY_EX_SCIENTIFIC_5",
      age: "AGE_EXPLORATION",
      attr: "LEGACY_SCIENTIFIC",
      major: !1,
      types: [ "LEGACY_EX_SCIENTIFIC_5", "LEGACY_EX_SCIENTIFIC_5_RACE" ],
      ch: "CHALLENGE_SCIENTIFIC_MINOR_TRIUMPH_2_COMPLETED_EXPLORATION",
      name: {
        en: "F=ma",
        zh: "F=ma",
        zhHant: "F=ma"
      },
      req: {
        en: "First to research all [icon:RADIAL_TECH] Technologies and Masteries.",
        zh: "率先研究完所有[icon:RADIAL_TECH]科技和精通。",
        zhHant: "最先研究完所有[icon:RADIAL_TECH]科技和精通。"
      }
    }, {
      id: "LEGACY_MO_CULTURAL_1",
      age: "AGE_MODERN",
      attr: "LEGACY_CULTURAL",
      major: !1,
      types: [ "LEGACY_MO_CULTURAL_1", "LEGACY_MO_CULTURAL_1_RACE" ],
      ch: "CHALLENGE_CULTURE_MINOR_TRIUMPH_1_COMPLETED_MODERN",
      name: {
        en: "Geographic Society",
        zh: "地理学会",
        zhHant: "地理學會"
      },
      req: {
        en: "Display [B]15 [icon:NAR_REW_GREATWORK][/B] Artifacts.",
        zh: "展示[B]15件[icon:NAR_REW_GREATWORK][/B]文物。",
        zhHant: "展示[B]15個[icon:NAR_REW_GREATWORK][/B]文物。"
      }
    }, {
      id: "LEGACY_MO_CULTURAL_2",
      age: "AGE_MODERN",
      attr: "LEGACY_CULTURAL",
      major: !1,
      types: [ "LEGACY_MO_CULTURAL_2", "LEGACY_MO_CULTURAL_2_RACE" ],
      ch: "CHALLENGE_CULTURE_MINOR_TRIUMPH_2_COMPLETED_MODERN",
      name: {
        en: "Wonders of the Modern World",
        zh: "近代世界奇观",
        zhHant: "近代世界的奇觀"
      },
      req: {
        en: "Build [B]6[/B] Modern Age [icon:WONDER] Wonders.",
        zh: "建成[B]6座[/B]近世时代[icon:WONDER]奇观。",
        zhHant: "建造[B]6座[/B]近代[icon:WONDER]奇觀。"
      }
    }, {
      id: "LEGACY_MO_CULTURAL_3",
      age: "AGE_MODERN",
      attr: "LEGACY_CULTURAL",
      major: !1,
      types: [ "LEGACY_MO_CULTURAL_3", "LEGACY_MO_CULTURAL_3_RACE" ],
      ch: "CHALLENGE_CULTURE_MINOR_TRIUMPH_3_COMPLETED_MODERN",
      name: {
        en: "Manifesto",
        zh: "宣言",
        zhHant: "宣言"
      },
      req: {
        en: "First to slot [B]10 [icon:SOCIAL_POLICY][/B] Policies or [icon:TRADITION] Traditions.",
        zh: "率先在槽位中放置[B]10项[icon:SOCIAL_POLICY][/B]政策或[icon:TRADITION]传统。",
        zhHant: "最先在槽位中放入[B]10個[icon:SOCIAL_POLICY][/B]政策或[icon:TRADITION]傳統。"
      }
    }, {
      id: "LEGACY_MO_CULTURAL_4",
      age: "AGE_MODERN",
      attr: "LEGACY_CULTURAL",
      major: !1,
      types: [ "LEGACY_MO_CULTURAL_4", "LEGACY_MO_CULTURAL_4_RACE" ],
      ch: "CHALLENGE_CULTURE_MINOR_TRIUMPH_4_COMPLETED_MODERN",
      name: {
        en: "Wonderland",
        zh: "奇观之地",
        zhHant: "奇境"
      },
      req: {
        en: "Build [B]20 [icon:WONDER][/B] Wonders.",
        zh: "建成[B]20座[icon:WONDER][/B]奇观。",
        zhHant: "建造[B]20座[icon:WONDER][/B]奇觀。"
      }
    }, {
      id: "LEGACY_MO_CULTURAL_5",
      age: "AGE_MODERN",
      attr: "LEGACY_CULTURAL",
      major: !1,
      types: [ "LEGACY_MO_CULTURAL_5", "LEGACY_MO_CULTURAL_5_RACE" ],
      ch: "CHALLENGE_CULTURE_MINOR_TRIUMPH_5_COMPLETED_MODERN",
      name: {
        en: "Zeitgeist",
        zh: "时代精神",
        zhHant: "時代精神"
      },
      req: {
        en: "First to study all generic [icon:RADIAL_CIVICS] Civics and Masteries.",
        zh: "率先研习完所有普通[icon:RADIAL_CIVICS]市政和精通。",
        zhHant: "最先研究完所有一般[icon:RADIAL_CIVICS]市政和精通。"
      }
    }, {
      id: "LEGACY_MO_DIPLOMATIC_1",
      age: "AGE_MODERN",
      attr: "LEGACY_DIPLOMATIC",
      major: !1,
      types: [ "LEGACY_MO_DIPLOMATIC_1", "LEGACY_MO_DIPLOMATIC_1_RACE" ],
      ch: "CHALLENGE_DIPLOMATIC_MINOR_TRIUMPH_1_COMPLETED_MODERN",
      name: {
        en: "To Seek a Newer World",
        zh: "探寻新世界",
        zhHant: "尋求更新的世界"
      },
      req: {
        en: "First to adopt an [icon:NOTIFICATION_IDEOLOGY_CHOSEN] [B]Ideology[/B].",
        zh: "率先采纳一个[icon:NOTIFICATION_IDEOLOGY_CHOSEN][B]意识形态[/B]。",
        zhHant: "最先採用一個[icon:NOTIFICATION_IDEOLOGY_CHOSEN][B]意識形態[/B]。"
      }
    }, {
      id: "LEGACY_MO_DIPLOMATIC_2",
      age: "AGE_MODERN",
      attr: "LEGACY_DIPLOMATIC",
      major: !1,
      types: [ "LEGACY_MO_DIPLOMATIC_2", "LEGACY_MO_DIPLOMATIC_2_RACE" ],
      ch: "CHALLENGE_DIPLOMATIC_MINOR_TRIUMPH_2_COMPLETED_MODERN",
      name: {
        en: "League of Nations",
        zh: "万国联盟",
        zhHant: "萬國聯盟"
      },
      req: {
        en: "Have an [icon:PLAYER_RELATIONSHIP_ALLIANCE] Alliance with [B]half[/B] of the World's Leaders.",
        zh: "与世界上[B]一半[/B]的领袖[icon:PLAYER_RELATIONSHIP_ALLIANCE]结盟。",
        zhHant: "與世界上[B]一半[/B]的領袖締結[icon:PLAYER_RELATIONSHIP_ALLIANCE]同盟關係。"
      }
    }, {
      id: "LEGACY_MO_DIPLOMATIC_3",
      age: "AGE_MODERN",
      attr: "LEGACY_DIPLOMATIC",
      major: !1,
      types: [ "LEGACY_MO_DIPLOMATIC_3" ],
      ch: "CHALLENGE_DIPLOMATIC_MINOR_TRIUMPH_3_COMPLETED_MODERN",
      name: {
        en: "Puppet Master",
        zh: "操盘大师",
        zhHant: "操偶大師"
      },
      req: {
        en: "Become Suzerain of [B]7 [icon:CITYSTATE][/B] City-States.",
        zh: "成为[B]7个[icon:CITYSTATE][/B]城邦的宗主国。",
        zhHant: "成為[B]7個[icon:CITYSTATE][/B]城邦的宗主國。"
      }
    }, {
      id: "LEGACY_MO_DIPLOMATIC_4",
      age: "AGE_MODERN",
      attr: "LEGACY_DIPLOMATIC",
      major: !1,
      types: [ "LEGACY_MO_DIPLOMATIC_4", "LEGACY_MO_DIPLOMATIC_4_RACE" ],
      ch: "CHALLENGE_DIPLOMATIC_MINOR_TRIUMPH_4_COMPLETED_MODERN",
      name: {
        en: "Enigma Code",
        zh: "恩尼格玛密码",
        zhHant: "恩尼格瑪密碼"
      },
      req: {
        en: "Successfully complete [B]15 [icon:ESPIONAGE][/B] Espionage Actions.",
        zh: "成功完成[B]15次[icon:ESPIONAGE][/B]谍报行动。",
        zhHant: "成功完成[B]15項[icon:ESPIONAGE][/B]諜報行動。"
      }
    }, {
      id: "LEGACY_MO_DIPLOMATIC_5",
      age: "AGE_MODERN",
      attr: "LEGACY_DIPLOMATIC",
      major: !1,
      types: [ "LEGACY_MO_DIPLOMATIC_5", "LEGACY_MO_DIPLOMATIC_5_RACE" ],
      ch: "CHALLENGE_DIPLOMATIC_MINOR_TRIUMPH_5_COMPLETED_MODERN",
      name: {
        en: "Brave New World",
        zh: "美丽新世界",
        zhHant: "美麗新世界"
      },
      req: {
        en: "Have [B]250 excess [icon:YIELD_HAPPINESS][/B] in a Settlement.",
        zh: "在一个定居点中拥有[B]250溢出的[icon:YIELD_HAPPINESS][/B]。",
        zhHant: "在一個聚落中擁有[B]250多餘的[icon:YIELD_HAPPINESS][/B]。"
      }
    }, {
      id: "LEGACY_MO_ECONOMIC_1",
      age: "AGE_MODERN",
      attr: "LEGACY_ECONOMIC",
      major: !1,
      types: [ "LEGACY_MO_ECONOMIC_1", "LEGACY_MO_ECONOMIC_1_RACE" ],
      ch: "CHALLENGE_ECONOMIC_MINOR_TRIUMPH_1_COMPLETED_MODERN",
      name: {
        en: "Railroad Tycoon",
        zh: "铁路大亨",
        zhHant: "鐵路大亨"
      },
      req: {
        en: "Score [B]500 [icon:ECONOMIC_VP][/B] GDP by assigning [icon:RADIAL_RESOURCES] Factory Resources.",
        zh: "通过分配[icon:RADIAL_RESOURCES]工厂资源得到[B]500[icon:ECONOMIC_VP][/B]GDP。",
        zhHant: "透過指派[icon:RADIAL_RESOURCES]工廠資源來得到[B]500[icon:ECONOMIC_VP][/B]GDP。"
      }
    }, {
      id: "LEGACY_MO_ECONOMIC_2",
      age: "AGE_MODERN",
      attr: "LEGACY_ECONOMIC",
      major: !1,
      types: [ "LEGACY_MO_ECONOMIC_2", "LEGACY_MO_ECONOMIC_2_RACE" ],
      ch: "CHALLENGE_ECONOMIC_MINOR_TRIUMPH_2_COMPLETED_MODERN",
      name: {
        en: "Wealth of Nations",
        zh: "国富论",
        zhHant: "國富論"
      },
      req: {
        en: "Start [B]12 [icon:TRADE_ROUTE][/B] Trade Routes.",
        zh: "开辟[B]12条[icon:TRADE_ROUTE][/B]贸易路线。",
        zhHant: "開始[B]12條[icon:TRADE_ROUTE][/B]貿易路線。"
      }
    }, {
      id: "LEGACY_MO_ECONOMIC_3",
      age: "AGE_MODERN",
      attr: "LEGACY_ECONOMIC",
      major: !1,
      types: [ "LEGACY_MO_ECONOMIC_3", "LEGACY_MO_ECONOMIC_3_RACE" ],
      ch: "CHALLENGE_ECONOMIC_MINOR_TRIUMPH_3_COMPLETED_MODERN",
      name: {
        en: "Rail Baron",
        zh: "铁路大亨",
        zhHant: "鐵路大亨"
      },
      req: {
        en: "Have [B]12 Rail Stations[/B].",
        zh: "拥有[B]12座火车站[/B]。",
        zhHant: "擁有[B]12座火車站[/B]。"
      }
    }, {
      id: "LEGACY_MO_ECONOMIC_4",
      age: "AGE_MODERN",
      attr: "LEGACY_ECONOMIC",
      major: !1,
      types: [ "LEGACY_MO_ECONOMIC_4", "LEGACY_MO_ECONOMIC_4_RACE" ],
      ch: "CHALLENGE_ECONOMIC_MINOR_TRIUMPH_4_COMPLETED_MODERN",
      name: {
        en: "Dōjima Exchange",
        zh: "堂岛米会所",
        zhHant: "堂島米會所"
      },
      req: {
        en: "Assign [B]60 [icon:RADIAL_RESOURCES][/B] Resources.",
        zh: "分配[B]60[icon:RADIAL_RESOURCES][/B]资源。",
        zhHant: "指派[B]60[icon:RADIAL_RESOURCES][/B]資源。"
      }
    }, {
      id: "LEGACY_MO_ECONOMIC_5",
      age: "AGE_MODERN",
      attr: "LEGACY_ECONOMIC",
      major: !1,
      types: [ "LEGACY_MO_ECONOMIC_5", "LEGACY_MO_ECONOMIC_5_RACE" ],
      ch: "CHALLENGE_ECONOMIC_MINOR_TRIUMPH_5_COMPLETED_MODERN",
      name: {
        en: "Workshop of the World",
        zh: "世界工厂",
        zhHant: "世界的工坊"
      },
      req: {
        en: "Assign [B]30 [icon:RADIAL_RESOURCES][/B] Factory Resources.",
        zh: "分配[B]30[icon:RADIAL_RESOURCES][/B]工厂资源。",
        zhHant: "指派[B]30[icon:RADIAL_RESOURCES][/B]工廠資源。"
      }
    }, {
      id: "LEGACY_MO_EXPANSIONIST_1",
      age: "AGE_MODERN",
      attr: "LEGACY_EXPANSIONIST",
      major: !1,
      types: [ "LEGACY_MO_EXPANSIONIST_1", "LEGACY_MO_EXPANSIONIST_1_RACE" ],
      ch: "CHALLENGE_EXPANSIONIST_MINOR_TRIUMPH_1_COMPLETED_MODERN",
      name: {
        en: "Great Outdoors",
        zh: "广阔天地",
        zhHant: "廣闊天地"
      },
      req: {
        en: "Improve at least one tile on all [icon:NOTIFICATION_DISCOVER_NATURAL_WONDER] Natural Wonders.",
        zh: "改良所有[icon:NOTIFICATION_DISCOVER_NATURAL_WONDER]自然奇观的至少1个地块。",
        zhHant: "改良所有[icon:NOTIFICATION_DISCOVER_NATURAL_WONDER]自然奇觀的至少1個格位。"
      }
    }, {
      id: "LEGACY_MO_EXPANSIONIST_2",
      age: "AGE_MODERN",
      attr: "LEGACY_EXPANSIONIST",
      major: !1,
      types: [ "LEGACY_MO_EXPANSIONIST_2", "LEGACY_MO_EXPANSIONIST_2_RACE" ],
      ch: "CHALLENGE_EXPANSIONIST_MINOR_TRIUMPH_2_COMPLETED_MODERN",
      name: {
        en: "The Sun Never Sets",
        zh: "太阳永不落",
        zhHant: "日不落"
      },
      req: {
        en: "Have [B]27[/B] Settlements.",
        zh: "拥有[B]27个[/B]定居点。",
        zhHant: "擁有[B]27個[/B]聚落。"
      }
    }, {
      id: "LEGACY_MO_EXPANSIONIST_3",
      age: "AGE_MODERN",
      attr: "LEGACY_EXPANSIONIST",
      major: !1,
      types: [ "LEGACY_MO_EXPANSIONIST_3", "LEGACY_MO_EXPANSIONIST_3_RACE" ],
      ch: "CHALLENGE_EXPANSIONIST_MINOR_TRIUMPH_3_COMPLETED_MODERN",
      name: {
        en: "Shock City",
        zh: "震撼城市",
        zhHant: "震撼之城"
      },
      req: {
        en: "Have [B]450 [icon:YIELD_POPULATION][/B] Population.",
        zh: "拥有[B]450[icon:YIELD_POPULATION][/B]人口。",
        zhHant: "擁有[B]450[icon:YIELD_POPULATION][/B]人口。"
      }
    }, {
      id: "LEGACY_MO_EXPANSIONIST_4",
      age: "AGE_MODERN",
      attr: "LEGACY_EXPANSIONIST",
      major: !1,
      types: [ "LEGACY_MO_EXPANSIONIST_4", "LEGACY_MO_EXPANSIONIST_4_RACE" ],
      ch: "CHALLENGE_EXPANSIONIST_MINOR_TRIUMPH_4_COMPLETED_MODERN",
      name: {
        en: "Beep Beep Beep",
        zh: "哔哔声",
        zhHant: "嗶嗶嗶"
      },
      req: {
        en: "First to reveal [B]100%[/B] of the Map.",
        zh: "率先探明[B]100%[/B]的地图。",
        zhHant: "最先揭露[B]100%[/B]的地圖。"
      }
    }, {
      id: "LEGACY_MO_EXPANSIONIST_5",
      age: "AGE_MODERN",
      attr: "LEGACY_EXPANSIONIST",
      major: !1,
      types: [ "LEGACY_MO_EXPANSIONIST_5", "LEGACY_MO_EXPANSIONIST_5_RACE" ],
      ch: "CHALLENGE_EXPANSIONIST_MINOR_TRIUMPH_5_COMPLETED_MODERN",
      name: {
        en: "Megalopolis",
        zh: "特大都市",
        zhHant: "巨型都會"
      },
      req: {
        en: "Have [B]60 [icon:SPECIALIST][/B] Specialists.",
        zh: "拥有[B]60名[icon:SPECIALIST][/B]专家。",
        zhHant: "擁有[B]60名[icon:SPECIALIST][/B]專家。"
      }
    }, {
      id: "LEGACY_MO_MILITARISTIC_1",
      age: "AGE_MODERN",
      attr: "LEGACY_MILITARISTIC",
      major: !1,
      types: [ "LEGACY_MO_MILITARISTIC_1", "LEGACY_MO_MILITARISTIC_1_RACE" ],
      ch: "CHALLENGE_MILITARISTIC_MINOR_TRIUMPH_1_COMPLETED_MODERN",
      name: {
        en: "Moral Imperative",
        zh: "道德律令",
        zhHant: "道德責任"
      },
      req: {
        en: "Conquer and hold [B]5[/B] Settlements of an opposing [icon:NOTIFICATION_IDEOLOGY_CHOSEN] [B]Ideology[/B].",
        zh: "从[icon:NOTIFICATION_IDEOLOGY_CHOSEN][B]意识形态[/B]对立的文明手中征服并保留[B]5座[/B]定居点。",
        zhHant: "征服並保留敵對[icon:NOTIFICATION_IDEOLOGY_CHOSEN][B]意識形態[/B]的[B]5個[/B]聚落。"
      }
    }, {
      id: "LEGACY_MO_MILITARISTIC_2",
      age: "AGE_MODERN",
      attr: "LEGACY_MILITARISTIC",
      major: !1,
      types: [ "LEGACY_MO_MILITARISTIC_2", "LEGACY_MO_MILITARISTIC_2_RACE" ],
      ch: "CHALLENGE_MILITARISTIC_MINOR_TRIUMPH_2_COMPLETED_MODERN",
      name: {
        en: "Terror from Above",
        zh: "空中威慑",
        zhHant: "天降恐懼"
      },
      req: {
        en: "Have a Level 6 Squadron or Aerodrome [icon:UNIT_ARMY_COMMANDER] Commander.",
        zh: "拥有一位6级的飞行队或航空港[icon:UNIT_ARMY_COMMANDER]指挥官。",
        zhHant: "擁有一個6級的飛行中隊或航空港[icon:UNIT_ARMY_COMMANDER]指揮官。"
      }
    }, {
      id: "LEGACY_MO_MILITARISTIC_3",
      age: "AGE_MODERN",
      attr: "LEGACY_MILITARISTIC",
      major: !1,
      types: [ "LEGACY_MO_MILITARISTIC_3", "LEGACY_MO_MILITARISTIC_3_RACE" ],
      ch: "CHALLENGE_MILITARISTIC_MINOR_TRIUMPH_3_COMPLETED_MODERN",
      name: {
        en: "Friendly Fire",
        zh: "自相残杀",
        zhHant: "誤傷友軍"
      },
      req: {
        en: "Conquer [B]5[/B] Settlements of Civilizations that share your [icon:NOTIFICATION_IDEOLOGY_CHOSEN] [B]Ideology[/B].",
        zh: "从[icon:NOTIFICATION_IDEOLOGY_CHOSEN][B]意识形态[/B]相同的文明手中征服[B]5座[/B]定居点。",
        zhHant: "征服與你分享[icon:NOTIFICATION_IDEOLOGY_CHOSEN][B]意識形態[/B]的文明的[B]5個[/B]聚落。"
      }
    }, {
      id: "LEGACY_MO_MILITARISTIC_4",
      age: "AGE_MODERN",
      attr: "LEGACY_MILITARISTIC",
      major: !1,
      types: [ "LEGACY_MO_MILITARISTIC_4", "LEGACY_MO_MILITARISTIC_4_RACE" ],
      ch: "CHALLENGE_MILITARISTIC_MINOR_TRIUMPH_4_COMPLETED_MODERN",
      name: {
        en: "Blitzkrieg",
        zh: "闪电战",
        zhHant: "閃擊戰"
      },
      req: {
        en: "First to conquer a [icon:NOTIFICATION_SELECT_CAPITAL] Capital.",
        zh: "率先征服一座[icon:NOTIFICATION_SELECT_CAPITAL]首都。",
        zhHant: "最先征服一個[icon:NOTIFICATION_SELECT_CAPITAL]首都。"
      }
    }, {
      id: "LEGACY_MO_MILITARISTIC_5",
      age: "AGE_MODERN",
      attr: "LEGACY_MILITARISTIC",
      major: !1,
      types: [ "LEGACY_MO_MILITARISTIC_5", "LEGACY_MO_MILITARISTIC_5_RACE" ],
      ch: "CHALLENGE_MILITARISTIC_MINOR_TRIUMPH_5_COMPLETED_MODERN",
      name: {
        en: "Enemy of the World",
        zh: "世界之敌",
        zhHant: "世界公敵"
      },
      req: {
        en: "Be at War with all Civilizations.",
        zh: "与所有文明交战。",
        zhHant: "與所有文明交戰。"
      }
    }, {
      id: "LEGACY_MO_SCIENTIFIC_1",
      age: "AGE_MODERN",
      attr: "LEGACY_SCIENTIFIC",
      major: !1,
      types: [ "LEGACY_MO_SCIENTIFIC_1", "LEGACY_MO_SCIENTIFIC_1_RACE" ],
      ch: "CHALLENGE_SCIENTIFIC_MINOR_TRIUMPH_1_COMPLETED_MODERN",
      name: {
        en: "Dawn of the Space Race",
        zh: "太空竞赛开幕",
        zhHant: "太空競賽的黎明"
      },
      req: {
        en: "First to research [B]Flight[/B].",
        zh: "率先研究完[B]飞行[/B]。",
        zhHant: "最先研發完[B]飛行[/B]。"
      }
    }, {
      id: "LEGACY_MO_SCIENTIFIC_2",
      age: "AGE_MODERN",
      attr: "LEGACY_SCIENTIFIC",
      major: !1,
      types: [ "LEGACY_MO_SCIENTIFIC_2", "LEGACY_MO_SCIENTIFIC_2_RACE" ],
      ch: "CHALLENGE_SCIENTIFIC_MINOR_TRIUMPH_2_COMPLETED_MODERN",
      name: {
        en: "Miracle over the Mojave",
        zh: "莫哈韦奇迹",
        zhHant: "莫哈維奇蹟"
      },
      req: {
        en: "First to complete the [B]Break the Sound Barrier[/B] [icon:DEFAULT_PROJECT] Project.",
        zh: "率先完成[B]“打破音障”[/B][icon:DEFAULT_PROJECT]项目。",
        zhHant: "最先完成[B]「突破音障」[/B][icon:DEFAULT_PROJECT] 專案。"
      }
    }, {
      id: "LEGACY_MO_SCIENTIFIC_3",
      age: "AGE_MODERN",
      attr: "LEGACY_SCIENTIFIC",
      major: !1,
      types: [ "LEGACY_MO_SCIENTIFIC_3", "LEGACY_MO_SCIENTIFIC_3_RACE" ],
      ch: "CHALLENGE_SCIENTIFIC_MINOR_TRIUMPH_3_COMPLETED_MODERN",
      name: {
        en: "Beyond the Sword",
        zh: "超越剑锋",
        zhHant: "超越刀劍"
      },
      req: {
        en: "First to complete the [icon:DEFAULT_PROJECT] Project [B]Operation Ivy[/B].",
        zh: "率先完成[B]常春藤行动[/B][icon:DEFAULT_PROJECT]项目。",
        zhHant: "最先完成[B]「常春藤行動」[/B][icon:DEFAULT_PROJECT]專案。"
      }
    }, {
      id: "LEGACY_MO_SCIENTIFIC_4",
      age: "AGE_MODERN",
      attr: "LEGACY_SCIENTIFIC",
      major: !1,
      types: [ "LEGACY_MO_SCIENTIFIC_4", "LEGACY_MO_SCIENTIFIC_4_RACE" ],
      ch: "CHALLENGE_SCIENTIFIC_MINOR_TRIUMPH_4_COMPLETED_MODERN",
      name: {
        en: "Compound Yield",
        zh: "复合产出",
        zhHant: "複合產出"
      },
      req: {
        en: "Have [B]5 [icon:CITY_URBAN][/B] non-City Center Districts with [B]120+ Yield[/B].",
        zh: "拥有[B]5个[icon:CITY_URBAN][/B][B]产量120+[/B]的非市中心区块。",
        zhHant: "擁有[B]5個[icon:CITY_URBAN][/B][B]收益120+[/B]的非城市中心區域。"
      }
    }, {
      id: "LEGACY_MO_SCIENTIFIC_5",
      age: "AGE_MODERN",
      attr: "LEGACY_SCIENTIFIC",
      major: !1,
      types: [ "LEGACY_MO_SCIENTIFIC_5", "LEGACY_MO_SCIENTIFIC_5_RACE" ],
      ch: "CHALLENGE_SCIENTIFIC_MINOR_TRIUMPH_5_COMPLETED_MODERN",
      name: {
        en: "E=mc²",
        zh: "E=mc²",
        zhHant: "E=mc²"
      },
      req: {
        en: "First to research all [icon:RADIAL_TECH] Technologies and Masteries.",
        zh: "率先研究完所有[icon:RADIAL_TECH]科技和精通。",
        zhHant: "最先研究完所有[icon:RADIAL_TECH]科技和精通。"
      }
    } ]
  };
  root.ozqChronicleTriumphs = data, "undefined" != typeof module && module.exports && (module.exports = data);
}("undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : this);