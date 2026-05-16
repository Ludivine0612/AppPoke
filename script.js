// 1. VARIABLES GLOBALES ET DICTIONNAIRES
let pokedexTraduction = {}; // Contiendra TOUS les noms français ET anglais liés à leur ID (ex: "dracaufeu": 6, "charizard": 6)
let lastCaught = []; 
let currentQuizId = null;
let victoires = 0;
let defaites = 0;

let progressionParRegion = {
    "1-151": new Set(),
    "152-251": new Set(),
    "252-386": new Set(),
    "387-493": new Set(),
    "494-649": new Set(),
    "650-721": new Set(),
    "722-809": new Set(),
    "810-905": new Set(),
    "906-1025": new Set()
};

// Table des types en Français (Forces et Faiblesses)
const tableTypesFR = {
    "NORMAL": { faiblesses: ["COMBAT"], forces: [] },
    "FEU": { faiblesses: ["EAU", "SOL", "ROCHE"], forces: ["PLANTE", "GLACE", "INSECTE", "ACIER"] },
    "EAU": { faiblesses: ["PLANTE", "ELECTRIK"], forces: ["FEU", "SOL", "ROCHE"] },
    "PLANTE": { faiblesses: ["FEU", "GLACE", "POISON", "VOL", "INSECTE"], forces: ["EAU", "SOL", "ROCHE"] },
    "ELECTRIK": { faiblesses: ["SOL"], forces: ["EAU", "VOL"] },
    "GLACE": { faiblesses: ["FEU", "COMBAT", "ROCHE", "ACIER"], forces: ["PLANTE", "SOL", "VOL", "DRAGON"] },
    "COMBAT": { faiblesses: ["VOL", "PSY", "FEE"], forces: ["NORMAL", "GLACE", "ROCHE", "TÉNÈBRES", "ACIER"] },
    "POISON": { faiblesses: ["SOL", "PSY"], forces: ["PLANTE", "FEE"] },
    "SOL": { faiblesses: ["EAU", "PLANTE", "GLACE"], forces: ["FEU", "ELECTRIK", "POISON", "ROCHE", "ACIER"] },
    "VOL": { faiblesses: ["ELECTRIK", "GLACE", "ROCHE"], forces: ["PLANTE", "COMBAT", "INSECTE"] },
    "PSY": { faiblesses: ["INSECTE", "SPECTRE", "TÉNÈBRES"], forces: ["COMBAT", "POISON"] },
    "INSECTE": { faiblesses: ["FEU", "VOL", "ROCHE"], forces: ["PLANTE", "PSY", "TÉNÈBRES"] },
    "ROCHE": { faiblesses: ["EAU", "PLANTE", "COMBAT", "SOL", "ACIER"], forces: ["FEU", "GLACE", "VOL", "INSECTE"] },
    "SPECTRE": { faiblesses: ["SPECTRE", "TÉNÈBRES"], forces: ["PSY", "SPECTRE"] },
    "DRAGON": { faiblesses: ["GLACE", "DRAGON", "FEE"], forces: ["DRAGON"] },
    "TÉNÈBRES": { faiblesses: ["COMBAT", "INSECTE", "FEE"], forces: ["PSY", "SPECTRE"] },
    "ACIER": { faiblesses: ["FEU", "COMBAT", "SOL"], forces: ["GLACE", "ROCHE", "FEE"] },
    "FEE": { faiblesses: ["POISON", "ACIER"], forces: ["COMBAT", "DRAGON", "TÉNÈBRES"] }
};

const dicoTypes = {
    grass: "PLANTE", poison: "POISON", fire: "FEU", water: "EAU", bug: "INSECTE", 
    normal: "NORMAL", electric: "ELECTRIK", ground: "SOL", fairy: "FEE", fighting: "COMBAT", 
    psychic: "PSY", rock: "ROCHE", ghost: "SPECTRE", ice: "GLACE", dragon: "DRAGON", 
    flying: "VOL", steel: "ACIER", dark: "TÉNÈBRES"
};

