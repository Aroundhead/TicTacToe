// ------------------ Variables Globales ------------------

let winnerLine = null;
// ------------------ Settings ------------------
const Settings = (() => {
    const colors = {
        par: '#ffffff',
        impar: '#dddddd',
        gana: '#f00'
    };

    const setColor = (type, value) => {
        document.documentElement.style.setProperty(`--${type}`, value);
        colors[type] = value;
    };

    const getColor = (type) => colors[type];

    return {
        setColor,
        getColor
    };
})();

// ------------------ Utils ------------------
const Utils = (() => {
    const tablero = document.getElementById("boardContainer");

    const createCell = (id) => {
        const cell = document.createElement("button");
        cell.classList.add("celda");
        cell.id = `celda-${id}`;
        cell.value = "";
        return cell;
    };

    const getCells = () => document.querySelectorAll(".celda");

    return {
        createCell,
        getCells,
        tablero
    };
})();

// ------------------ Game ------------------
const Game = (() => {
    let turno = false;
    let terminado = false;
    let contador = 0;
    let timerStarted = false;

    const personajes = {
        par1: ["cara1", "cruz1"],
        par2: ["cara2", "cruz2"],
        par3: ["cara3", "cruz3"]
    };

    const imagenes = {
        cara1: "./img/cara1.png",
        cruz1: "./img/cruz1.png",
        cara2: "./img/cara2.png",
        cruz2: "./img/cruz2.png",
        cara3: "./img/cara3.png",
        cruz3: "./img/cruz3.png",
        x: "./img/x.png"
    };

    let currentPair = personajes.par1;

    const initBoard = () => {
        Utils.tablero.innerHTML = "";
        for (let i = 0; i < 9; i++) {
            const cell = Utils.createCell(i);
            cell.addEventListener("click", () => jugar(cell));
            Utils.tablero.appendChild(cell);
        }
        document.getElementById("turnDisplay").textContent = "Turno: Jugador 1";
        document.getElementById("nextTurnImage").src = imagenes[currentPair[0]];
        Timer.reset();
        contador = 0;
        terminado = false;
    };

    const cambiarPersonaje = (key) => {
        currentPair = personajes[key];
        updateExistingImages();
        document.getElementById("nextTurnImage").src = imagenes[currentPair[turno ? 1 : 0]];
    };

    const updateExistingImages = () => {
        Utils.getCells().forEach(cell => {
            if (cell.value === "cara1" || cell.value === "cara2" || cell.value === "cara3") {
                cell.style.backgroundImage = `url(${imagenes[currentPair[0]]})`;
                cell.value = currentPair[0];
            }
            if (cell.value === "cruz1" || cell.value === "cruz2" || cell.value === "cruz3") {
                cell.style.backgroundImage = `url(${imagenes[currentPair[1]]})`;
                cell.value = currentPair[1];
            }
        });
    };

    const jugar = (cell) => {
        if (terminado || cell.value !== "") return;
    
        if (!timerStarted) {
            Timer.start();
            timerStarted = true;
        }
    
        TurnTimer.start(); 
    
        const personaje = currentPair[turno ? 1 : 0];
        cell.value = personaje;
        cell.style.backgroundImage = `url(${imagenes[personaje]})`;
        turno = !turno;
        contador++;
    
        document.getElementById("turnDisplay").textContent = "Turno: Jugador " + (turno ? "2" : "1");
        document.getElementById("nextTurnImage").src = imagenes[currentPair[turno ? 1 : 0]];
    
        Verificador.verificarVictoria(currentPair);
    };
    
    const finalizar = (mensaje) => {
        terminado = true;
        Utils.getCells().forEach(cell => cell.disabled = true);
        document.getElementById("turnDisplay").textContent = mensaje;
        Timer.stop();
        TurnTimer.stop(); // 🔥 detener turno también
    };
    
    const reset = () => {
        turno = false;
        timerStarted = false;
        initBoard();
    };

    return {
        cambiarPersonaje,
        reset,
        finalizar,
        imagenes,
        currentPair
    };
})();

