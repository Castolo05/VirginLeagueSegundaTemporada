const equiposIniciales = [
    "Atletico de Madrid", "Milan", "Chelsea", "Manchester United", "Real Madrid",
    "Liverpool", "Tottenham", "Benfica", "Valencia", "Inter",
    "Villareal", "Bayern Munich", "Roma", "Lyon", "Ajax",
    "Arsenal", "Juventus", "Barcelona"
];

const equipos = {};
const jugadores = {
    "Atletico de Madrid": "Victoria Heyd",
    "Milan": "Julian Rivero",
    "Chelsea": "Nahuel Lamorte",
    "Manchester United": "Santiago Marzolino",
    "Real Madrid": "Ulises Banus",
    "Liverpool": "Fausto Guaita",
    "Tottenham": "Mateo Alonso",
    "Benfica": "Enzo Palmieri",
    "Valencia": "Facundo Berbel",
    "Inter": "Julian Gonzalez",
    "Villareal": "Daniel Gongora",
    "Bayern Munich": "Tomas Loto",
    "Roma": "Daniel Cordoba",
    "Lyon": "BOT",
    "Ajax": "Isaias Aguilar",
    "Arsenal": "Franco Nelli",
    "Juventus": "Delfina Catalan",
    "Barcelona": "Esteban Raffaeli"
};

equiposIniciales.forEach(equipo => {
    equipos[equipo] = {
        jugador: jugadores[equipo] || "Desconocido",
        PJ: 0,
        PG: 0,
        PE: 0,
        PP: 0,
        GF: 0,
        GC: 0,
        Pts: 0
    };
});

const fixtures = {};

fetch('liga_futbol.txt')
    .then(response => response.text())
    .then(data => {
        const lines = data.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));
        
        lines.forEach(line => {
            const [fecha, equipoLocal, golesLocal, golesVisitante, equipoVisitante] = line.split('|').map(s => s.trim());
            if (fecha && equipoLocal && equipoVisitante) {
                if (!fixtures[fecha]) {
                    fixtures[fecha] = [];
                }
                fixtures[fecha].push({ equipoLocal, golesLocal, golesVisitante, equipoVisitante });

                const golesLocalNum = parseInt(golesLocal);
                const golesVisitanteNum = parseInt(golesVisitante);

                if (!isNaN(golesLocalNum) && !isNaN(golesVisitanteNum)) {
                    updateTeamStats(equipoLocal, golesLocalNum, golesVisitanteNum);
                    updateTeamStats(equipoVisitante, golesVisitanteNum, golesLocalNum);
                }
            }
        });

        updateTable();
        updateFixtures();
    })
    .catch(error => console.error('Error al cargar el archivo:', error));

function normalizarNombreEquipo(nombre) {
    return nombre.trim().toLowerCase().replace(/\s+/g, ' ');
}

function updateTeamStats(equipo, golesFavor, golesContra) {
    const nombreNormalizado = normalizarNombreEquipo(equipo);
    const equipoEncontrado = Object.keys(equipos).find(e => normalizarNombreEquipo(e) === nombreNormalizado);

    if (!equipoEncontrado) {
        console.warn(`El equipo "${equipo}" no está en la lista inicial. Verifique el nombre.`);
        return;
    }

    equipos[equipoEncontrado].PJ++;
    equipos[equipoEncontrado].GF += golesFavor;
    equipos[equipoEncontrado].GC += golesContra;

    if (golesFavor > golesContra) {
        equipos[equipoEncontrado].PG++;
        equipos[equipoEncontrado].Pts += 3;
    } else if (golesFavor < golesContra) {
        equipos[equipoEncontrado].PP++;
    } else {
        equipos[equipoEncontrado].PE++;
        equipos[equipoEncontrado].Pts++;
    }
}

function updateTable() {
    const tableBody = document.getElementById('ligaBody');
    tableBody.innerHTML = '';

    const sortedTeams = Object.entries(equipos)
        .filter(([, stats]) => stats.PJ > 0)
        .sort(([,a], [,b]) => b.Pts - a.Pts || (b.GF - b.GC) - (a.GF - a.GC));

    sortedTeams.forEach(([equipo, stats], index) => {
        const row = tableBody.insertRow();
        let positionClass = '';
        if (index < 5) positionClass = 'pos-1-5';
        else if (index < 13) positionClass = 'pos-6-13';
        else positionClass = 'pos-14-18';

        row.innerHTML = `
            <td class="${positionClass} position-column">${index + 1}</td>
            <td class="highlight">${equipo}</td>
            <td>${stats.jugador}</td>
            <td class="pts-column">${stats.Pts}</td>
            <td>${stats.PJ}</td>
            <td>${stats.PG}</td>
            <td>${stats.PE}</td>
            <td>${stats.PP}</td>
            <td>${stats.GF}</td>
            <td>${stats.GC}</td>
            <td>${stats.GF - stats.GC}</td>
        `;
    });
}

function updateFixtures() {
    const fixturesContainer = document.getElementById('fixtures');
    fixturesContainer.innerHTML = '';

    Object.entries(fixtures).forEach(([fecha, partidos]) => {
        const fixtureElement = document.createElement('div');
        fixtureElement.className = 'fixture';
        fixtureElement.innerHTML = `<h3>Fecha ${fecha}</h3>`;

        partidos.forEach(partido => {
            const matchElement = document.createElement('div');
            matchElement.className = 'match';
            const golesLocal = parseInt(partido.golesLocal);
            const golesVisitante = parseInt(partido.golesVisitante);
            
            let localClass = '', visitanteClass = '';
            if (isNaN(golesLocal) || isNaN(golesVisitante)) {
                localClass = visitanteClass = 'not-played';
            } else if (golesLocal > golesVisitante) {
                localClass = 'winner';
                visitanteClass = 'loser';
            } else if (golesLocal < golesVisitante) {
                localClass = 'loser';
                visitanteClass = 'winner';
            } else {
                localClass = visitanteClass = 'draw';
            }

            matchElement.innerHTML = `
                <span class="team ${localClass} highlight">${partido.equipoLocal}</span>
                <span class="score">
                    <span class="highlight">${partido.golesLocal}</span>
                    <span class="vs">VS</span>
                    <span class="highlight">${partido.golesVisitante}</span>
                </span>
                <span class="team team-right ${visitanteClass} highlight">${partido.equipoVisitante}</span>
            `;
            fixtureElement.appendChild(matchElement);
        });

        fixturesContainer.appendChild(fixtureElement);
    });
}