// 2. CHARGEMENT AUTOMATIQUE DES TRADUCTIONS (1025 POKÉMON)
async function chargerDonnees() {
    try {
        console.log("Traduction du Pokédex en cours...");
        
        // On récupère la liste complète des espèces (contient les noms anglais et les urls)
        const response = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=1025');
        const data = await response.json();
        
        // Pour aller TRÈS vite sans bloquer le navigateur, on charge les noms anglais d'abord
        data.results.forEach((pokemon, index) => {
            const id = index + 1;
            pokedexTraduction[pokemon.name] = id; // ex: pokedexTraduction["bulbasaur"] = 1
        });

        /* OPTIMISATION HISTORIQUE : Au lieu de faire 1025 requêtes lentes, on utilise un fichier de secours 
           contenant les correspondances FR si l'utilisateur cherche en français complet. 
           Pour garantir que TOUT fonctionne immédiatement, nous téléchargeons directement une base FR 
           ou appliquons une méthode hybride efficace. */
        const resFr = await fetch('https://raw.githubusercontent.com/manon-rgnr/pokedex-fr/main/pokedex.json').catch(() => null);
        if (resFr && resFr.ok) {
            const dataFr = await resFr.json();
            dataFr.forEach(p => {
                let nomNettoye = p.name.fr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
                pokedexTraduction[nomNettoye] = p.id;
            });
        } else {
            // Dictionnaire de secours ultra-rapide des principaux Pokémon français complexes si GitHub est inaccessible
const backupFr = {
// --- KANTO (1 - 151) ---
  1: "Bulbizarre", 2: "Herbizarre", 3: "Florizarre", 4: "Salamèche", 5: "Reptincel", 6: "Dracaufeu",
  7: "Carapuce", 8: "Carabaffe", 9: "Tortank", 10: "Chenipan", 11: "Chrysacier", 12: "Papilusion",
  13: "Aspicot", 14: "Coconfort", 15: "Dardargnan", 16: "Roucool", 17: "Roucoups", 18: "Roucarnage",
  19: "Rattata", 20: "Rattatac", 21: "Piafabec", 22: "Rapasdepic", 23: "Abo", 24: "Arbok", 25: "Pikachu",
  26: "Raichu", 27: "Sabelette", 28: "Sablaireau", 29: "Nidoran♀", 30: "Nidorina", 31: "Nidoqueen",
  32: "Nidoran♂", 33: "Nidorino", 34: "Nidoking", 35: "Mélofée", 36: "Mélodelfe", 37: "Goupix",
  38: "Feunard", 39: "Rondoudou", 40: "Grodoudou", 41: "Nosferapti", 42: "Nosferalto", 43: "Mystherbe",
  44: "Ortide", 45: "Rafflezia", 46: "Paras", 47: "Parasect", 48: "Mimitoss", 49: "Aéromite",
  50: "Taupiqueur", 51: "Triopikeur", 52: "Miaouss", 53: "Persian", 54: "Psykokwak", 55: "Akwakwak",
  56: "Férosinge", 57: "Colossinge", 58: "Caninos", 59: "Arcanin", 60: "Ptitard", 61: "Têtarte",
  62: "Tartard", 63: "Abra", 64: "Kadabra", 65: "Alakazam", 66: "Machoc", 67: "Machopeur",
  68: "Mackogneur", 69: "Chétiflor", 70: "Boustiflor", 71: "Empiflor", 72: "Tentacool", 73: "Tentacruel",
  74: "Racaillou", 75: "Gravalanch", 76: "Golem", 77: "Ponyta", 78: "Galopa", 79: "Ramoloss",
  80: "Flagadoss", 81: "Magnéti", 82: "Magnéton", 83: "Canarticho", 84: "Doduo", 85: "Dodrio",
  86: "Otaria", 87: "Lamantine", 88: "Tadmorv", 89: "Grotadmorv", 90: "Kokiyas", 91: "Crustabri",
  92: "Fantominus", 93: "Spectrum", 94: "Ectoplasma", 95: "Onix", 96: "Soporifik", 97: "Hypnomade",
  98: "Krabby", 99: "Krabboss", 100: "Voltorbe", 101: "Électrode", 102: "Noeunoeuf", 103: "Noadkoko",
  104: "Osselet", 105: "Ossatueur", 106: "Kicklee", 107: "Tygnon", 108: "Excelangue", 109: "Smogo",
  110: "Smogogo", 111: "Rhinocorn", 112: "Rhinoféros", 113: "Leveinard", 114: "Saquedeneu", 115: "Kangourex",
  116: "Hypocéan", 117: "Hyporoi", 118: "Poisseneon", 119: "Poissoroy", 120: "Stari", 121: "Staross",
  122: "M. Mime", 123: "Insécateur", 124: "Lippoutou", 125: "Élektek", 126: "Magmar", 127: "Scarabrute",
  128: "Tauros", 129: "Magicarpe", 130: "Léviator", 131: "Lokhlass", 132: "Métamorph", 133: "Évoli",
  134: "Aquali", 135: "Voltali", 136: "Pyroli", 137: "Porygon", 138: "Amonita", 139: "Amonistar",
  140: "Kabuto", 141: "Kabutops", 142: "Ptéra", 143: "Ronflex", 144: "Artikodin", 145: "Électhor",
  146: "Sulfura", 147: "Minidraco", 148: "Draco", 149: "Dracolosse", 150: "Mewtwo", 151: "Mew",

  // --- JOHTO (152 - 251) ---
  152: "Germignon", 153: "Macronium", 154: "Méganium", 155: "Héricendre", 156: "Feurisson", 157: "Typhlosion",
  158: "Kaiminus", 159: "Crocrodil", 160: "Aligatueur", 161: "Furet", 162: "Fouinar", 163: "Hoothoot",
  164: "Noarfang", 165: "Coxy", 166: "Coxyclaque", 167: "Mimigal", 168: "Migalos", 169: "Nostenfer",
  170: "Loupio", 171: "Lanturn", 172: "Pichu", 173: "Mélo", 174: "Toudoudou", 175: "Togepi",
  176: "Togetic", 177: "Natu", 178: "Xatu", 179: "Wattouat", 180: "Lainergie", 181: "Pharamp",
  182: "Joliflor", 183: "Marill", 184: "Azumarill", 185: "Simularbre", 186: "Tarpaud", 187: "Granivol",
  188: "Floravol", 189: "Cotovol", 190: "Capumain", 191: "Tournegrin", 192: "Héliatronc", 193: "Yanma",
  194: "Axoloto", 195: "Maraiste", 196: "Mentali", 197: "Noctali", 198: "Cornèbre", 199: "Roigada",
  200: "Feuforêve", 201: "Zarbi", 202: "Qulbutoké", 203: "Girafarig", 204: "Pomdepik", 205: "Forretress",
  206: "Insolourdo", 207: "Scorplane", 208: "Steelix", 209: "Snubbull", 210: "Granbull", 211: "Qwilfish",
  212: "Cizayox", 213: "Caratroc", 214: "Scarhino", 215: "Farfuret", 216: "Teddiursa", 217: "Ursaring",
  218: "Limagma", 219: "Volcaropod", 220: "Marcacrin", 221: "Cochignon", 222: "Corayon", 223: "Rémoraid",
  224: "Octillery", 225: "Cadoizo", 226: "Démanta", 227: "Airmure", 228: "Malosse", 229: "Démolosse",
  230: "Hyporoi", 231: "Phanpy", 232: "Donphan", 233: "Porygon2", 234: "Cerfrousse", 235: "Queulorior",
  236: "Debugant", 237: "Kapoera", 238: "Lippouti", 239: "Élekid", 240: "Magby", 241: "Écremeuh",
  242: "Leuphorie", 243: "Raikou", 244: "Entei", 245: "Suicune", 246: "Embrylex", 247: "Ymphect",
  248: "Tyranocif", 249: "Lugia", 250: "Ho-Oh", 251: "Célébi",

  // --- HOENN (252 - 386) ---
  252: "Arcko", 253: "Massko", 254: "Jungko", 255: "Poussifeu", 256: "Galifeu", 257: "Braségali",
  258: "Gobou", 259: "Flobio", 260: "Laggron", 261: "Médhyèna", 262: "Grahyèna", 263: "Zigzaton",
  264: "Linéon", 265: "Chenipotte", 266: "Armulys", 267: "Charmillon", 268: "Blindalys", 269: "Papinox",
  270: "Nénupiot", 271: "Lombre", 272: "Ludicolo", 273: "Grainipiot", 274: "Pifeuil", 275: "Tengalice",
  276: "Nirondelle", 277: "Hélédelle", 278: "Goélise", 279: "Békipan", 280: "Tarsal", 281: "Kirlia",
  282: "Gardevoir", 283: "Arakdo", 284: "Maskadra", 285: "Balignon", 286: "Chapignon", 287: "Parecool",
  288: "Vigoroth", 289: "Monaflèmit", 290: "Ningale", 291: "Ninjask", 292: "Munja", 293: "Chuchmur",
  294: "Ramboum", 295: "Brouhabam", 296: "Makuhita", 297: "Hariyama", 298: "Azurill", 299: "Tarinor",
  300: "Skitty", 301: "Delcatty", 302: "Ténéfix", 303: "Mysdibule", 304: "Galekid", 305: "Galegon",
  306: "Galeking", 307: "Méditikka", 308: "Charmina", 309: "Dynavolt", 310: "Élecsprint", 311: "Posipi",
  312: "Négapi", 313: "Muciole", 314: "Lumivole", 315: "Rosélia", 316: "Gloupti", 317: "Avalout",
  318: "Carvanha", 319: "Sharpedo", 320: "Wailmer", 321: "Wailord", 322: "Chamallot", 323: "Camerupt",
  324: "Chartor", 325: "Spoink", 326: "Groret", 327: "Spinda", 328: "Kracknois", 329: "Vibraninf",
  330: "Libegon", 331: "Cacnea", 332: "Cacturne", 333: "Tylton", 334: "Altaria", 335: "Mangriff",
  336: "Séviper", 337: "Séléroc", 338: "Solaroc", 339: "Barloche", 340: "Barbicha", 341: "Écrapince",
  342: "Colhomard", 343: "Balbuto", 344: "Kaorine", 345: "Lilia", 346: "Vacilys", 347: "Anorith",
  348: "Armaldo", 349: "Barpau", 350: "Milobellus", 351: "Morphéo", 352: "Kecleon", 353: "Polichombr",
  354: "Branette", 355: "Téraclope", 356: "Noctunoir", 357: "Absol", 358: "Éoko", 359: "Stalgamin",
  360: "Okéoké", 361: "Oniglali", 362: "Stalgamin", 363: "Obalie", 364: "Phogleur", 365: "Kaimorse",
  366: "Coquiperl", 367: "Serpang", 368: "Rosabyss", 369: "Relicanth", 370: "Lovdisc", 371: "Draby",
  372: "Drackhaus", 373: "Drattak", 374: "Terhal", 375: "Métang", 376: "Métalosse", 377: "Regirock",
  378: "Regice", 379: "Registeel", 380: "Latias", 381: "Latios", 382: "Kyogre", 383: "Groudon",
  384: "Rayquaza", 385: "Jirachi", 386: "Deoxys",

  // --- SINNOH (387 - 493) ---
  387: "Tortipouss", 388: "Boskara", 389: "Torterra", 390: "Ouisticram", 391: "Chimpenfeu", 392: "Simiabraz",
  393: "Tiplouf", 394: "Prinplouf", 395: "Pingoléon", 396: "Étourmi", 397: "Étourvol", 398: "Étouraptor",
  399: "Keunotor", 400: "Castorno", 401: "Crikzik", 402: "Mélokrik", 403: "Lixy", 404: "Luxio",
  405: "Luxray", 406: "Rozbouton", 407: "Roserade", 408: "Kraniados", 409: "Charkos", 410: "Dinoclier",
  411: "Bastiodon", 412: "Cheniti", 413: "Cheniselle", 414: "Papilord", 415: "Apitrini", 416: "Apireine",
  417: "Pachirisu", 418: "Mustébouée", 419: "Mustéflott", 420: "Ceribou", 421: "Ceriflor", 422: "Sanscoquille",
  423: "Tritosor", 424: "Capidextre", 425: "Baudrive", 426: "Grodrive", 427: "Laporeille", 428: "Lockpin",
  429: "Magiréve", 430: "Corboss", 431: "Chaglam", 432: "Chaffreux", 433: "Korillon", 434: "Moufouette",
  435: "Moufflair", 436: "Archéomire", 437: "Archéodong", 438: "Manza", 439: "Mime Jr.", 440: "Ptiravi",
  441: "Pijako", 442: "Spiritomb", 443: "Griknot", 444: "Carmache", 445: "Carchacrok", 446: "Goinfrex",
  447: "Riolu", 448: "Lucario", 449: "Hippopotas", 450: "Hippodocus", 451: "Rapion", 452: "Drascore",
  453: "Cradopaud", 454: "Coatox", 455: "Vortente", 456: "Écayon", 457: "Luminéon", 458: "Babimanta",
  459: "Blizzi", 460: "Blizzaroi", 461: "Dimoret", 462: "Magnézone", 463: "Coudlangue", 464: "Rhinastoc",
  465: "Bouldeneu", 466: "Élekable", 467: "Maganon", 468: "Togekiss", 469: "Yanmega", 470: "Phyllali",
  471: "Givrali", 472: "Scorvol", 473: "Mammochon", 474: "Porygon-Z", 475: "Gallame", 476: "Tarinorme",
  477: "Noctunoir", 478: "Momartik", 479: "Motisma", 480: "Créhelf", 481: "Créfollet", 482: "Créfadet",
  483: "Dialga", 484: "Palkia", 485: "Heatran", 486: "Regigigas", 487: "Giratina", 488: "Cresselia",
  489: "Phione", 490: "Manaphy", 491: "Darkrai", 492: "Shaymin", 493: "Arceus",

  // --- UNYS (494 - 649) ---
  494: "Victini", 495: "Vipélierre", 496: "Lianaja", 497: "Majaspic", 498: "Gruikui",
  499: "Grotichon", 500: "Roitiflam", 501: "Moustillon", 502: "Mateloutre", 503: "Clamiral",
  504: "Ratentif", 505: "Miradar", 506: "Ponchiot", 507: "Ponchien", 508: "Mastouffe",
  509: "Chacripan", 510: "Léopardus", 511: "Feuillajou", 512: "Feuiloutan", 513: "Flamajou",
  514: "Flamoutan", 515: "Flotajou", 516: "Flotoutan", 517: "Munna", 518: "Mushana", 519: "Poichigeon",
  520: "Colombeau", 521: "Déflaisan", 522: "Zébibron", 523: "Zéblitz", 524: "Nodulithe", 525: "Géolithe",
  526: "Gigalithe", 527: "Chovsouris", 528: "Rhinolove", 529: "Rototaupe", 530: "Minotaupe", 531: "Nanméouïe",
  532: "Charpenti", 533: "Ouvrifier", 534: "Bétochef", 535: "Tritonde", 536: "Batracné", 537: "Crapustule",
  538: "Judokrak", 539: "Karaclée", 540: "Larveyette", 541: "Couverdure", 542: "Manternel",
  543: "Venipatte", 544: "Scobolide", 545: "Brutapode", 546: "Doudouvet", 547: "Farfaduvet",
  548: "Chlorobulle", 549: "Fragilady", 550: "Bargantua", 551: "Mascaïman", 552: "Escroco",
  553: "Crocorible", 554: "Darumarond", 555: "Darumacho", 556: "Maracachi", 557: "Crabicoque",
  558: "Crabaraque", 559: "Baggiguane", 560: "Baggaïd", 561: "Cryptéro", 562: "Tutafeh",
  563: "Tutankafer", 564: "Carapagos", 565: "Mégapagos", 566: "Arkéapti", 567: "Aéroptéryx",
  568: "Miamiasme", 569: "Miasmax", 570: "Zorua", 571: "Zoroark", 572: "Chinchidou", 573: "Pashmilla",
  574: "Scrutella", 575: "Mesmerella", 576: "Sidérella", 577: "Nucléos", 578: "Méios", 579: "Symbios",
  580: "Couaneton", 581: "Lakmécygne", 582: "Sorbébé", 583: "Sorboul", 584: "Sorboubale", 585: "Vivaldaim",
  586: "Haydaim", 587: "Émolga", 588: "Carabing", 589: "Lancargot", 590: "Trompignon", 591: "Gaulet",
  592: "Viskuse", 593: "Moyade", 594: "Mamanbo", 595: "Statitik", 596: "Mygavolt", 597: "Grindur",
  598: "Noacier", 599: "Tic", 600: "Clic", 601: "Clicclac", 602: "Anchwatt", 603: "Lampéroie",
  604: "Ohmassacre", 605: "Lewsor", 606: "Neitram", 607: "Funécire", 608: "Mélancolux",
  609: "Lugulabre", 610: "Coupenotte", 611: "Incisache", 612: "Tranchodon", 613: "Polarhume",
  614: "Polagriffe", 615: "Hexagel", 616: "Escargaume", 617: "Limaspeed", 618: "Limonde", 619: "Kungfouine",
  620: "Shaofouine", 621: "Drakkarmin", 622: "Gringolem", 623: "Golemastoc", 624: "Scalpion", 625: "Scalproie",
  626: "Frison", 627: "Furaiglon", 628: "Guériaigle", 629: "Vostourno", 630: "Vaututrice", 631: "Aflamanoir", 632: "Fermite",
  633: "Solochi", 634: "Diamat", 635: "Trioxhydre", 636: "Pyronille", 637: "Pyrax", 638: "Cobaltium", 639: "Terrakium",
  640: "Viridium", 641: "Boréas", 642: "Fulguris", 643: "Reshiram", 644: "Zekrom", 645: "Démétéros", 646: "Kyurem",
  647: "Keldeo", 648: "Meloetta", 649: "Genesect",

  // --- KALOS (650 - 721) ---
  650: "Marisson", 651: "Boguérisse", 652: "Blindépique", 653: "Feunnec", 654: "Roussil", 655: "Goupelin", 656: "Grenousse",
  657: "Croâporal", 658: "Amphinobi", 659: "Sapereau", 660: "Excavarenne", 661: "Passerouge", 662: "Braisillon",
  663: "Flambusard", 664: "Lépidonille", 665: "Pérégrain", 666: "Prismillon", 667: "Hélionceau", 668: "Némélios",
  669: "Flabébé", 670: "Floette", 671: "Florges", 672: "Cabriolaine", 673: "Chevroum", 674: "Pandespiègle",
  675: "Pandarbare", 676: "Couafarel", 677: "Psystigri", 678: "Mystigrix", 679: "Monorpale", 680: "Dimoclès",
  681: "Exagide", 682: "Fluvetin", 683: "Cocotine", 684: "Sucroquin", 685: "Cupcanaille", 686: "Sépiatop", 687: "Sépiatroce",
  688: "Opéraminer", 689: "Golgopathe", 690: "Venalgue", 691: "Kravarech", 692: "Flingouste", 693: "Gamblast",
  694: "Galvaran", 695: "Iguolta", 696: "Ptyranidur", 697: "Rexillius", 698: "Amagara", 699: "Dragmara", 700: "Nymphali",
  701: "Brutalibré", 702: "Dedenne", 703: "Strassie", 704: "Mucuscule", 705: "Colimucus", 706: "Muplodocus", 707: "Trousselin",
  708: "Brocélôme", 709: "Desseliande", 710: "Pitrouille", 711: "Banshitrouye", 712: "Grelaçon", 713: "Séracrawl", 714: "Sonistrelle",
  715: "Bruyverne", 716: "Xerneas", 717: "Yveltal", 718: "Zygarde", 719: "Diancie", 720: "Hoopa", 721: "Volcanion",

  // --- ALOLA (722 - 809) ---
  722: "Brindibou", 723: "Efflèche", 724: "Archéduc", 725: "Flamiaou", 726: "Matoufeu", 727: "Félinferno", 728: "Otaquin",
  729: "Otarlette", 730: "Oratoria", 731: "Pikipek", 732: "Piclairon", 733: "Bazoucan", 734: "Manglouton", 735: "Argouste",
  736: "Larvibule", 737: "Chrysapile", 738: "Lucanon", 739: "Crabagarre", 740: "Crabominable", 741: "Plumeline", 742: "Bombydou",
  743: "Rubombelle", 744: "Rocabot", 745: "Lougaroc", 746: "Froussardine", 747: "Voreaster", 748: "Prédastérie", 749: "Tiboudet",
  750: "Bourrinos", 751: "Araqua", 752: "Tarenbulle", 753: "Mimantis", 754: "Floramantis", 755: "Spododo", 756: "Lampignon",
  757: "Tritox", 758: "Malamandre", 759: "Nounourson", 760: "Chelours", 761: "Croquine", 762: "Candine", 763: "Sucreine",
  764: "Guérilande", 765: "Gouroutan", 766: "Quartermac", 767: "Sovkipou", 768: "Sarmuraï", 769: "Bacabouh", 770: "Trépassable",
  771: "Concombaffe", 772: "Type:0", 773: "Silvallié", 774: "Météeno", 775: "Dodoala", 776: "Boumata", 777: "Togedemaru",
  778: "Mimiqui", 779: "Denticrisse", 780: "Draïeul", 781: "Sinistrail", 782: "Bébécaille", 783: "Écaïd", 784: "Ékaïser",
  785: "Tokorico", 786: "Tokopiyon", 787: "Tokotoro", 788: "Tokopisco", 789: "Cosmog", 790: "Cosmovum", 791: "Solgaleo",
  792: "Lunala", 793: "Zéroïd", 794: "Mouscoto", 795: "Cancrelove", 796: "Câblifère", 797: "Bamboiselle", 798: "Katagami",
  799: "Engloutyran", 800: "Necrozma", 801: "Magearna", 802: "Marshadow", 803: "Vémini", 804: "Mandrillon", 805: "Pierroteknik",
  806: "Ama-Ama", 807: "Zeraora", 808: "Meltan", 809: "Melmetal",

  // --- GALAR / HISUI (810 - 905) ---
  810: "Ouistempo", 811: "Badabouin", 812: "Gorythmic", 813: "Flambino", 814: "Lapyro", 815: "Pyrobut", 816: "Larméléon",
  817: "Arrozard", 818: "Lézargus", 819: "Rongourmand", 820: "Rongrigou", 821: "Minisange", 822: "Bleuseille",
  823: "Corvaillus", 824: "Larvadar", 825: "Coléodôme", 826: "Astronelle", 827: "Goupilou", 828: "Roublenard",
  829: "Tournicoton", 830: "Blancoton", 831: "Moumouton", 832: "Moumouflon", 833: "Khélocrok", 834: "Torgamord", 835: "Voltoutou",
  836: "Fulgudog", 837: "Charbi", 838: "Wagonmine", 839: "Monthracite", 840: "Verpom", 841: "Pomdrapi", 842: "Dratatin",
  843: "DUNAJA", 844: "DUNACONDA", 845: "Nigosier", 846: "Embrochet", 847: "Hastacuda", 848: "Toxizap", 849: "Salarsen",
  850: "Grillepattes", 851: "Scolocendre", 852: "Poulpaf", 853: "Krakos", 854: "Théffroi", 855: "Polthégeist",
  856: "Bibichut", 857: "CHAPOTUS", 858: "Sorcilence", 859: "Grimalin", 860: "Fourbelin", 861: "Angoliath",
  862: "Ixon", 863: "Berserkatt", 864: "CORAYÔME", 865: "Palarticho", 866: "M. Glaquette",
  867: "Tutétékri", 868: "Crémy", 869: "Charmilly", 870: "Hexadron", 871: "Wattapik", 872: "Frissonille",
  873: "BELDENEIGE", 874: "DOLMAN", 875: "BEKAGLAÇON", 876: "WIMESSIR", 877: "MORPEKO", 878: "CHARIBARI", 879: "Pachyradjah",
  880: "Galvagon", 881: "Galvagla", 882: "Hydragon", 883: "Hydragla", 884: "Duralugon",
  885: "Fantyrm", 886: "Dispareptil", 887: "Lanssorien", 888: "Zacian", 889: "Zamazenta", 890: "Éternatos", 891: "Wushours",
  892: "Shifours", 893: "Zarude", 894: "Regieleki", 895: "Regidrago", 896: "Blizzeval", 897: "Spectreval",
  898: "Sylveroy", 899: "Cerbyllin", 900: "Hachécateur", 901: "Ursaking", 902: "Paragruel", 903: "Farfurex",
  904: "Qwilpik", 905: "Amovénus",


// --- PALDEA (906 - 1014+) ---
  906: "Poussacha", 907: "Matourgeon", 908: "Miascarade", 909: "Chochodile", 910: "Crocogril", 911: "Flâmigator",
  912: "Coiffeton", 913: "Canarbello", 914: "Palmaval", 915: "Gourmelet", 916: "Fragroin", 917: "Tissenboule",
  918: "Filentrappe", 919: "Enboulon", 920: "Exagril", 921: "Pohm", 922: "Pohmotte", 923: "Pohmarmotte",
  924: "Compagnol", 925: "Famignol", 926: "Pataugriffe", 927: "Dogrino", 928: "Olivini", 929: "Olivado",
  930: "Arboliva", 931: "Tapatoès", 932: "Selentin", 933: "Amassel", 934: "Gigansel", 935: "Charbambin",
  936: "Carmadura", 937: "Malvalame", 938: "Têtampoule", 939: "Ampibidou", 940: "Zapétrel", 941: "Fulgulairo",
  942: "Grondogue", 943: "Dogrino", 944: "Tag-Tag", 945: "Gribouraigne", 946: "Virovent", 947: "Virevorreur",
  948: "Terracool", 949: "Terracruel", 950: "Craparoi", 951: "Pimito", 952: "Scovillain", 953: "Léboulérou",
  954: "Bérasca", 955: "Flotillon", 956: "Cléopsytra", 957: "Forgerette", 958: "Forgella", 959: "Forgelina",
  960: "Taupikeau", 961: "Triopikeau", 962: "Vrombi", 963: "Vrombotor", 964: "Motorizard", 965: "Toutombe",
  966: "Tomberro", 967: "Flamenroule", 968: "Piétasol", 969: "Dondoko", 970: "Oyacata", 971: "Courrousinge",
  972: "Terraiste", 973: "Glaivodo", 974: "Mordudor", 975: "Gromago", 976: "Chongjian", 977: "Baojian",
  978: "Dinglu", 979: "Yuyu", 980: "Arpente-Sol", 981: "Hurle-Queue", 982: "Fongus-Furie", 983: "Flotte-Mèche",
  984: "Rampe-Aile", 985: "Pennage-Sable", 986: "Roue-de-Fer", 987: "Motte-de-Fer", 988: "Paume-de-Fer",
  989: "Tête-de-Fer", 990: "Hache-de-Fer", 991: "Épine-de-Fer", 992: "Frigodo", 993: "Cryodo",
  994: "Rugit-Lune", 995: "Garde-de-Fer", 996: "Koraidon", 997: "Miraidon", 998: "Serpente-Eau",
  999: "Vert-de-Fer", 1000: "Gromago", 1001: "Pomdramour", 1002: "Poltchageist", 1003: "Théffroyable",
  1004: "Félicanis", 1005: "Fortusimia", 1006: "Favianos", 1007: "Ogerpon", 1008: "Pondralugon",
  1009: "Pomdorochi", 1010: "Feu-Perçant", 1011: "Ire-Foudre", 1012: "Roc-de-Fer", 1013: "Chef-de-Fer",
  1014: "Terapagos"


            };
            pokedexTraduction = { ...pokedexTraduction, ...backupFr };
        }
        
        console.log("Système de traduction prêt !");
        afficherStatsRegions();
    } catch (e) {
        console.error("Erreur de chargement des traductions", e);
    }
}

