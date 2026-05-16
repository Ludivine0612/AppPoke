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
                "bulbizarre": 1, "herbizarre": 2, "florizarre": 3, "salameche": 4, "reptincel": 5, "dracaufeu": 6,
                "carapuce": 7, "carabaffe": 8, "tortank": 9, "chenipan": 10, "chrysacier": 11, "papilusion": 12,
                "aspicot": 13, "coconfort": 14, "dardargnan": 15, "roucool": 16, "roucoups": 17, "roucarnage": 18,
                "rattata": 19, "rattatac": 20, "piafabec": 21, "rapasdepic": 22, "abo": 23, "arbok": 24, "pikachu": 25,
                "raichu": 26, "sabelette": 27, "sablaireau": 28, "nidoran": 29, "melofee": 35, "goupix": 37, "feunard": 38,
                "nosferapti": 41, "nosferalto": 42, "mystherbe": 43, "ortide": 44, "rafflezia": 45, "miaouss": 52,
                "persian": 53, "psykokwak": 54, "akwakwak": 55, "caninos": 58, "arcanin": 59, "ptitard": 60,
                "tetarte": 61, "tartard": 62, "abra": 63, "kadabra": 64, "alakazam": 65, "machoc": 66, "machopeur": 67,
                "mackogneur": 68, "chetiflor": 69, "boustiflor": 70, "empiflor": 71, "tentacool": 72, "tentacruel": 73,
                "ponyta": 77, "galopa": 78, "ramoloss": 79, "flagadoss": 80, "magneti": 81, "magneton": 82, "canarticho": 83,
                "doduo": 84, "dodorio": 85, "otaria": 86, "lamantine": 87, "tadmorv": 88, "grotadmorv": 89, "kokiyas": 90,
                "crustabri": 91, "fantominus": 92, "spectrum": 93, "ectoplasma": 94, "onix": 95, "soporifik": 96,
                "hypnomade": 97, "krabby": 98, "krabboss": 99, "voltorbe": 100, "electrode": 101, "noeunoeuf": 102,
                "noadkoko": 103, "osselelet": 104, "ossatueur": 105, "kicklee": 106, "tygnon": 107, "excelangue": 108,
                "smogo": 109, "smogogo": 110, "rhinocorn": 111, "rhinoferos": 112, "leveinard": 113, "saquedeneu": 114,
                "kangourex": 115, "hypococean": 117, "poisseneon": 118, "poissoroy": 119, "stari": 120, "staross": 121,
                "mimiq": 122, "insecateur": 123, "lippoutou": 124, "elektek": 125, "magmar": 126, "scarabrute": 127,
                "tauros": 128, "magicarde": 129, "leviator": 130, "lokhlass": 131, "metamorph": 132, "evoli": 133,
                "aquali": 134, "voltali": 135, "pyroli": 136, "porygon": 137, "amonita": 138, "amonistar": 139,
                "kabuto": 140, "kabutops": 141, "ptera": 142, "ronflex": 143, "artikodin": 144, "electhor": 145,
                "sulfura": 146, "minidraco": 147, "draco": 148, "dracolosse": 149, "mewtwo": 150, "mew": 151,
                "mentali": 196, "noctali": 197, "ouisticram": 390, "phyllali": 470, "givrali": 471, "nymphali": 700, 
                "klefki": 707, "tousselin": 707, "mimiqui": 778
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
async function getPokemon() {
    const input = document.getElementById('pokemonInput');
    const typesContainer = document.getElementById('pokemonTypes');
    const pokemonImage = document.getElementById('pokemonImage');
    const pokemonNumberDisplay = document.getElementById('pokemonNumber');
    const statsContainer = document.getElementById('pokemonStats');

    // Nettoyage complet de la saisie (sans espaces, sans accents)
    let searchValue = input.value.toLowerCase().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, ""); 
    
    if (!searchValue) return; 
    
    typesContainer.innerHTML = ''; 
    if (statsContainer) statsContainer.innerHTML = ''; 

    try {
        let id = null;
        
        // 1. Si c'est un nombre
        if (!isNaN(searchValue) && searchValue !== "") {
            id = parseInt(searchValue);
        } 
        // 2. Si le nom est dans notre dictionnaire de traduction automatique
        else if (pokedexTraduction[searchValue]) {
            id = pokedexTraduction[searchValue];
        } 
        // 3. Système de secours directement auprès de l'API s'il n'est pas dans le dico
        else {
            try {
                const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${searchValue}`);
                if (speciesRes.ok) {
                    const speciesData = await speciesRes.json();
                    id = speciesData.id;
                }
            } catch (e) { id = null; }
        }

        // Sécurité des limites de l'API
        if (!id || id < 1 || id > 1025) {
            showPokemonAlert("Pokémon non trouvé ! Essaie un autre nom ou son numéro.");
            return;
        }

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();

        // Sécurité Quiz
        pokemonImage.classList.remove('silhouette'); 
        const revealBtn = document.getElementById('revealBtn');
        if (revealBtn) revealBtn.classList.add('hidden');

        // Changement automatique de l'onglet de région si nécessaire
        const regionSelect = document.getElementById('regionSelect');
        const rangeSelect = regionSelect.value.split('-').map(Number);
        if (id < rangeSelect[0] || id > rangeSelect[1]) {
            for (let opt of regionSelect.options) {
                const [s, e] = opt.value.split('-').map(Number);
                if (id >= s && id <= e) {
                    regionSelect.value = opt.value;
                    initPokedex(); 
                    break;
                }
            }
        }

        // Traduction du nom en français depuis l'API
        const speciesResFinal = await fetch(data.species.url);
        const speciesDataFinal = await speciesResFinal.json();
        const frenchName = speciesDataFinal.names.find(n => n.language.name === "fr")?.name || data.name;

        // Détermination du nom de la région
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

        // Injection des données dans la fiche
        pokemonImage.src = data.sprites.other['official-artwork'].front_default;
        document.getElementById('pokemonName').innerText = frenchName.toUpperCase();
        pokemonNumberDisplay.innerHTML = `N° ${id} — <strong>Région de ${regionNom}</strong>`;

        // Badges des types
        data.types.forEach(t => {
            const badge = document.createElement('span');
            badge.className = `type-badge type-${t.type.name}`;
            badge.innerText = dicoTypes[t.type.name] || t.type.name.toUpperCase();
            typesContainer.appendChild(badge);
        });

        // Barres de statistiques
        if (statsContainer) {
            const statsTraductions = {'hp':'PV','attack':'ATQ','defense':'DEF','special-attack':'ATQ.SP','special-defense':'DEF.SP','speed':'VIT'};
            data.stats.forEach(s => {
                const percent = Math.min((s.base_stat / 150) * 100, 100);
                const statRow = document.createElement('div');
                statRow.className = 'stat-row';
                statRow.innerHTML = `<span class="stat-label">${statsTraductions[s.stat.name] || s.stat.name}</span><div class="stat-bar-bg"><div class="stat-bar-fill bg-${s.stat.name}" style="width: ${percent}%"></div></div><span class="stat-value">${s.base_stat}</span>`;
                statsContainer.appendChild(statRow);
            });
        }

        document.getElementById('pokemonCard').classList.remove('hidden');
        updateGrid(id, data.sprites.front_default, frenchName);

    } catch (error) { console.error(error); }
    input.value = "";
}

// 4. GRILLE ET PROGRESSION (FIXED)
function updateGrid(id, spriteUrl, name) {
    let regionKey = "";
    for (let key in progressionParRegion) {
        const [start, end] = key.split('-').map(Number);
        if (id >= start && id <= end) { regionKey = key; break; }
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

function getRandomPokemon() { document.getElementById('pokemonInput').value = Math.floor(Math.random() * 1025) + 1; getPokemon(); }

// QUIZ CORRIGÉ
document.getElementById('quizBtn').addEventListener('click', async function() {
    document.getElementById('pokemonTypes').innerHTML = '';
    document.getElementById('pokemonNumber').innerText = '';
    document.getElementById('pokemonStats').innerHTML = '';
    currentQuizId = Math.floor(Math.random() * 1025) + 1;
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${currentQuizId}`);
    const data = await response.json();
    const pokemonImage = document.getElementById('pokemonImage');
    pokemonImage.src = data.sprites.other['official-artwork'].front_default;
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

        const forceJoueur = playerData.stats[1].base_stat + (avantage * 25);
        const defenseAdversaire = opponentData.stats[2].base_stat;
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