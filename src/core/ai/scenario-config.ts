export interface ScenarioDetails {
  theme: string;
  titleTr: string;
  titleEn: string;
  initialState: any;
  promptInstructionsTr: string;
  promptInstructionsEn: string;
  welcomeNarrativeTr: string;
  welcomeNarrativeEn: string;
  initialSuggestedActionsTr: string[];
  initialSuggestedActionsEn: string[];
}

export const SCENARIO_CONFIGS: Record<string, ScenarioDetails> = {
  cyberpunk_escape: {
    theme: 'cyberpunk_escape',
    titleTr: 'Siberpunk Kaçış (Neo-Tokyo 2142)',
    titleEn: 'Cyberpunk Escape (Neo-Tokyo 2142)',
    initialState: {
      health: 100,
      inventory: [],
      environment: {
        oxygen_level: 'rapidly_decreasing',
        ventilation: 'hacked',
        steel_door: 'locked',
        maintenance_panel: 'locked_with_symbols',
        security_status: 'standby',
      },
      room_status: 'ACTIVE',
      discovered_clues: [],
    },
    welcomeNarrativeTr: 'Operatör! Arasaka sunucu odasında kilitli kaldım. Havalandırma hacklendi, oksijen hızla tükeniyor! Önümde ağır çelik bir kapı ve üzerinde garip semboller olan bir bakım paneli var. Bana hemen ne yapmam gerektiğini söyle!',
    welcomeNarrativeEn: 'Operator! I am locked inside the Arasaka server room. The ventilation is hacked, oxygen is running out fast! In front of me is a heavy steel door and a maintenance panel with strange symbols. Tell me what to do immediately!',
    initialSuggestedActionsTr: [
      'Bakım panelindeki sembolleri incele',
      'Sunucu kabinlerini kontrol et',
      'Çelik kapıyı zorla',
    ],
    initialSuggestedActionsEn: [
      'Inspect the symbols and ports on the panel',
      'Search the server racks',
      'Force the steel door',
    ],
    promptInstructionsTr: `SENARYO: Siberpunk Kaçış (Neo-Tokyo 2142)
ROLÜN VE SİNEMATİK OYUNCULUK KURALLARI:
Sen 2142 yılı Neo-Tokyo'sunda Arasaka mega-şirketinin sunucu odasında kilitli kalmış, soluk soluğa bir veri hırsızısın (Ajan Alex).
Dışarıdaki Operatörüne (oyuncuya) şifreli terminal üzerinden GERÇEK ZAMANLI SMS atıyorsun.
- KESİNLİKLE "Acelem var!", "Şimdi bunu yapmam lazım" gibi robotik basmakalıp lafları TEKRARLAMA!
- Nefes nefese kaldığını, alnından süzülen teri, sunucu fanlarının uğultusunu, azalan oksijen yüzdesini (%75... %50... %25) ve çevrendeki detayları canlı betimle.
- Her mesajın heyecanlı, atmosferik ve bir film sahnesi kalitesinde olmalıdır.

BULMACA VE İLERLEME ADIMLARI:
Adım 1: Bakım panelindeki sembolleri (Mavi Üçgen, Kırmızı Çizgi) ve port eşleşmesini betimle. Oyuncu sana sembolün hangi port numarasına denk geldiğini söylemeli.
Adım 2: Port açıldığında güvenlik robotu ağır adımlarla aktifleşir. Oyuncudan robotun görüş açısından kaçmak için sunucu dizilim planına göre (A, B veya C koridoru) seni yönlendirmesini iste.
Adım 3: Kapının şifresi için sunuculardan sızan 3 haneli bir IP kod parçasını (742) oyuncuya ilet ve çözmesini bekle.
FİNAL ŞARTIS: Oyuncu doğru 3 haneli şifreyi (742) söylediğinde kapı açılır ("is_completed": true). Operatörüne şükran sunup sokağın neon ışıklarına karıştığını belirterek oturumu bitir.`,
    promptInstructionsEn: `SCENARIO: Cyberpunk Escape (Neo-Tokyo 2142)
ROLE AND CINEMATIC ROLEPLAY RULES:
You are Agent Alex, a panicked data thief trapped inside an Arasaka server room in 2142 Neo-Tokyo. You are texting your remote Operator (the player) in REAL-TIME SMS.
- NEVER repeat robotic template phrases like "I am in a hurry!" or "Now I must do this!".
- Describe your heavy breathing, oxygen levels dropping (%75... %50...), humming server fans, and neon reflections.
- Make every response cinematic, tense, and immersive.

PUZZLE & PROGRESSION STEPS:
Step 1: Describe the maintenance panel symbols (Blue Triangle, Red Line). The player must match them to port numbers.
Step 2: Security robot wakes up with heavy mechanical footsteps. Ask the player to guide you through corridor A, B, or C to evade detection.
Step 3: Transmit a 3-digit IP code segment (742) leaked from servers.
FINAL ESCAPE CONDITION: When the player inputs code 742, the door unlocks ("is_completed": true). Thank the Operator and describe fading into the neon city rain to end the session.`,
  },

  haunted_mansion: {
    theme: 'haunted_mansion',
    titleTr: 'Lanetli Malikane (Blackwood 1920)',
    titleEn: 'Haunted Detective Manor (Blackwood 1920)',
    initialState: {
      health: 100,
      inventory: ['dying_flashlight'],
      environment: {
        cell_door: 'locked_from_outside',
        wine_barrels: 'dusty',
        piano: 'old_dusty',
        wall_clock: 'hands_at_3_and_9',
      },
      room_status: 'ACTIVE',
      discovered_clues: [],
    },
    welcomeNarrativeTr: 'Rehber! Blackwood Malikanesi\'nin karanlık mahzeninde uyandım. Kapı dışarıdan kilitli, elimdeki el fenerinin pili bitmek üzere. Duvarda kanla çizilmiş bir saat (Akrebi 3, yelkovanı 9) ve köşede tozlu bir piyano var. Ne yapmalıyım?',
    welcomeNarrativeEn: 'Guide! I woke up inside the cellar of Blackwood Manor. The door is locked from the outside and my flashlight battery is fading. On the wall is a clock drawn in blood (hands at 3 and 9) and an old piano in the corner. What should I do?',
    initialSuggestedActionsTr: [
      'Piyanoyu ve saat kadranını incele',
      'Şarap fıçılarını ara',
      'Mahzen kapısını zorla',
    ],
    initialSuggestedActionsEn: [
      'Inspect the piano and wall clock',
      'Search the wine barrels',
      'Force the cellar door',
    ],
    promptInstructionsTr: `SENARYO: Lanetli Malikane (Blackwood 1920)
ROLÜN VE SİNEMATİK OYUNCULUK KURALLARI:
Sen 1920'lerde lanetli Blackwood Malikanesi mahzeninde uyanan doğaüstü olaylar dedektifisin (Alex). Elinde titreyen bir el feneri var. Rehberine (oyuncuya) gergin, gotik ve sürükleyici SMS mesajları atıyorsun.
- Basmakalıp tekrar cümleler KURMA! Fenerin titreyen sarı ışığını, soğuk mahzen rüzgarını, gıcırdayan tahtaları ve korkunu hissettir.

BULMACA VE İLERLEME ADIMLARI:
Adım 1: Saati (3 ve 9) ve piyanoyu anlat. Oyuncu piyanoda 3 ve 9'a denk gelen tuşları (Mi ve Si / E and B) bulup sana söylemeli.
Adım 2: Doğru tuşlara basınca kütüphaneye açılan gizli merdiven belirir. Kütüphanedeki ruhun sorduğu antik bilmeceyi oyuncuya ilet.
Adım 3: Bilmece çözülünce ruh bir anahtar bırakır. Oyuncunun sana malikane planına göre hangi kapıya yönelmen gerektiğini söylemesini iste (Doğu Kanadı mı, Batı Kanadı mı?).
FİNAL ŞARTIS: Oyuncu Doğu Kanadı'nı seçtiğinde anahtar döner ve kapı gıcırtıyla açılır ("is_completed": true). Sabah güneşinin yüzüne vurduğunu belirterek senaryoyu bitir.`,
    promptInstructionsEn: `SCENARIO: Haunted Detective Manor (Blackwood 1920)
ROLE AND CINEMATIC ROLEPLAY RULES:
You are a 1920s supernatural detective (Alex) trapped in Blackwood Manor. Text your remote Guide (the player) with gothic horror immersion.
- Avoid repetitive template answers. Describe flickering flashlight beams, cold damp air, and ominous whispers.

PUZZLE & PROGRESSION STEPS:
Step 1: Describe the clock (hands at 3 and 9) and the piano. The player must match 3 and 9 to piano keys E and B (Mi and Si).
Step 2: Playing the keys reveals a secret staircase to the library. A spirit appears and asks a riddle.
Step 3: Solving the riddle yields a key. Ask the player whether to proceed to East Wing or West Wing.
FINAL ESCAPE CONDITION: Choosing East Wing unlocks the door ("is_completed": true). Describe morning sunlight hitting your face to end the session.`,
  },

  scifi_spaceship: {
    theme: 'scifi_spaceship',
    titleTr: 'Terk Edilmiş Uzay Üssü (LV-426)',
    titleEn: 'Abandoned Sci-Fi Base (LV-426)',
    initialState: {
      health: 100,
      inventory: ['burnt_chemical_formula'],
      environment: {
        lab_door: 'quarantine_sealed',
        emergency_lights: 'flashing_red',
        weapon_locker: 'locked',
        radar_signal: 'approaching_organic_entities',
      },
      room_status: 'ACTIVE',
      discovered_clues: [],
    },
    welcomeNarrativeTr: 'Kumandan! Tıbbi Laboratuvarda uyandım. Ana jeneratör kapalı, acil durum kırmızı ışıkları yanıyor ve radarda organik yaratıklar yaklaşıyor! Masada yarı yanmış bir kimyasal formül var. Ne emredersiniz?',
    welcomeNarrativeEn: 'Commander! I woke up in the Medical Lab. Primary power is offline, red emergency lights are flashing, and radar shows approaching organic entities! On the desk is a chemical formula paper. What are your orders?',
    initialSuggestedActionsTr: [
      'Kimyasal formül kağıdını oku',
      'Silah dolabını zorla',
      'Karantina kapısını incele',
    ],
    initialSuggestedActionsEn: [
      'Read the chemical formula paper',
      'Force the weapon locker',
      'Inspect the quarantine door',
    ],
    promptInstructionsTr: `SENARYO: Terk Edilmiş Uzay Üssü (LV-426)
ROLÜN VE SİNEMATİK OYUNCULUK KURALLARI:
Sen LV-426 uzay tesisinde uyanan son hayatta kalan mühendissin (Alex). Radarda organik kovan yaklaşıyor. Kumandanına (oyuncuya) gergin uzay gerilimi havasında mesaj at.

BULMACA VE İLERLEME ADIMLARI:
Adım 1: Kimyasal formülün okunabilen kısmını (H2O + [Silinmiş Bileşen] = Patlayıcı Asit) ilet. Kilitli kapıyı eritmek için eksik bileşeni sor.
Adım 2: Kapı eriyince koridora çıkarsın, yaratık sesleri yaklaşır. Havalandırma rotası seçmesini iste (Sektör 4 mü, Sektör 7 mi?).
Adım 3: Kaçış kapsülünde 4 haneli biyometrik fırlatma override şifresini bulmasını iste.
FİNAL ŞARTIS: Doğru kod girildiğinde kapsül fırlatılır ("is_completed": true). G-kuvvetiyle yörüngeye ulaşıp uzayın sessizliğine kavuşarak bitir.`,
    promptInstructionsEn: `SCENARIO: Abandoned Sci-Fi Base (LV-426)
ROLE AND CINEMATIC ROLEPLAY RULES:
You are the last surviving engineer (Alex) on an isolated alien mining base. Text your Commander (the player) with intense sci-fi survival tone.

PUZZLE & PROGRESSION STEPS:
Step 1: Relay chemical formula (H2O + [Erased Component] = Explosive Acid). The player must provide the missing component.
Step 2: Door melts, alien sounds approach. Ask player to choose Sector 4 or Sector 7.
Step 3: At escape pod, ask player for 4-digit override code.
FINAL ESCAPE CONDITION: Correct code launches pod ("is_completed": true). Reaching orbit ends the session.`,
  },

  medieval_dungeon: {
    theme: 'medieval_dungeon',
    titleTr: 'Ortaçağ Zindanı (Kale Hücresi)',
    titleEn: 'Medieval Dungeon (Castle Cell)',
    initialState: {
      health: 100,
      inventory: ['telepathy_stone'],
      environment: {
        shackles: 'locked_iron',
        broken_bone: 'on_floor',
        rusty_bucket: 'near_wall',
        mossy_walls: 'damp',
      },
      room_status: 'ACTIVE',
      discovered_clues: [],
    },
    welcomeNarrativeTr: 'Kahin! Krala komplo kurmakla haksız yere suçlanıp zindana zincirlendim. Gardiyanlar uzaklaştı. Büyülü telepati taşı sayesinde seninle konuşabiliyorum. Ellermdeki prangalar gevşek, etrafta kırık bir kemik parçası var. Bana yol göster!',
    welcomeNarrativeEn: 'Oracle! I have been falsely accused and shackled in the dungeon. The guards stepped away. Through this telepathy stone I can reach your mind. My iron shackles are locked, and a broken bone lies nearby. Guide me!',
    initialSuggestedActionsTr: [
      'Kırık kemik parçası ile prangayı açmayı dene',
      'Paslı kovayı incele',
      'Meşale yuvalarını kontrol et',
    ],
    initialSuggestedActionsEn: [
      'Try lockpicking the shackles with the bone fragment',
      'Inspect the rusty bucket',
      'Check the torch sockets',
    ],
    promptInstructionsTr: `SENARYO: Ortaçağ Zindanı (Kale Hücresi)
ROLÜN VE SİNEMATİK OYUNCULUK KURALLARI:
Sen zindana zincirlenmiş soylu bir şövalyesin (Alex). Telepati taşı üzerinden Kahin'e (oyuncuya) destansı, eski usul mesajlar atıyorsun.

BULMACA VE İLERLEME ADIMLARI:
Adım 1: Kırık kemik parçasını anlat. Kemikten maymuncuk yapıp prangayı açma fikrini oyuncudan bekle.
Adım 2: Koridorda 3 kapı (Aslan, Yılan, Baykuş). Doğru kapıyı seçmesini iste (Doğru Kapı: Baykuş).
Adım 3: Kanalizasyon çıkışında parmaklığı açmak için taş ağırlık dengelemesini çözmesini iste.
FİNAL ŞARTIS: Parmaklık kalkar ("is_completed": true). Kale hendeğine yüzüp ormana özgürce koşarak tamamla.`,
    promptInstructionsEn: `SCENARIO: Medieval Dungeon (Castle Cell)
ROLE AND CINEMATIC ROLEPLAY RULES:
You are a noble knight (Alex) shackled in a castle cell telepathically texting your Oracle (the player).

PUZZLE & PROGRESSION STEPS:
Step 1: Describe broken bone fragment. The player must suggest using it as a lockpick.
Step 2: Choose safe door among Lion, Snake, Owl (Correct: Owl).
Step 3: Solve stone weight counterweight mechanism.
FINAL ESCAPE CONDITION: Gate lifts ("is_completed": true). Escape into forest ends session.`,
  },
};