// 3. RECUPERER UN POKÉMON (RECHERCHE ACCENTS COMPATIBLE)
// --- FONCTION DE RECHERCHE PRINCIPALE (ACCEPTE NUMÉROS ET NOMS FRANÇAIS) ---

async function getPokemon() {
    const input = document.getElementById('pokemonInput');
    const typesContainer = document.getElementById('pokemonTypes');
    const pokemonImage = document.getElementById('pokemonImage');
    const pokemonNumberDisplay = document.getElementById('pokemonNumber');
    const statsContainer = document.getElementById('pokemonStats');

    // 1. On récupère la saisie brute de l'utilisateur ou du dé
    let rawSearch = input.value.trim();
    if (!rawSearch) return; 

    // 2. Nettoyage de base : tout en minuscules et retrait des accents
    let searchValue = rawSearch.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Pour l'API : On remplace les espaces par des tirets (ex: "m mime" devient "m-mime")
    let apiSearchValue = searchValue.replace(/\s+/g, "-");

    // Pour ton dictionnaire local : Nettoyage strict sans caractères spéciaux
    let cleanDicoKey = searchValue.replace(/[^a-z0-9]/g, "");

    try {
        let id = null;
        
        // A. Si c'est un nombre (généré par le dé ou tapé par l'enfant)
        if (!isNaN(rawSearch) && rawSearch !== "") {
            id = parseInt(rawSearch);
        } 
        // B. Si le nom est trouvé dans ton dictionnaire local de traduction
        else if (typeof pokedexTraduction !== 'undefined' && pokedexTraduction[cleanDicoKey]) {
            id = pokedexTraduction[cleanDicoKey];
        } 
        // C. Traduction automatique en direct via l'API Species (Utilise apiSearchValue)
        else {
            try {
                const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${apiSearchValue}`);
                if (speciesRes.ok) {
                    const speciesData = await speciesRes.json();
                    id = speciesData.id;
                }
            } catch (e) { 
                id = null; 
            }
        }

        // Vérification des limites du Pokédex (1 à 1025)
        if (!id || id < 1 || id > 1025) {
            showPokemonAlert("Pokémon non trouvé ! Essaie un autre nom ou son numéro.");
            input.value = "";
            return;
        }

        // 3. Récupération de la fiche complète du Pokémon via son ID valide
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();

        // Réinitialisation des silhouettes du Quiz
        if (pokemonImage) pokemonImage.classList.remove('silhouette'); 
        const revealBtn = document.getElementById('revealBtn');
        if (revealBtn) revealBtn.classList.add('hidden');

        // Changement automatique de la région sélectionnée si nécessaire
        const regionSelect = document.getElementById('regionSelect');
        if (regionSelect && regionSelect.value) {
            const rangeSelect = regionSelect.value.split('-').map(Number);
            if (id < rangeSelect[0] || id > rangeSelect[1]) {
                for (let opt of regionSelect.options) {
                    const [s, e] = opt.value.split('-').map(Number);
                    if (id >= s && id <= e) {
                        regionSelect.value = opt.value;
                        if (typeof initPokedex === 'function') initPokedex(); 
                        break;
                    }
                }
            }
        }

        // 4. Traduction du nom en français depuis l'API pour l'affichage final
        const speciesResFinal = await fetch(data.species.url);
        const speciesDataFinal = await speciesResFinal.json();
        const frenchName = speciesDataFinal.names.find(n => n.language.name === "fr")?.name || data.name;

        // Détermination de la région
        const nomsRegions = {
            "1-151": "Kanto", "152-251": "Johto", "252-386": "Hoenn",
            "387-493": "Sinnoh", "494-649": "Unys", "650-721": "Kalos",
            "722-809": "Alola", "810-905": "Galar", "906-1025": "Paldea"
        };
        let regionNom = "Inconnue";
        for (let key in nomsRegions) {
            const [start, end] = key.split('-').map(Number);
            if (id >= start && id <= end) { regionNom = nomsRegions[key]; break; }
        }

        // Remplissage de l'interface
        if (pokemonImage) pokemonImage.src = data.sprites.other['official-artwork'].front_default;
        
        const pokemonNameElement = document.getElementById('pokemonName');
        if (pokemonNameElement) pokemonNameElement.innerText = frenchName.toUpperCase();
        
        if (pokemonNumberDisplay) {
            pokemonNumberDisplay.innerHTML = `N° ${id} — <strong>Région de ${regionNom}</strong>`;
        }

        // Nettoyage et affichage des types (Au dernier moment pour éviter le doublon)
        if (typesContainer) {
            typesContainer.innerHTML = ''; 
            data.types.forEach(t => {
                const badge = document.createElement('span');
                badge.className = `type-badge type-${t.type.name}`;
                badge.innerText = (typeof dicoTypes !== 'undefined' && dicoTypes[t.type.name]) ? dicoTypes[t.type.name] : t.type.name.toUpperCase();
                typesContainer.appendChild(badge);
            });
        }

        // Nettoyage et affichage des statistiques (Au dernier moment pour éviter le doublon)
        if (statsContainer) {
            statsContainer.innerHTML = ''; 
            const statsTraductions = {'hp':'PV','attack':'ATQ','defense':'DEF','special-attack':'ATQ.SP','special-defense':'DEF.SP','speed':'VIT'};
            data.stats.forEach(s => {
                const percent = Math.min((s.base_stat / 150) * 100, 100);
                const statRow = document.createElement('div');
                statRow.className = 'stat-row';
                statRow.innerHTML = `<span class="stat-label">${statsTraductions[s.stat.name] || s.stat.name}</span><div class="stat-bar-bg"><div class="stat-bar-fill bg-${s.stat.name}" style="width: ${percent}%"></div></div><span class="stat-value">${s.base_stat}</span>`;
                statsContainer.appendChild(statRow);
            });
        }

        const pokemonCard = document.getElementById('pokemonCard');
        if (pokemonCard) pokemonCard.classList.remove('hidden');
        
        // Ajout au Pokédex et déclenchement des confettis via ta fonction updateGrid
        if (typeof updateGrid === 'function') {
            updateGrid(id, data.sprites.front_default, frenchName);
        }

    } catch (error) { 
        console.error(error); 
    }
    
    // On vide le champ texte pour la saisie suivante
    input.value = "";
}

// 4. GRILLE ET PROGRESSION (FIXED)
function updateGrid(id, spriteUrl, name) {
    const range = document.getElementById('regionSelect').value;
    let regionKey = "";
    for (let key in progressionParRegion) {
        const [start, end] = key.split('-').map(Number);
        if (id >= start && id <= end) { regionKey = key; break; }
    }

    if (progressionParRegion[range] && !progressionParRegion[range].has(id)) {
        progressionParRegion[range].add(id); // On l'ajoute
        lancerConfettis(); // 🏁 On lance les confettis UNIQUEMENT si c'est un nouveau !
}
    const targetSlot = document.getElementById(`slot-${id}`);
    if (targetSlot) {
        if (!progressionParRegion[regionKey].has(id)) {
            progressionParRegion[regionKey].add(id);
            lancerConfettis();
            
            let totalCaught = 0;
            for (let key in progressionParRegion) totalCaught += progressionParRegion[key].size;
            document.getElementById('catchCount').innerText = totalCaught;
            
            afficherStatsRegions();

            if (!lastCaught.some(p => p.id === id)) {
                lastCaught.unshift({id, sprite: spriteUrl});
                if (lastCaught.length > 3) lastCaught.pop();
                afficherRecents();
            }
            sauvegarderPokedex(); // Une seule sauvegarde globale propre
        }
        targetSlot.innerHTML = `<img src="${spriteUrl}" alt="${name}" title="${name}">`;
        targetSlot.style.backgroundColor = "white";
        targetSlot.style.border = "1px solid #3b4cca";
    }
}

function afficherStatsRegions() {
    const container = document.getElementById('statsRegions');
    if (!container) return;
    const nomsRegions = {"1-151":"Kanto","152-251":"Johto","252-386":"Hoenn","387-493":"Sinnoh","494-649":"Unys","650-721":"Kalos","722-809":"Alola","810-905":"Galar","906-1025":"Paldea"};
    let html = `<h4 style="font-family: 'Luckiest Guy', cursive; color: #ffde00; text-shadow: 1px 1px 0px #3b4cca; margin-bottom: 15px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">Détails par Région :</h4>`;
    
    for (let key in progressionParRegion) {
        const nb = progressionParRegion[key].size; 
        const bounds = key.split('-').map(Number);
        const total = bounds[1] - bounds[0] + 1;
        const pourcentage = (nb / total) * 100;
        const isComplete = nb === total; 
        if (nb > 0) {
            html += `<div style="margin-bottom: 12px; text-align: left;">
                <div style="display: flex; justify-content: space-between; font-family: 'Luckiest Guy', cursive; color: ${isComplete ? '#4cd137' : 'white'}; font-size: 0.9rem;">
                    <span>${nomsRegions[key]} ${isComplete ? '🏆' : ''}</span>
                    <span>${nb} / ${total}</span>
                </div>
                <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.3); border-radius: 3px; margin-top: 4px; overflow: hidden;">
                    <div style="width: ${pourcentage}%; height: 100%; background: ${isComplete ? '#4cd137' : '#ffde00'}; transition: width 0.5s ease;"></div>
                </div>
            </div>`;
        }
    }
    container.innerHTML = html;
}

function initPokedex() {
    const grid = document.getElementById('pokedexGrid');
    const regionSelect = document.getElementById('regionSelect');
    const range = regionSelect.value;
    const [start, end] = range.split('-').map(Number);
    
    grid.innerHTML = '';
    
    for (let i = start; i <= end; i++) {
        const slot = document.createElement('div');
        slot.className = 'pokemon-slot';
        slot.id = `slot-${i}`;
        
// Remplacer l'ancienne condition par celle-ci dans la boucle de initPokedex :
if (progressionParRegion[range] && progressionParRegion[range].has(i)) {
    slot.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png" alt="Pokemon ${i}">`;
    slot.style.backgroundColor = "white";
    slot.style.border = "1px solid #3b4cca";
} else {
    slot.innerText = i;
}

        slot.addEventListener('click', () => {
            const arena = document.getElementById('battleArena');
            if (arena && !arena.classList.contains('hidden')) {
                lancerDuel(i);
            } else {
                document.getElementById('pokemonInput').value = i;
                getPokemon();
                if (window.innerWidth < 900) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        });

        grid.appendChild(slot);
    }
}

// 5. MODALES ET SAUVEGARDE COMPLÈTE (SCORE + POKÉDEX)
let onConfirmAction = null;
function showPokemonAlert(message, isConfirmation = false, action = null) {
    const modal = document.getElementById('customAlert');
    let emoji = "💡"; 
    if (message.includes("GAGNÉ") || message.includes("gagné")) emoji = "🏆";
    if (message.includes("PERDU") || message.includes("perdu")) emoji = "💥";
    if (message.includes("C'était")) emoji = "✨";

    document.getElementById('modalMessage').innerHTML = `${emoji} ${message}`;
    document.getElementById('modalTitle').innerText = isConfirmation ? "CONFIRMATION" : "MESSAGE DE SACHA";
    const cancelBtn = document.getElementById('modalCancelBtn');
    const confirmBtn = document.getElementById('modalConfirmBtn');
    
    if (isConfirmation) {
        cancelBtn.classList.remove('hidden');
        onConfirmAction = action;
        confirmBtn.onclick = () => { if (onConfirmAction) onConfirmAction(); closeModal(); };
    } else {
        cancelBtn.classList.add('hidden');
        confirmBtn.onclick = closeModal;
    }
    modal.classList.remove('hidden');
}

function closeModal() { document.getElementById('customAlert').classList.add('hidden'); onConfirmAction = null; }

function sauvegarderPokedex() {
    const data = { 
        progression: {}, 
        recents: lastCaught,
        victoires: victoires,
        defaites: defaites
    };
    for (let key in progressionParRegion) data.progression[key] = Array.from(progressionParRegion[key]);
    localStorage.setItem('monPokedexSauvegarde', JSON.stringify(data));
}

function chargerSauvegarde() {
    const sauvegarde = localStorage.getItem('monPokedexSauvegarde');
    if (sauvegarde) {
        const data = JSON.parse(sauvegarde);
        
        // Chargement des scores
        victoires = data.victoires || 0;
        defaites = data.defaites || 0;
        document.getElementById('winCount').innerText = victoires;
        document.getElementById('lossCount').innerText = defaites;
        
        // Chargement de la grille
        if (data.progression) {
            let total = 0;
            for (let key in data.progression) {
                progressionParRegion[key] = new Set(data.progression[key]);
                total += progressionParRegion[key].size;
            }
            document.getElementById('catchCount').innerText = total;
        }
        if (data.recents) { lastCaught = data.recents; afficherRecents(); }
        afficherStatsRegions();
    }
}

function afficherRecents() {
    const container = document.getElementById('recentList');
    if (!container) return;
    container.innerHTML = lastCaught.length === 0 ? '<p class="no-data">Attrape un Pokémon !</p>' : '';
    lastCaught.forEach(poke => {
        const div = document.createElement('div');
        div.className = 'recent-card';
        div.innerHTML = `<img src="${poke.sprite}" title="N° ${poke.id}">`;
        container.appendChild(div);
    });
}

// 6. ÉVÉNEMENTS (BOUTON DUEL CORRIGÉ)
window.addEventListener('DOMContentLoaded', () => { chargerDonnees(); chargerSauvegarde(); initPokedex(); generateWatermarks(50); });
document.getElementById('regionSelect').addEventListener('change', initPokedex);
document.getElementById('pokemonInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') getPokemon(); });

