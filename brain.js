// Límite universal robusto (1.5 GB) soportado gracias al flujo por fragmentos (Chunks)
const MAX_SIZE_BYTES = 1500 * 1024 * 1024; 
// Límite máximo para renderizar la vista previa en el navegador (10 MB por defecto)
const MAX_PREVIEW_SIZE_BYTES = 10 * 1024 * 1024; 

let intervaloTemporizador = null;
let archivoCargado = null;
let peerInstance = null; 
let objetoUrlActivo = null; // Control de RAM

// Colección global para persistir la cola de múltiples archivos seleccionados
let coleccionArchivos = [];

const DB_NAME = "GirafileDB"; 
const DB_VERSION = 1;
const STORE_NAME = "archivos";
const CHUNK_SIZE = 256 * 1024;
const ESPERA_METADATA_MS = 4000;
const PAUSAR_FLUJO_BYTES = 8 * 1024 * 1024;
const REANUDAR_FLUJO_BYTES = 2 * 1024 * 1024;

function escaparHTML(cadena) {
    if (!cadena) return '';
    return cadena.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function ejecutarLimpiezaGarbageCollector() {
    abrirDB(function(db) {
        const ahora = Math.floor(Date.now() / 1000);
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        
        store.openCursor().onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                const registro = cursor.value;
                if (ahora > (registro.t + registro.d)) {
                    cursor.delete();
                }
                cursor.continue();
            }
        };
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        ['dragover', 'dragleave', 'drop'].forEach(evtName => {
            dropZone.addEventListener(evtName, e => e.preventDefault());
        });
        dropZone.addEventListener('dragover', () => dropZone.classList.add('drop-zone--over'));
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drop-zone--over'));
        dropZone.addEventListener('drop', (e) => {
            dropZone.classList.remove('drop-zone--over');
            if(e.dataTransfer.files.length) manejarSeleccionArchivo(e.dataTransfer);
        });
    }
});

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('girafile-theme', targetTheme);
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn && typeof i18n !== 'undefined' && i18n[currentLang]) {
        themeBtn.innerText = targetTheme === 'dark' ? i18n[currentLang].themeLight : i18n[currentLang].themeDark;
    }
}