// ------------------ Turn Timer (per turn) ------------------
const TurnTimer = (() => {
    let tiempo = 30;
    let intervalo;

    const start = () => {
        clearInterval(intervalo);
        tiempo = 30;
        actualizar();

        intervalo = setInterval(() => {
            tiempo--;
            actualizar();
            if (tiempo <= 0) {
                Game.finalizar("¡Se acabó el tiempo del turno!");
                clearInterval(intervalo);
            }
        }, 1000);
    };

    const actualizar = () => {
        const display = document.getElementById("turnTimer");
        if (display) {
            display.textContent = tiempo < 10 ? `0${tiempo}` : `${tiempo}`;
        }
    };
    
    const stop = () => clearInterval(intervalo);

    const reset = () => {
        stop();
        tiempo = 30;
    };

    return { start, stop, reset };
})();

// ------------------ Timer ------------------
const Timer = (() => {
    let tiempo = 180;
    let intervalo;

    const start = () => {
        intervalo = setInterval(() => {
            tiempo--;
            actualizar();
            if (tiempo <= 0) {
                Game.finalizar("¡Tiempo agotado!");
                clearInterval(intervalo);
            }
        }, 1000);
    };

    const actualizar = () => {
        const min = String(Math.floor(tiempo / 60)).padStart(2, '0');
        const seg = String(tiempo % 60).padStart(2, '0');
        document.getElementById("timer").textContent = `${min}:${seg}`;
    };

    const stop = () => clearInterval(intervalo);

    const reset = () => {
        stop();
        tiempo = 180;
        actualizar();
    };

    return { start, stop, reset };
})();

// ------------------ Verificador ------------------
const Verificador = (() => {
    const combinaciones = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas
        [0, 4, 8], [2, 4, 6]             // diagonales
    ];

    const dibujarLineaGanadora = (a, b, c) => {
        const board = document.getElementById("boardContainer");
        winnerLine = document.createElement("div");
        winnerLine.classList.add("linea-ganadora");
        
        const celdaA = document.getElementById(`celda-${a}`);
        const celdaC = document.getElementById(`celda-${c}`);
        
        const rectA = celdaA.getBoundingClientRect();
        const rectC = celdaC.getBoundingClientRect();
        
        const boardRect = board.getBoundingClientRect();
        
        const x1 = rectA.left + rectA.width / 2 - boardRect.left;
        const y1 = rectA.top + rectA.height / 2 - boardRect.top;
        const x2 = rectC.left + rectC.width / 2 - boardRect.left;
        const y2 = rectC.top + rectC.height / 2 - boardRect.top;
        
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        winnerLine.style.width = `${length}px`;      // 🔥 Usar winnerLine
        winnerLine.style.transform = `translate(${x1}px, ${y1}px) rotate(${angle}deg)`;
        
        const colorLinea = getComputedStyle(document.documentElement).getPropertyValue('--gana').trim();
        winnerLine.style.backgroundColor = colorLinea;
        
        board.appendChild(winnerLine);               // 🔥 Append correcto
        
    };
    
    const verificarVictoria = ([img1, img2]) => {
        const celdas = [...Utils.getCells()].map(c => c.value);
        for (const [a, b, c] of combinaciones) {
            if (celdas[a] && celdas[a] === celdas[b] && celdas[a] === celdas[c]) {
                dibujarLineaGanadora(a, b, c);
                Game.finalizar(`Ganador: ${celdas[a]}`);
                return;
            }
        }

        if (!celdas.includes("")) {
            Game.finalizar("Empate");
        }
    };

    return { verificarVictoria };
})();

// ------------------ Inicializar ------------------
document.addEventListener("DOMContentLoaded", () => {
    Game.reset();

    document.getElementById("btnReset").addEventListener("click", Game.reset);

    document.getElementById("imageSelector").addEventListener("change", (e) => {
        Game.cambiarPersonaje(e.target.value);
    });

    document.getElementById("evenCellColor").addEventListener("input", (e) => {
        Settings.setColor("par", e.target.value);
    });

    document.getElementById("oddCellColor").addEventListener("input", (e) => {
        Settings.setColor("impar", e.target.value);
    });

    document.getElementById("winLineColor").addEventListener("input", (e) => {
        Settings.setColor("gana", e.target.value);
    
        // 🔥 Si ya hay línea ganadora dibujada, actualizamos su color
        if (winnerLine) {
            winnerLine.style.backgroundColor = e.target.value;
        }
    });
});