// Écouteur lié au bouton de lancement de Duel (ID à adapter selon ton HTML si différent)
const startBattleBtn = document.getElementById('startBattleBtn') || document.getElementById('duelBtn');
if(startBattleBtn) startBattleBtn.addEventListener('click', preparerCombat);

document.getElementById('resetBtn').addEventListener('click', () => {
    showPokemonAlert("⚠️ Tout perdre (Pokédex et scores de combat) ?", true, () => {
        localStorage.removeItem('monPokedexSauvegarde');
        lastCaught = [];
        victoires = 0;
        defaites = 0;
        document.getElementById('winCount').innerText = "0";
        document.getElementById('lossCount').innerText = "0";
        document.getElementById('catchCount').innerText = "0";
        for (let key in progressionParRegion) progressionParRegion[key].clear();
        initPokedex(); afficherStatsRegions(); afficherRecents();
        document.getElementById('pokemonCard').classList.add('hidden');
    });
});

// --- FONCTION CORRECTE POUR LE BOUTON DÉ (ALÉATOIRE) ---
function getRandomPokemon() {
    const input = document.getElementById('pokemonInput');
    if (!input) return;

    // Génère un numéro aléatoire valide entre 1 et 1025
    const randomId = Math.floor(Math.random() * 1025) + 1;
    
    // Injecte la valeur dans l'input pour que getPokemon() la lise comme un nombre
    input.value = randomId;
    
    // Déclenche la recherche immédiatement
    getPokemon();
}