function abrirDB(callback) {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = function(e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = function(e) { callback(e.target.result); };
}

window.onload = function() {
    currentLang = localStorage.getItem('girafile-lang') || 'es';
    document.documentElement.lang = currentLang;
    const savedTheme = localStorage.getItem('girafile-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    if (typeof aplicarTraduccion === 'function') {
        aplicarTraduccion();
    }
    ejecutarLimpiezaGarbageCollector();
    verificarLinkCompartido();
};

// Muestra exclusivamente las 3 tarjetas de beneficios omitiendo logo y eslogan
function renderizarSoloTarjetasBeneficios() {
    const infoBoxContainer = document.getElementById('infoBoxContainer');
    if (!infoBoxContainer || typeof i18n === 'undefined' || !i18n[currentLang]) return;

    const t = i18n[currentLang];
    
    infoBoxContainer.innerHTML = `
        <div class="features-grid" style="margin-top: 10px;">
            <div class="feature-card">
                <h3>${escaparHTML(t.useTitle || 'Sin registros')}</h3>
                <p>${escaparHTML(t.use1 || '')}</p>
            </div>
            <div class="feature-card">
                <h3>${escaparHTML(t.use2Title || 'Conexión P2P directa')}</h3>
                <p>${escaparHTML(t.use2 || '')}</p>
            </div>
            <div class="feature-card">
                <h3>${escaparHTML(t.use3Title || 'Enlaces temporales')}</h3>
                <p>${escaparHTML(t.use3 || '')}</p>
            </div>
        </div>
    `;
}

function manejarSeleccionArchivo(inputOrData) {
    const errorMsg = document.getElementById('errorMsg');
    const limiteContainer = document.getElementById('limiteContainer');
    const barreLimite = document.getElementById('barreLimite');
    const lblLimite = document.getElementById('lblLimite');
    const listaArchivos = document.getElementById('listaArchivos');
    const t = i18n[currentLang];
    
    const nuevosArchivos = Array.from(inputOrData.files || []);
    if (nuevosArchivos.length > 0) {
        coleccionArchivos = coleccionArchivos.concat(nuevosArchivos);
    }
    
    if (coleccionArchivos.length === 0) {
        if (limiteContainer) limiteContainer.style.display = "none";
        archivoCargado = null;
        if (typeof aplicarTraduccion === 'function') aplicarTraduccion();
        return;
    }

    let tamañoTotalBytes = coleccionArchivos.reduce((acc, file) => acc + file.size, 0);
    let porcentajeUso = (tamañoTotalBytes / MAX_SIZE_BYTES) * 100;
    let tamanoTotalMB = (tamañoTotalBytes / (1024 * 1024)).toFixed(2);
    let maxMB = (MAX_SIZE_BYTES / (1024 * 1024)).toFixed(0);

    if (limiteContainer) limiteContainer.style.display = "block";
    if (barreLimite) barreLimite.value = Math.min(porcentajeUso, 100);
    if (lblLimite) lblLimite.innerHTML = `${escaparHTML(t.spaceLabel || 'Espacio usado:')} <strong>${tamanoTotalMB} MB</strong> / ${maxMB} MB`;

    if (listaArchivos) {
        listaArchivos.innerHTML = "";
        coleccionArchivos.forEach((file, index) => {
            const li = document.createElement('li');
            li.style.cssText = "margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;";
            li.innerHTML = `<span style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 80%;">${escaparHTML(file.name)} (${(file.size/(1024*1024)).toFixed(2)} MB)</span>
                            <span onclick="quitarArchivoDeCola(${index}); event.stopPropagation();" style="color:red; cursor:pointer; font-weight:bold; padding: 0 5px;">✕</span>`;
            listaArchivos.appendChild(li);
        });
    }

    if (tamañoTotalBytes > MAX_SIZE_BYTES) {
        if (document.getElementById('fileInput')) document.getElementById('fileInput').value = "";
        archivoCargado = null;
        if (errorMsg) errorMsg.innerText = t.errNotAllowed;
        if (barreLimite) barreLimite.style.setProperty("accent-color", "red");
    } else {
        if (errorMsg) errorMsg.innerText = "";
        if (barreLimite) barreLimite.style.setProperty("accent-color", "var(--accent-color, #28a745)");
        
        archivoCargado = {
            name: coleccionArchivos.length === 1 ? coleccionArchivos[0].name : `Giraffile_Package_${Date.now()}.zip`,
            esMultiple: coleccionArchivos.length > 1,
            size: tamañoTotalBytes,
            type: coleccionArchivos.length === 1 ? coleccionArchivos[0].type : "application/zip"
        };
        if (typeof aplicarTraduccion === 'function') aplicarTraduccion();
    }
}

function quitarArchivoDeCola(index) {
    coleccionArchivos.splice(index, 1);
    manejarSeleccionArchivo({ files: [] }); 
}

async function generarLink() {
    const t = i18n[currentLang];
    if (!archivoCargado || coleccionArchivos.length === 0) {
        if (document.getElementById('errorMsg')) document.getElementById('errorMsg').innerText = t.errNoFile;
        return;
    }

    const outputDiv = document.getElementById('output');
    if (!outputDiv) return;

    outputDiv.innerHTML = `
        <div id="localPrepContainer" style="margin-top: 15px; background: var(--timer-bg); padding: 15px; border-radius: 4px;">
            <p id="localPrepText" style="font-weight: bold; font-size: 0.9em; margin-bottom: 8px; color: var(--text-color);">${escaparHTML(t.descifrando)} (0%)</p>
            <progress id="localPrepBar" value="0" max="100" style="width: 100%; height: 10px;"></progress>
        </div>
    `;

    const prepBar = document.getElementById('localPrepBar');
    const prepText = document.getElementById('localPrepText');

    const idUnico = "file_" + Math.random().toString(36).substring(2, 11);
    const duracionSegundos = parseInt(document.getElementById('expiry').value); 
    
    let blobFinalParaGuardar = null;

    try {
        if (archivoCargado.esMultiple) {
            const zip = new JSZip();
            const conteoNombres = {};
            coleccionArchivos.forEach(archivo => {
                let nombre = archivo.name;
                if (conteoNombres[nombre] === undefined) {
                    conteoNombres[nombre] = 0;
                } else {
                    const punto = nombre.lastIndexOf('.');
                    const base = punto > 0 ? nombre.slice(0, punto) : nombre;
                    const ext = punto > 0 ? nombre.slice(punto) : '';
                    nombre = `${base} (${++conteoNombres[archivo.name]})${ext}`;
                }
                zip.file(nombre, archivo);
            });

            blobFinalParaGuardar = await zip.generateAsync({ type: "blob" }, (metadata) => {
                const porcentajeCompresion = Math.floor(metadata.percent);
                if (prepBar) prepBar.value = porcentajeCompresion;
                if (prepText) prepText.innerText = `${t.descifrando} (${porcentajeCompresion}%)`;
            });
        } else {
            let progreso = 0;
            const incremento = coleccionArchivos[0].size > 100 * 1024 * 1024 ? 5 : 20;

            const iteraProgreso = setInterval(() => {
                progreso += incremento;
                if (progreso > 95) {
                    clearInterval(iteraProgreso);
                } else {
                    if (prepBar) prepBar.value = progreso;
                    if (prepText) prepText.innerText = `${t.descifrando} (${progreso}%)`;
                }
            }, 40);

            blobFinalParaGuardar = coleccionArchivos[0];
            
            await new Promise(resolve => setTimeout(resolve, 300));
            clearInterval(iteraProgreso);
        }

        archivoCargado.size = blobFinalParaGuardar.size;

        const payload = {
            id: idUnico,
            t: Math.floor(Date.now() / 1000),
            d: duracionSegundos,
            name: archivoCargado.name,
            type: archivoCargado.type,
            size: blobFinalParaGuardar.size,
            blob: blobFinalParaGuardar 
        };
        
        abrirDB(function(db) {
            const transaction = db.transaction([STORE_NAME], "readwrite");
            transaction.objectStore(STORE_NAME).put(payload);
            
            transaction.oncomplete = function() {
                if (prepBar) prepBar.value = 100;
                if (prepText) prepText.innerText = `${t.descifrando} (100%)`;

                setTimeout(() => {
                    const origen = window.location.origin === "null" ? "file://" : window.location.origin;
                    const link = origen + window.location.pathname + "#" + idUnico;
                    
                    outputDiv.innerHTML = `
                        <p style="color: green; font-weight: bold; margin-top: 10px;">${escaparHTML(t.successLink)}</p>
                        <textarea id="copyTarget" readonly onclick="this.select()">${escaparHTML(link)}</textarea>
                        <button class="btn" id="btnCopiar" onclick="copiarAlPortapapeles()">${escaparHTML(t.btnCopy)}</button>
                    `;

                    if (typeof QRCode !== 'undefined') {
                        const qrWrapper = document.createElement('div');
                        qrWrapper.id = 'qrWrapper';
                        qrWrapper.style.cssText = 'margin-top: 14px; text-align: center;';

                        const qrCaption = document.createElement('p');
                        qrCaption.style.cssText = 'margin-top: 6px; font-size: 0.8em; color: var(--footer-color);';
                        qrCaption.innerText = t.qrLabel;

                        outputDiv.appendChild(qrWrapper);
                        const rootStyle = getComputedStyle(document.documentElement);
                        new QRCode(qrWrapper, {
                            text: link,
                            width: 180,
                            height: 180,
                            colorDark: rootStyle.getPropertyValue('--text-color').trim(),
                            colorLight: rootStyle.getPropertyValue('--bg-color').trim()
                        });

                        const qrCanvas = qrWrapper.querySelector('canvas');
                        if (qrCanvas) qrCanvas.style.cssText = 'display: block; margin: 0 auto;';
                        const qrImg = qrWrapper.querySelector('img');
                        if (qrImg) qrImg.style.cssText = 'display: block; margin: 0 auto;';

                        qrWrapper.appendChild(qrCaption);
                    }

                    inicializarTransmisionP2P(idUnico, payload);

                    const chequeoExpiracionEmisor = setInterval(() => {
                        const ahora = Math.floor(Date.now() / 1000);
                        if (ahora > (payload.t + payload.d + 900)) { 
                            clearInterval(chequeoExpiracionEmisor);
                            eliminarArchivoDB(idUnico);
                            if (peerInstance && peerInstance.id === idUnico) {
                                peerInstance.destroy();
                                peerInstance = null;
                            }
                        }
                    }, 5000);

                }, 200);
            };

            transaction.onerror = function() {
                outputDiv.innerHTML = `<p class="error">${escaparHTML(t.errLocalDB)}</p>`;
            };
        });

    } catch (err) {
        console.error(err);
        outputDiv.innerHTML = `<p class="error">Error al comprimir los archivos: ${escaparHTML(err.message)}</p>`;
    }
}

function copiarAlPortapapeles() {
    const t = i18n[currentLang];
    const copyText = document.getElementById("copyTarget");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    
    const btn = document.getElementById("btnCopiar");
    btn.innerText = t.btnCopied;
    btn.style.background = "#28a745";
    btn.style.color = "#fff";
    setTimeout(() => {
        btn.innerText = t.btnCopy;
        btn.style.background = "var(--box-bg)";
        btn.style.color = "var(--text-color)";
    }, 2000);
}

function activarVistaInferior() {
    if (typeof mostrarCarga === 'function') {
        mostrarCarga();
    } else {
        const vBanner = document.getElementById('viewBanner');
        const vUpload = document.getElementById('viewUpload');
        if (vBanner && vUpload) {
            vBanner.classList.add('hidden-view');
            vUpload.classList.remove('hidden-view', 'fade-in-down');
            vUpload.classList.add('fade-in-up');
        }
    }
}

function verificarLinkCompartido() {
    const hash = window.location.hash.substring(1);
    if (!hash || !hash.startsWith("file_")) return;

    const mainWrapper = document.getElementById('main-wrapper');
    const previewDiv = document.getElementById('preview');
    const contentDiv = document.getElementById('fileContent');
    const metaDiv = document.getElementById('fileMeta');
    const t = i18n[currentLang];

    activarVistaInferior();

    if (mainWrapper && previewDiv) {
        mainWrapper.prepend(previewDiv);
    }

    if (previewDiv) previewDiv.style.display = "block";

    setTimeout(() => {
        if (previewDiv) previewDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);

    abrirDB(function(db) {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const request = transaction.objectStore(STORE_NAME).get(hash);

        request.onsuccess = function(e) {
            const data = e.target.result;

            if (!data) {
                conectarYDescargarP2P(hash, contentDiv, metaDiv, previewDiv);
                return;
            }

            const ahoraInicial = Math.floor(Date.now() / 1000);
            if (ahoraInicial > (data.t + data.d)) {
                eliminarArchivoDB(hash);
                if (contentDiv) contentDiv.innerHTML = `<p class='error'>${escaparHTML(t.errExpired)}</p>`;
                return;
            }

            renderizarVistaArchivo(data, contentDiv, metaDiv, previewDiv);
        };
    });
}

// MOTOR P2P
function inicializarTransmisionP2P(fileId, payload) {
    if (peerInstance) peerInstance.destroy();
    
    peerInstance = new Peer(fileId);

    peerInstance.on('connection', (conn) => {
        let flujoPausado = false;

        conn.on('data', async (data) => {
            if (data.request === 'FLOW_PAUSE') { flujoPausado = true; return; }
            if (data.request === 'FLOW_RESUME') { flujoPausado = false; return; }

            if (data.request === 'REQUEST_METADATA') {
                const ahora = Math.floor(Date.now() / 1000);
                if (ahora > (payload.t + payload.d + 900)) return;

                conn.send({
                    meta: true,
                    id: payload.id,
                    t: payload.t,
                    d: payload.d,
                    name: payload.name,
                    type: payload.type,
                    size: payload.size
                });
                return;
            }

            if (data.request === 'DOWNLOAD_FILE_STREAM') {
                const ahora = Math.floor(Date.now() / 1000);

                if (ahora > (payload.t + payload.d + 900)) {
                    eliminarArchivoDB(payload.id);
                    if (peerInstance) { peerInstance.destroy(); peerInstance = null; }
                    return;
                }

                let offset = 0;
                const totalSize = payload.blob.size;

                async function enviarSiguienteFlujo() {
                    if (!conn || conn.open === false) return;

                    if (flujoPausado || conn.bufferSize > 512 * 1024) {
                        setTimeout(enviarSiguienteFlujo, 10);
                        return;
                    }

                    while (offset < totalSize && !flujoPausado && conn.bufferSize <= 512 * 1024) {
                        const fragmentoBlob = payload.blob.slice(offset, offset + CHUNK_SIZE);
                        offset += CHUNK_SIZE;
                        const progresoReal = Math.min((offset / totalSize) * 100, 100);

                        const bufferCargado = await fragmentoBlob.arrayBuffer();

                        conn.send({
                            id: payload.id,
                            t: payload.t,
                            d: payload.d,
                            name: payload.name,
                            type: payload.type,
                            size: payload.size,
                            chunk: bufferCargado, 
                            progress: progresoReal
                        });
                    }

                    if (offset >= totalSize) {
                        conn.send({ 
                            eof: true,
                            t: payload.t,
                            d: payload.d,
                            name: payload.name,
                            type: payload.type,
                            size: payload.size
                        });
                    } else {
                        setTimeout(enviarSiguienteFlujo, 0);
                    }
                }

                await enviarSiguienteFlujo();
            }
        });
    });
}

function soportaGuardadoEnDisco() {
    return typeof window.showSaveFilePicker === 'function' && window.isSecureContext;
}

function conectarYDescargarP2P(fileId, contentDiv, metaDiv, previewDiv) {
    const t = i18n[currentLang];

    if (peerInstance) peerInstance.destroy();
    peerInstance = new Peer();

    let conexion = null;
    let arraysDeFragmentos = [];
    let metaDataBackup = null;
    let tiempoInicio = Date.now();
    let bytesRecibidos = 0;
    let modoRecepcion = null;
    let escritorDisco = null;
    let colaEscritura = Promise.resolve();
    let bytesEnCola = 0;
    let flujoPausado = false;
    let eligiendoDestino = false;
    let temporizadorMeta = null;
    let eofRecibido = false;
    let recepcionCompletada = false;

    mostrarProgreso(t.p2pConnecting);

    function mostrarProgreso(etiqueta) {
        if (!contentDiv) return;
        contentDiv.innerHTML = `
            <p id="p2pLoader" style="color: var(--text-color); font-weight: bold; margin-bottom: 5px;">${escaparHTML(etiqueta)} (0%)</p>
            <p id="p2pEstimadoCont" style="font-size: 0.85em; color: var(--footer-color); margin-top: 0;">${escaparHTML(t.p2pEstimado)} <span id="p2pTimeRemaining">${escaparHTML(t.p2pCalculando)}</span></p>
        `;
    }

    function mostrarEleccion(mensajeError) {
        if (!contentDiv || modoRecepcion) return;

        const tamanoMB = (metaDataBackup.size / (1024 * 1024)).toFixed(2);
        const aviso = mensajeError
            ? `<p class='error' style="margin-bottom: 15px;">${escaparHTML(mensajeError)}</p>`
            : '';

        contentDiv.innerHTML = `
            ${aviso}
            <div style="background: var(--timer-bg); padding: 20px; border-radius: 4px; text-align: center; margin-bottom: 15px;">
                <p style="font-size: 0.95em; color: var(--text-color); margin: 0 0 10px 0;">${escaparHTML(t.chooseTitle)}</p>
                <strong style="word-break: break-all; font-size: 1.1em; display: block; color: var(--text-color);">${escaparHTML(metaDataBackup.name)}</strong>
                <span style="font-size: 0.9em; color: var(--footer-color);">${tamanoMB} MB</span>
            </div>
            <button id="btnGuardarDisco" class="btn btn-primary" style="width: 100%; margin-bottom: 8px;">${escaparHTML(t.btnSaveToDisk)}</button>
            <p style="font-size: 0.85em; color: var(--footer-color); text-align: left; margin: 0 0 20px 0; line-height: 1.4;">${t.saveToDiskNotice}</p>
            <button id="btnVerNavegador" class="btn" style="width: 100%; margin-bottom: 8px;">${escaparHTML(t.btnViewInBrowser)}</button>
            <p style="font-size: 0.85em; color: var(--footer-color); text-align: left; margin: 0; line-height: 1.4;">${t.viewInBrowserNotice}</p>
        `;

        document.getElementById('btnGuardarDisco').addEventListener('click', iniciarRecepcionEnDisco);
        document.getElementById('btnVerNavegador').addEventListener('click', () => iniciarRecepcion('memoria'));
    }

    function iniciarRecepcion(modo) {
        if (modoRecepcion) return;

        if (!conexion || conexion.open === false) {
            if (contentDiv) contentDiv.innerHTML = `<p class='error'>${escaparHTML(t.errNoExist)}</p>`;
            return;
        }

        modoRecepcion = modo;
        if (temporizadorMeta) {
            clearTimeout(temporizadorMeta);
            temporizadorMeta = null;
        }
        mostrarProgreso(modo === 'disco' ? t.savingToDisk : t.p2pConnecting);
        tiempoInicio = Date.now();
        conexion.send({ request: 'DOWNLOAD_FILE_STREAM' });
    }

    async function iniciarRecepcionEnDisco() {
        if (eligiendoDestino || modoRecepcion) return;
        eligiendoDestino = true;

        let manejadorArchivo;
        try {
            manejadorArchivo = await window.showSaveFilePicker({
                suggestedName: metaDataBackup.name
            });
        } catch (error) {
            eligiendoDestino = false;
            mostrarEleccion(t.errSaveCancelled);
            return;
        }

        try {
            const flujoEscritura = await manejadorArchivo.createWritable();
            escritorDisco = flujoEscritura.getWriter();
        } catch (error) {
            eligiendoDestino = false;
            mostrarEleccion(t.errSaveFailed);
            return;
        }

        iniciarRecepcion('disco');
    }

    function fallarEscrituraEnDisco() {
        if (recepcionCompletada) return;
        recepcionCompletada = true;
        if (contentDiv) contentDiv.innerHTML = `<p class='error'>${escaparHTML(t.errSaveFailed)}</p>`;
        if (escritorDisco) {
            escritorDisco.abort().catch(() => {});
            escritorDisco = null;
        }
        if (peerInstance) {
            peerInstance.destroy();
            peerInstance = null;
        }
    }

    function actualizarProgreso(porcentaje) {
        const loader = document.getElementById("p2pLoader");
        const tiempoEstimadoSpan = document.getElementById("p2pTimeRemaining");
        const etiqueta = modoRecepcion === 'disco' ? t.savingToDisk : t.p2pConnecting;

        if (loader) loader.innerText = `${etiqueta} (${Math.floor(porcentaje)}%)`;
        if (!tiempoEstimadoSpan || !metaDataBackup) return;

        const tiempoTranscurridoMs = Date.now() - tiempoInicio;
        const bytesRestantes = metaDataBackup.size - bytesRecibidos;

        if (bytesRestantes <= 0) {
            tiempoEstimadoSpan.innerText = "00:00";
            return;
        }

        if (bytesRecibidos <= 0 || tiempoTranscurridoMs <= 200) return;

        const velocidadBytesPorMs = bytesRecibidos / tiempoTranscurridoMs;
        if (velocidadBytesPorMs <= 0) return;

        const tiempoRestanteSegundos = Math.ceil(bytesRestantes / (velocidadBytesPorMs * 1000));
        const minRestantes = Math.floor(tiempoRestanteSegundos / 60);
        const segRestantes = tiempoRestanteSegundos % 60;
        tiempoEstimadoSpan.innerText = `${minRestantes.toString().padStart(2, '0')}:${segRestantes.toString().padStart(2, '0')}`;
    }

    function procesarFragmento(data) {
        if (!metaDataBackup && data.size) {
            metaDataBackup = {
                t: data.t,
                d: data.d,
                name: data.name,
                type: data.type,
                size: data.size
            };
        }

        const fragmento = data.chunk instanceof ArrayBuffer ? new Uint8Array(data.chunk) : data.chunk;
        bytesRecibidos += fragmento.byteLength;

        if (modoRecepcion === 'disco') {
            bytesEnCola += fragmento.byteLength;
            colaEscritura = colaEscritura
                .then(() => escritorDisco.write(fragmento))
                .then(() => {
                    bytesEnCola -= fragmento.byteLength;
                    if (flujoPausado && bytesEnCola <= REANUDAR_FLUJO_BYTES) {
                        flujoPausado = false;
                        if (conexion && conexion.open) conexion.send({ request: 'FLOW_RESUME' });
                    }
                })
                .catch(fallarEscrituraEnDisco);

            if (!flujoPausado && bytesEnCola >= PAUSAR_FLUJO_BYTES) {
                flujoPausado = true;
                if (conexion && conexion.open) conexion.send({ request: 'FLOW_PAUSE' });
            }
        } else {
            arraysDeFragmentos.push(data.chunk);
        }

        actualizarProgreso(data.progress);
    }

    async function finalizarEnDisco(data) {
        actualizarProgreso(100);
        try {
            await colaEscritura;
            await escritorDisco.close();
        } catch (error) {
            fallarEscrituraEnDisco();
            return;
        }
        escritorDisco = null;

        recepcionCompletada = true;
        escritorDisco = null;

        const nombre = data.name || (metaDataBackup ? metaDataBackup.name : t.defaultFileName);
        const tamano = metaDataBackup ? metaDataBackup.size : bytesRecibidos;

        if (metaDiv) metaDiv.innerHTML = `<strong>${escaparHTML(t.fileLabel)}</strong> ${escaparHTML(nombre)} (${(tamano / (1024 * 1024)).toFixed(2)} MB)`;
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div style="background: var(--timer-bg); padding: 25px; border-radius: 4px; text-align: center;">
                    <p style="font-size: 1.05em; color: var(--text-color); margin: 0 0 10px 0;"><strong>${escaparHTML(t.savedToDiskTitle)}</strong></p>
                    <strong style="word-break: break-all; display: block; color: var(--text-color); margin-bottom: 15px;">${escaparHTML(nombre)}</strong>
                    <p style="font-size: 0.9em; color: var(--footer-color); margin: 0; line-height: 1.4;">${escaparHTML(t.savedToDiskNotice)}</p>
                </div>
            `;
        }

        if (peerInstance) {
            peerInstance.destroy();
            peerInstance = null;
        }
    }

    function finalizarEnMemoria(data) {
        actualizarProgreso(100);

        const tipoMime = data.type || (metaDataBackup ? metaDataBackup.type : "application/octet-stream");
        const blobReconstruido = new Blob(arraysDeFragmentos, { type: tipoMime });
        arraysDeFragmentos = [];
        recepcionCompletada = true;

        const tiempoActualReceptor = Math.floor(Date.now() / 1000);
        const duracionOriginal = data.d || (metaDataBackup ? metaDataBackup.d : 60);
        const tamanoReal = blobReconstruido.size > 0 ? blobReconstruido.size : (metaDataBackup ? metaDataBackup.size : 0);

        const objetoPayload = {
            id: fileId,
            t: tiempoActualReceptor,
            d: duracionOriginal,
            name: data.name || (metaDataBackup ? metaDataBackup.name : t.defaultFileName),
            type: tipoMime,
            size: tamanoReal,
            blob: blobReconstruido
        };

        abrirDB(function(db) {
            const tx = db.transaction([STORE_NAME], "readwrite");
            tx.objectStore(STORE_NAME).put(objetoPayload);
            tx.oncomplete = function() {
                renderizarVistaArchivo(objetoPayload, contentDiv, metaDiv, previewDiv);
                if (peerInstance) {
                    peerInstance.destroy();
                    peerInstance = null;
                }
            };
        });
    }

    peerInstance.on('open', () => {
        conexion = peerInstance.connect(fileId, {
            reliable: true,
            ordered: true
        });

        conexion.on('open', () => {
            tiempoInicio = Date.now();
            conexion.send({ request: 'REQUEST_METADATA' });

            temporizadorMeta = setTimeout(() => {
                if (!modoRecepcion) iniciarRecepcion('memoria');
            }, ESPERA_METADATA_MS);
        });

        conexion.on('data', (data) => {
            if (data.meta) {
                if (modoRecepcion) return;
                if (temporizadorMeta) {
                    clearTimeout(temporizadorMeta);
                    temporizadorMeta = null;
                }
                metaDataBackup = {
                    t: data.t,
                    d: data.d,
                    name: data.name,
                    type: data.type,
                    size: data.size
                };
                if (soportaGuardadoEnDisco()) mostrarEleccion();
                else iniciarRecepcion('memoria');
                return;
            }

            if (data.chunk) procesarFragmento(data);

            if (data.eof) {
                eofRecibido = true;
                if (modoRecepcion === 'disco') finalizarEnDisco(data);
                else finalizarEnMemoria(data);
            }
        });

        conexion.on('close', () => {
            if (recepcionCompletada || eofRecibido) return;

            if (modoRecepcion === 'disco' && escritorDisco) {
                fallarEscrituraEnDisco();
                return;
            }

            if (!modoRecepcion) {
                if (contentDiv) contentDiv.innerHTML = `<p class='error'>${escaparHTML(t.errNoExist)}</p>`;
                return;
            }

            if (arraysDeFragmentos.length > 0 && !metaDataBackup) {
                if (contentDiv) contentDiv.innerHTML = `<p class='error'>${escaparHTML(t.errNoExist)}</p>`;
            }
        });
    });

    peerInstance.on('error', () => {
        if (recepcionCompletada || eofRecibido) return;
        if (contentDiv) contentDiv.innerHTML = `<p class='error'>${escaparHTML(t.errNoExist)}</p>`;
    });
}

function renderizarVistaArchivo(data, contentDiv, metaDiv, previewDiv) {
    const t = i18n[currentLang];

    activarVistaInferior();
    if (previewDiv) previewDiv.style.display = "block";
    
    if (metaDiv) metaDiv.innerHTML = `<strong>${escaparHTML(t.fileLabel)}</strong> ${escaparHTML(data.name)} (${(data.size / (1024*1024)).toFixed(2)} MB)`;
    
    const timerGroup = document.getElementById('timerGroup');
    const lifeBar = document.getElementById('lifeBar');
    const timeString = document.getElementById('timeString');
    if (timerGroup) timerGroup.style.display = "block";

    if (intervaloTemporizador) clearInterval(intervaloTemporizador);
    
    intervaloTemporizador = setInterval(function() {
        const ahora = Math.floor(Date.now() / 1000);
        const tiempoTranscurrido = ahora - data.t;
        const tiempoRestante = data.d - tiempoTranscurrido;

        if (tiempoRestante <= 0) {
            clearInterval(intervaloTemporizador);
            eliminarArchivoDB(data.id);
            if (objetoUrlActivo) {
                URL.revokeObjectURL(objetoUrlActivo);
                objetoUrlActivo = null;
            }
            if (timerGroup) timerGroup.style.display = "none";
            if (metaDiv) metaDiv.style.display = "none";
            if (contentDiv) contentDiv.innerHTML = `<p class='error'>${escaparHTML(t.errTimeOut)}</p>`;
            return;
        }

        if (lifeBar) lifeBar.value = (tiempoRestante / data.d) * 100;
        const minutes = Math.floor(tiempoRestante / 60);
        const segundos = tiempoRestante % 60;
        if (timeString) timeString.innerText = `${minutes.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }, 1000);

    if (objetoUrlActivo) {
        URL.revokeObjectURL(objetoUrlActivo);
    }
    objetoUrlActivo = URL.createObjectURL(data.blob);
    const urlObjeto = objetoUrlActivo;

    if (!contentDiv) return;

    // EVALUACIÓN DE VISTA PREVIA SEGÚN PESO MÁXIMO
    const permiteVistaPrevia = data.size <= MAX_PREVIEW_SIZE_BYTES;

    if (permiteVistaPrevia && data.type.startsWith("image/")) {
        contentDiv.innerHTML = `<img src="${urlObjeto}" style="max-width:100%; height:auto; border-radius: 4px;">`;
    } else if (permiteVistaPrevia && data.type === "application/pdf") {
        contentDiv.innerHTML = `
            <embed src="${urlObjeto}" type="application/pdf" width="100%" height="450px" style="border-radius: 4px; margin-bottom:10px;">
            <a href="${urlObjeto}" download="${escaparHTML(data.name)}" class="btn btn-primary" style="text-decoration:none; text-align:center; display:block;">${escaparHTML(t.btnDownload)}</a>
        `;
    } else if (permiteVistaPrevia && (data.type.startsWith("text/") || data.name.endsWith(".json") || data.name.endsWith(".js") || data.name.endsWith(".css"))) {
        const bytesVistaPrevia = 50 * 1024;
        const fragmentoSeguro = data.blob.slice(0, bytesVistaPrevia);
        const lectorTexto = new FileReader();
        
        lectorTexto.onload = function(evt) {
            let textoFormateado = escaparHTML(evt.target.result);
            let descargaAdicional = '';
            
            if (data.size > bytesVistaPrevia) {
                textoFormateado += `\n\n${t.textTruncated || ''}`;
                descargaAdicional = `<p style="font-size:0.9em; margin: 15px 0 5px 0; color:var(--footer-color); text-align:center;">${escaparHTML(t.textPreviewNotice || '')}</p>`;
            }
            
            contentDiv.innerHTML = `
                <pre style="white-space: pre-wrap; background: var(--timer-bg); padding: 10px; border-radius: 4px; max-height: 300px; overflow-y: auto; font-family: monospace; font-size: 0.9em; text-align:left;">${textoFormateado}</pre>
                ${descargaAdicional}
                <a href="${urlObjeto}" download="${escaparHTML(data.name)}" class="btn btn-primary" style="text-decoration: none; text-align:center; display:block; margin-top:5px;">${escaparHTML(t.btnDownload)}</a>
            `;
        };
        lectorTexto.readAsText(fragmentoSeguro);
    } else {
        contentDiv.innerHTML = `
            <div style="background: var(--timer-bg); padding: 25px; border-radius: 4px; text-align: center; margin-bottom: 10px;">
                <p style="font-size: 0.95em; color: var(--text-color); margin-bottom: 15px;">${escaparHTML(t.noPreviewNotice)}</p>
                <strong style="word-break: break-all; font-size: 1.1em; display: block; color: var(--text-color);">${escaparHTML(data.name)}</strong>
            </div>
            <a href="${urlObjeto}" download="${escaparHTML(data.name)}" class="btn btn-primary" style="text-decoration: none; text-align:center; display:block;">${escaparHTML(t.btnDownload)}</a>
        `;
    }
}

function eliminarArchivoDB(id) {
    abrirDB(function(db) {
        db.transaction([STORE_NAME], "readwrite").objectStore(STORE_NAME).delete(id);
    });
}

function abrirDisclaimer(event) {
    event.preventDefault();
    const t = i18n[currentLang];
    const modal = document.getElementById('modalDisclaimer');
    const contenido = document.getElementById('disclaimerContenido');
    
    if (modal && contenido) {
        contenido.innerHTML = `
            <h2 style="margin-top: 0; color: var(--text-color);">${t.disclaimerTitle}</h2>
            <hr style="border: 0; border-top: 1px solid var(--timer-bg); margin: 15px 0;">
            <div style="color: var(--text-color); font-size: 0.95em; text-align: left; line-height: 1.5;">
                ${t.disclaimerBody}
            </div>
        `;
        modal.style.display = 'flex';
    }
}

function cerrarDisclaimer() {
    const modal = document.getElementById('modalDisclaimer');
    if (modal) modal.style.display = 'none';
}

window.addEventListener('click', (e) => {
    const modal = document.getElementById('modalDisclaimer');
    if (e.target === modal) cerrarDisclaimer();
});