// QUIZ CORRIGÉ
document.getElementById('quizBtn').addEventListener('click', async function() {
    document.getElementById('pokemonTypes').innerHTML = '';
    document.getElementById('pokemonNumber').innerText = '';
    document.getElementById('pokemonStats').innerHTML = '';
    currentQuizId = Math.floor(Math.random() * 1025) + 1;
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${currentQuizId}`);
    const data = await response.json();
    const pokemonImage = document.getElementById('pokemonImage');
    src = data.sprites.other['official-artwork'].front_default;
    pokemonImage.classList.add('silhouette');
    document.getElementById('pokemonName').innerText = "???"; 
    document.getElementById('pokemonCard').classList.remove('hidden');
    document.getElementById('revealBtn').classList.remove('hidden');
});

document.getElementById('revealBtn').addEventListener('click', async function() {
    if (!currentQuizId) return;
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${currentQuizId}`);
    const data = await res.json();
    const frenchName = data.names.find(n => n.language.name === "fr")?.name || data.name;
    
    document.getElementById('pokemonInput').value = currentQuizId; // Utilisation sécurisée de l'ID numérique
    await getPokemon();
    showPokemonAlert(`C'était ${frenchName} !`);
});

// 7. DÉCORATIONS & VISUELS
function generateWatermarks(count) {
    const placedPositions = []; 
    const minDistance = 120; 
    const maxAttempts = 100;
    for (let i = 0; i < count; i++) {
        let watermark = document.createElement('div');
        watermark.className = 'pokedex-watermark';
        let x, y, isValid, attempts = 0;
        do {
            isValid = true;
            x = Math.random() * (window.innerWidth - 100);
            y = Math.random() * (document.documentElement.scrollHeight - 100);
            attempts++;
            for (let pos of placedPositions) {
                const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
                if (dist < minDistance) { isValid = false; break; }
            }
            if (attempts > maxAttempts) break;
        } while (!isValid);
        if (isValid) {
            watermark.style.left = x + 'px';
            watermark.style.top = y + 'px';
            watermark.style.width = (Math.random() * 40 + 40) + 'px';
            watermark.style.height = watermark.style.width;
            watermark.style.transform = `rotate(${Math.random() * 360}deg)`;
            placedPositions.push({ x, y });
            document.body.appendChild(watermark);
        }
    }
}

function lancerConfettis() {
    const couleurs = ['#ff0000', '#ffffff', '#3b4cca', '#ffde00'];
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        const duration = Math.random() * 2 + 1;
        confetti.style.backgroundColor = couleurs[Math.floor(Math.random() * couleurs.length)];
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.animationDuration = duration + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), duration * 1000);
    }
}

// 8. ARÈNE DE COMBAT (FONCTIONNELLES)
let opponentData = null;
let opponentFrenchName = "";
let opponentFrenchTypes = [];

async function preparerCombat() {
    const arena = document.getElementById('battleArena');
    const log = document.getElementById('battleLog');
    const typesContainer = document.getElementById('opponentTypesBattle'); 
    const hintZone = document.getElementById('typeHint'); 

    arena.classList.remove('hidden');
    log.innerHTML = "Recherche d'un adversaire...";
    if (hintZone) hintZone.innerHTML = "💡 <strong>CONSEIL :</strong> Le Professeur analyse l'adversaire...";

    setTimeout(() => { arena.scrollIntoView({ behavior: 'smooth' }); }, 100);

    const randomId = Math.floor(Math.random() * 1025) + 1;
    
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        opponentData = await response.json();

        const speciesRes = await fetch(opponentData.species.url);
        const speciesData = await speciesRes.json();
        opponentFrenchName = speciesData.names.find(n => n.language.name === "fr")?.name || opponentData.name;

        // Affichage des types de l'adversaire
        if (typesContainer) typesContainer.innerHTML = "";
        opponentFrenchTypes = opponentData.types.map(t => {
            const typeNomFr = dicoTypes[t.type.name] || t.type.name.toUpperCase();
            const badge = document.createElement('span');
            badge.className = `type-badge type-${t.type.name}`;
            badge.innerText = typeNomFr;
            badge.style.fontSize = "0.8rem";
            badge.style.padding = "5px 10px";
            if (typesContainer) typesContainer.appendChild(badge);
            return typeNomFr;
        });

        // Conseil stratégique automatique
        let toutesFaiblesses = [];
        opponentFrenchTypes.forEach(typeNom => {
            if (tableTypesFR[typeNom]) {
                toutesFaiblesses = toutesFaiblesses.concat(tableTypesFR[typeNom].faiblesses);
            }
        });
        const faiblessesUniques = [...new Set(toutesFaiblesses)];
        
        if (hintZone) {
            if (faiblessesUniques.length > 0) {
                hintZone.innerHTML = `💡 <strong>CONSEIL :</strong> ${opponentFrenchName} est faible face aux types : <span style="color: #d32f2f; font-weight: bold;">${faiblessesUniques.join(', ')}</span>.`;
            } else {
                hintZone.innerHTML = `💡 <strong>CONSEIL :</strong> Ce Pokémon n'a pas de point faible évident. Utilise ta force brute !`;
            }
        }

        document.getElementById('opponentImg').src = opponentData.sprites.other['official-artwork'].front_default;
        document.getElementById('opponentNameBattle').innerText = opponentFrenchName.toUpperCase();
        log.innerHTML = `⚔️ <strong style="letter-spacing: 2px;">${opponentFrenchName.toUpperCase()}</strong> sauvage apparaît !<br>Regarde ses types et choisis ton champion !`;
        document.getElementById('playerSlotBattle').innerHTML = '<span style="font-size: 1rem; color: #777;">Choisis un Pokémon au-dessus !</span>';
        document.getElementById('playerNameBattle').innerText = "";
        
    } catch (error) {
        log.innerHTML = "Erreur lors de la recherche... Réessaie !";
        console.error(error);
    }
}

async function lancerDuel(playerId) {
    if (!opponentData) return;

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${playerId}`);
        const playerData = await res.json();

        const speciesRes = await fetch(playerData.species.url);
        const speciesData = await speciesRes.json();
        const playerFrenchName = speciesData.names.find(n => n.language.name === "fr")?.name || playerData.name;
        const playerFrenchTypes = playerData.types.map(t => dicoTypes[t.type.name] || t.type.name.toUpperCase());

        document.getElementById('playerSlotBattle').innerHTML = `<img src="${playerData.sprites.front_default}" style="width: 180px;">`;
        document.getElementById('playerNameBattle').innerText = playerFrenchName.toUpperCase();

        let avantage = 0;
        playerFrenchTypes.forEach(pT => {
            opponentFrenchTypes.forEach(oT => {
                if (tableTypesFR[pT]?.forces.includes(oT)) avantage += 1;
                if (tableTypesFR[pT]?.faiblesses.includes(oT)) avantage -= 1;
            });
        });

// À remplacer à l'intérieur de la fonction lancerDuel(playerId) :
const playerAttackStat = playerData.stats.find(s => s.stat.name === 'attack')?.base_stat || 50;
const opponentDefenseStat = opponentData.stats.find(s => s.stat.name === 'defense')?.base_stat || 50;

const forceJoueur = playerAttackStat + (avantage * 25);
const defenseAdversaire = opponentDefenseStat;
        const log = document.getElementById('battleLog');
        
        let explicationType = "";
        if (avantage > 0) explicationType = `<br><small style="color: #4cd137;">Tes types étaient très efficaces !</small>`;
        else if (avantage < 0) explicationType = `<br><small style="color: #ff4757;">Attention, tes types étaient faibles...</small>`;

        if (forceJoueur > defenseAdversaire) {
            victoires++; 
            document.getElementById('winCount').innerText = victoires;
            log.innerHTML = `<span style="color: #4cd137; font-weight:bold;">BRAVO ! ${playerFrenchName.toUpperCase()} A GAGNÉ !</span><br>Ton attaque (${forceJoueur}) a battu la défense de ${opponentFrenchName} (${defenseAdversaire}) !${explicationType}`;
            lancerConfettis();
        } else if (forceJoueur < defenseAdversaire) {
            defaites++;
            document.getElementById('lossCount').innerText = defaites;
            log.innerHTML = `<span style="color: #ff4757; font-weight:bold;">OH NON... ${playerFrenchName.toUpperCase()} A PERDU.</span><br>${opponentFrenchName} avait une trop bonne défense (${defenseAdversaire}) contre ton attaque (${forceJoueur}).${explicationType}`;
        } else {
            log.innerHTML = `<span style="font-weight:bold; color: #ffde00;">MATCH NUL !</span><br>Votre puissance est identique (${forceJoueur}).`;
        }
        
        sauvegarderPokedex(); // Sauvegarde immédiate du nouveau score

    } catch (error) {
        console.error("Erreur duel:", error);
    }
}

// Enregistrement du Service Worker pour le mode PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker enregistré avec succès !', reg.scope))
            .catch(err => console.error('Échec de l\'enregistrement du Service Worker :', err));
    });
}

// ... (Toutes tes fonctions comme getPokemon, initPokedex, etc. sont au-dessus)

// ==========================================
// ZONE DES ÉCOUTEURS D'ÉVÉNEMENTS (TOUT EN BAS)
// ==========================================

// Écouteur pour lancer le quiz
const quizBtn = document.getElementById('quizBtn');
if (quizBtn) {
    quizBtn.addEventListener('click', async function() {
        document.getElementById('pokemonTypes').innerHTML = '';
        document.getElementById('pokemonNumber').innerText = '';
        document.getElementById('pokemonStats').innerHTML = '';
        currentQuizId = Math.floor(Math.random() * 1025) + 1;
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${currentQuizId}`);
        const data = await response.json();
        const pokemonImage = document.getElementById('pokemonImage');
        if (pokemonImage) {
            pokemonImage.src = data.sprites.other['official-artwork'].front_default;
            pokemonImage.classList.add('silhouette');
        }
        document.getElementById('pokemonName').innerText = "???"; 
        document.getElementById('pokemonCard').classList.remove('hidden');
        document.getElementById('revealBtn').classList.remove('hidden');
    });
}

// 🟢 METS LE BLOC CORRECTIF JUSTE ICI :
const revealBtn = document.getElementById('revealBtn');
if (revealBtn) {
    revealBtn.addEventListener('click', async function() {
        if (!currentQuizId) return;
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${currentQuizId}`);
        const data = await res.json();
        const frenchName = data.names.find(n => n.language.name === "fr")?.name || data.name;
        
        // Supprime la silhouette noire immédiatement
        const pokemonImage = document.getElementById('pokemonImage');
        if (pokemonImage) pokemonImage.classList.remove('silhouette'); 
        
        // Remplit le champ et appelle ta fonction actuelle
        document.getElementById('pokemonInput').value = currentQuizId; 
        await getPokemon();
        
        // Affiche la modale personnalisée
        showPokemonAlert(`C'était ${frenchName} !`);
    });
}