// Límite universal robusto aumentado a 3.5 GB
const MAX_SIZE_BYTES = 3.5 * 1024 * 1024 * 1024; 
let intervaloTemporizador = null;
let archivoCargado = null;
let currentLang = 'es';
let peerInstance = null; 
let objetoUrlActivo = null; // Variable global para el control de fugas de memoria RAM (Object URLs)

// Colección para persistir la cola de múltiples archivos seleccionados
let coleccionArchivos = [];

const DB_NAME = "GirafileDB"; 
const DB_VERSION = 1;
const STORE_NAME = "archivos";
const CHUNK_SIZE = 256 * 1024; // Mantenemos tu tamaño de fragmento idóneo y seguro

const i18n = {
    es: {
        themeDark: "Modo Oscuro",
        themeLight: "Modo Claro",
        langBtn: "English",
        pageTitle: "Giraffile - La jirafa que protege tus archivos",
        hook: "¿Te preocupa dejar tus archivos rondando por internet?",
        desc2: "Esta herramienta te permite compartir cualquier tipo de archivo de manera privada mediante un enlace corto sin subirlos a internet. Todo el contenido se almacena de forma temporal en tu propio dispositivo de manera 100% segura.",
        useTitle: "¿Para qué puedes usar Giraffile?",
        use1: "<strong>Información sensible:</strong> Credenciales, datos financieros, contratos o documentos personales.",
        use2: "<strong>Cualquier Formato:</strong> Envía imágenes, PDFs, archivos comprimidos (ZIP/RAR), audios o videos.",
        use3: "<strong>Privacidad total:</strong> Envío seguro de archivos sin dejar rastro en servidores externos.",
        prepare: "Prepara tu archivo para enviar",
        dropLabel: "Arrastra tus archivos o haz clic abajo (Máx 3.5GB):",
        dropPrompt: "Arrastra un archivo aquí o haz clic para buscar",
        dropSelected: "Archivo seleccionado:",
        expiryLabel: "Tiempo de Caducidad:",
        opt2: "2 Minutos (Para archivos pequeños)",
        opt5: "5 Minutos",
        opt10: "10 Minutos",
        btnGenerate: "Generar enlace seguro",
        btnCopy: "Copiar Enlace 📋",
        btnCopied: "¡Enlace Copiado! ✓",
        btnDownload: "Descargar Completo 📥",
        textPreviewNotice: "📋 Mostrando una vista previa del archivo de texto. Para ver todo el contenido:",
        noPreviewNotice: "📦 Este formato no admite vista previa en el navegador debido a su tamaño o extensión. Usa el botón de abajo para guardarlo:",
        errNoFile: "Por favor, selecciona o arrastra un archivo primero.",
        errNotAllowed: "El archivo excede el tamaño máximo permitido (Máx 3.5GB).",
        successLink: "¡Enlace creado con éxito!",
        previewTitle: "Echa un vistazo a tu archivo",
        timeRemaining: "Tiempo restante de visualización:",
        fileLabel: "Archivo:",
        errNoExist: "El archivo no existe, el emisor se desconectó o ya ha sido eliminado por seguridad.",
        errExpired: "¡Este enlace ha caducado y el contenido fue destruido permanentemente!",
        errTimeOut: "¡El tiempo se ha agotado! El archivo ha sido completamente borrado de la memoria de forma segura.",
        p2pConnecting: "Cargando archivo...",
        descifrando: "Preparando archivo ...",
        qrLabel: "Escanea para recibir el archivo",
        etaLabel: "Tiempo estimado restante:",
        etaCalculando: "Calculando...",
        etaCompletado: "¡Transferencia completada!",
        footer: '<a href="https://github.com/coffeetron832/Giraffile" target="_blank" style="color: var(--text-color); text-decoration: underline; font-weight: bold;">Giraffile</a> v1.0.1 | © 2026 jahp. Todos los derechos reservados. | <a href="#" onclick="abrirDisclaimer(event)" style="color: var(--text-color); text-decoration: underline; margin-left: 5px;">Aviso Legal</a>',
        disclaimerTitle: "Descargo de Responsabilidad (Disclaimer)",
        disclaimerBody: `
        <p><strong>Giraffile</strong> funciona como un canal de transporte privado P2P (Peer-to-Peer) directo entre dispositivos. Los archivos no se suben, analizan ni almacenan en ningún servidor externo.</p>
        <p>⚠️ <strong>Aviso sobre malware:</strong> Al ser una transferencia directa y cifrada, la plataforma no escanea ni verifica la seguridad del contenido. <strong>Giraffile no se hace responsable</strong> por software malicioso, virus o archivos infectados transmitidos a través de los enlaces. Es responsabilidad exclusiva del receptor verificar la procedencia del archivo y contar con un antivirus activo antes de realizar la descarga.</p>
        `
    },
    en: {
        themeDark: "Dark Mode",
        themeLight: "Light Mode",
        langBtn: "Español",
        pageTitle: "Giraffile - The giraffe that protects your files",
        hook: "Worried about leaving your files floating around the internet?",
        desc2: "This tool allows you to share any file type privately using a short link without uploading them to the internet. All content is temporarily stored on your own device in a 100% secure way.",
        useTitle: "What can you use Giraffile for?",
        use1: "<strong>Sensitive Information:</strong> Credentials, financial data, contracts, or personal documents.",
        use2: "<strong>Any Format:</strong> Send images, PDFs, compressed archives (ZIP/RAR), audios, or videos.",
        use3: "<strong>Total Privacy:</strong> Send files without leaving a trace on external servers.",
        prepare: "Prepare your file to send",
        dropLabel: "Drag any file or click below (Max 3.5GB):",
        dropPrompt: "Drag a file here or click to browse",
        dropSelected: "Selected file:",
        expiryLabel: "Expiration Time:",
        opt2: "2 Minutes (For small files)",
        opt5: "5 Minutes",
        opt10: "10 Minutes",
        btnGenerate: "Generate secure link",
        btnCopy: "Copy Link 📋",
        btnCopied: "Link Copied! ✓",
        btnDownload: "Download Full File 📥",
        textPreviewNotice: "📋 Showing a preview of the text file. To see the full content:",
        noPreviewNotice: "📦 Preview is not supported for this file type or size in the browser. Use the button below to download:",
        errNoFile: "Please select or drag a file first.",
        errNotAllowed: "The file exceeds the maximum size allowed (Max 3.5GB).",
        successLink: "Link created successfully!",
        previewTitle: "Take a look at your file",
        timeRemaining: "Remaining viewing time:",
        fileLabel: "File:",
        errNoExist: "The file does not exist, the sender went offline, or it has already been deleted for security.",
        errExpired: "This link has expired and the content was permanently destroyed!",
        errTimeOut: "Time's up! The file has been completely and securely erased from memory.",
        p2pConnecting: "Loading file...",
        descifrando: "Preparing file...",
        qrLabel: "Scan to receive the file",
        etaLabel: "Estimated time remaining:",
        etaCalculando: "Calculating...",
        etaCompletado: "Transfer completed!",
        footer: '<a href="https://github.com/coffeetron832/Giraffile" target="_blank" style="color: var(--text-color); text-decoration: underline; font-weight: bold;">Giraffile</a> v1.0.1 | © 2026 jahp. All rights reserved. | <a href="#" onclick="abrirDisclaimer(event)" style="color: var(--text-color); text-decoration: underline; margin-left: 5px;">Legal Disclaimer</a>',
        disclaimerTitle: "Legal Disclaimer",
        disclaimerBody: `
        <p><strong>Giraffile</strong> operates as a private, content-agnostic P2P (Peer-to-Peer) transport channel directly between devices. Files are never uploaded, scanned, or stored on external servers.</p>
        <p>⚠️ <strong>Malware Notice:</strong> Since transfers are direct and encrypted, the platform does not scan or verify file security. <strong>Giraffile is not responsible</strong> for any malware, viruses, or infected files transmitted through shared links. It is the sole responsibility of the recipient to verify the sender's trustworthiness and run appropriate antivirus software before downloading.</p>
        `
    }
};

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
            if(e.dataTransfer.files.length) manejarSeleccionMultiple(e.dataTransfer);
        });
    }
});

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('girafile-theme', targetTheme);
    document.getElementById('themeBtn').innerText = targetTheme === 'dark' ? i18n[currentLang].themeLight : i18n[currentLang].themeDark;
}

function toggleLanguage() {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    localStorage.setItem('girafile-lang', currentLang);
    document.documentElement.lang = currentLang;
    aplicarTraduccion();
}

function aplicarTraduccion() {
    const t = i18n[currentLang];
    document.title = t.pageTitle; 
    document.getElementById('langBtn').innerText = t.langBtn;
    const currentTheme = document.documentElement.getAttribute('data-theme');
    document.getElementById('themeBtn').innerText = currentTheme === 'dark' ? t.themeLight : t.themeDark;

    const infoBox = document.getElementById('infoBoxContainer');
    if (infoBox) {
        infoBox.innerHTML = `
            <div class="brand-container">
                <img src="giraffe.png" alt="Mascota" class="mascot-img">
            </div>
            <p class="highlight-yellow"><strong>${t.hook}</strong></p>
            <p>${t.desc2}</p>
            <p><strong>${t.useTitle}</strong></p>
            <ul style="padding-left: 20px;">
                <li>${t.use1}</li>
                <li>${t.use2}</li>
                <li>${t.use3}</li>
            </ul>
        `;
    }

    if (document.getElementById('lblPrepare')) document.getElementById('lblPrepare').innerText = t.prepare;
    if (document.getElementById('lblDropZone')) document.getElementById('lblDropZone').innerText = t.dropLabel;
    if (document.getElementById('lblExpiry')) document.getElementById('lblExpiry').innerText = t.expiryLabel;
    if (document.getElementById('opt2m')) document.getElementById('opt2m').innerText = t.opt2;
    if (document.getElementById('opt5m')) document.getElementById('opt5m').innerText = t.opt5;
    if (document.getElementById('opt10m')) document.getElementById('opt10m').innerText = t.opt10;
    if (document.getElementById('btnGenerar')) document.getElementById('btnGenerar').innerText = t.btnGenerate;
    if (document.getElementById('lblPreviewTitle')) document.getElementById('lblPreviewTitle').innerText = t.previewTitle;
    if (document.getElementById('lblTimeRemaining')) document.getElementById('lblTimeRemaining').innerText = t.timeRemaining;
    if (document.getElementById('footerText')) document.getElementById('footerText').innerHTML = t.footer;

    const prompt = document.getElementById('dropZonePrompt');
    if (prompt) {
        if (coleccionArchivos.length === 0) {
            prompt.innerText = t.dropPrompt;
        } else {
            const tamañoTotalBytes = coleccionArchivos.reduce((acc, file) => acc + file.size, 0);
            const tamanoMB = (tamañoTotalBytes / (1024 * 1024)).toFixed(2);
            if(coleccionArchivos.length === 1) {
                prompt.innerHTML = `<strong>${escaparHTML(t.dropSelected)}</strong> ${escaparHTML(coleccionArchivos[0].name)} (${tamanoMB} MB)`;
            } else {
                prompt.innerHTML = `<strong>${escaparHTML(t.dropSelected)}</strong> ${coleccionArchivos.length} archivos en cola (${tamanoMB} MB)`;
            }
        }
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
    
    aplicarTraduccion();
    ejecutarLimpiezaGarbageCollector(); 
    verificarLinkCompartido();
};

function manejarSeleccionMultiple(inputOrData) {
    const errorMsg = document.getElementById('errorMsg');
    const limiteContainer = document.getElementById('limiteContainer');
    const barreLimite = document.getElementById('barreLimite');
    const lblLimite = document.getElementById('lblLimite');
    const listaArchivos = document.getElementById('listaArchivos');
    const t = i18n[currentLang];
    
    const nuevosArchivos = Array.from(inputOrData.files);
    coleccionArchivos = coleccionArchivos.concat(nuevosArchivos);
    
    if (coleccionArchivos.length === 0) {
        if(limiteContainer) limiteContainer.style.display = "none";
        archivoCargado = null;
        aplicarTraduccion();
        return;
    }

    let tamañoTotalBytes = coleccionArchivos.reduce((acc, file) => acc + file.size, 0);
    let porcentajeUso = (tamañoTotalBytes / MAX_SIZE_BYTES) * 100;
    let tamanoTotalMB = (tamañoTotalBytes / (1024 * 1024)).toFixed(2);
    let maxMB = (MAX_SIZE_BYTES / (1024 * 1024)).toFixed(0);

    if(limiteContainer) limiteContainer.style.display = "block";
    if(barreLimite) barreLimite.value = Math.min(porcentajeUso, 100);
    if(lblLimite) lblLimite.innerHTML = `Espacio: <strong>${tamanoTotalMB} MB</strong> / ${maxMB} MB`;

    if(listaArchivos) {
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
        if(document.getElementById('fileInput')) document.getElementById('fileInput').value = "";
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
        aplicarTraduccion();
    }
}

function quitarArchivoDeCola(index) {
    coleccionArchivos.splice(index, 1);
    manejarSeleccionMultiple({ files: [] }); 
}

function generarLink() {
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

    setTimeout(async () => {
        let blobFinalParaGuardar;

        try {
            if (archivoCargado.esMultiple) {
                if (prepText) prepText.innerText = `${t.descifrando} (Estructurando metadatos...)`;
                const zip = new JSZip();
                
                let archivosProcesados = 0;
                for (const file of coleccionArchivos) {
                    if (prepText) {
                        prepText.innerText = `${t.descifrando} (Preparando: ${archivosProcesados + 1}/${coleccionArchivos.length})`;
                    }
                    
                    zip.file(file.name, file, { binary: true });
                    
                    archivosProcesados++;
                    if (prepBar) prepBar.value = Math.min((archivosProcesados / coleccionArchivos.length) * 30, 30);
                    await new Promise(r => setTimeout(r, 5));
                }
                
                if (prepText) prepText.innerText = `${t.descifrando} (Procesando empaquetado seguro...)`;
                await new Promise(r => setTimeout(r, 10));
                
                blobFinalParaGuardar = await zip.generateAsync({ 
                    type: "blob",
                    compression: "STORE"
                }, function updateCallback(metadata) {
                    if (prepBar) {
                        let progresoInterno = 30 + Math.floor(metadata.percent * 0.4);
                        prepBar.value = Math.min(progresoInterno, 70);
                    }
                    if (prepText) {
                        prepText.innerText = `${t.descifrando} (Escribiendo contenedor: ${Math.floor(metadata.percent)}%)`;
                    }
                });

            } else {
                blobFinalParaGuardar = coleccionArchivos[0];
            }
        } catch (err) {
            console.error("Error crítico en el proceso de empaquetado:", err);
            if (outputDiv) outputDiv.innerHTML = `<p class="error">Error local de memoria al empaquetar lote: ${escaparHTML(err.message)}</p>`;
            return;
        }

        let progreso = 70; 
        const incremento = 3;

        const iteraProgreso = setInterval(() => {
            progreso += incremento;
            if (progreso > 97) {
                clearInterval(iteraProgreso); 
            } else {
                if (prepBar) prepBar.value = progreso;
                if (prepText) prepText.innerText = `${t.descifrando} (${progreso}%)`;
            }
        }, 40);

        // Creamos el payload base con un tiempo provisional para evitar desajustes
        const payload = {
            id: idUnico,
            t: Math.floor(Date.now() / 1000),
            d: duracionSegundos,
            name: archivoCargado.name,
            type: archivoCargado.esMultiple ? "application/zip" : blobFinalParaGuardar.type,
            size: blobFinalParaGuardar.size,
            blob: blobFinalParaGuardar 
        };
        
        abrirDB(function(db) {
            const transaction = db.transaction([STORE_NAME], "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            
            store.put(payload);
            
            transaction.oncomplete = function() {
                clearInterval(iteraProgreso);
                if (prepBar) prepBar.value = 100;
                if (prepText) prepText.innerText = `${t.descifrando} (100%)`;

                // Sincronizamos el tiempo exacto en el que el empaque finaliza y el link se activa
                payload.t = Math.floor(Date.now() / 1000);
                
                const txTiempo = db.transaction([STORE_NAME], "readwrite");
                txTiempo.objectStore(STORE_NAME).put(payload);

                txTiempo.oncomplete = function() {
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
                    }, 200);
                };
            };

            transaction.onerror = function() {
                clearInterval(iteraProgreso);
                outputDiv.innerHTML = `<p class="error">Error local al procesar el almacenamiento.</p>`;
            };
        });
    }, 40);
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

function verificarLinkCompartido() {
    const hash = window.location.hash.substring(1);
    if (!hash || !hash.startsWith("file_")) return;

    const mainWrapper = document.getElementById('main-wrapper');
    const previewDiv = document.getElementById('preview');
    const contentDiv = document.getElementById('fileContent');
    const metaDiv = document.getElementById('fileMeta');
    const t = i18n[currentLang];

    if (mainWrapper && previewDiv) {
        mainWrapper.prepend(previewDiv);
    }

    abrirDB(function(db) {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const request = transaction.objectStore(STORE_NAME).get(hash);

        request.onsuccess = function(e) {
            const data = e.target.result;

            if (!data) {
                if (previewDiv) previewDiv.style.display = "block";
                conectarYDescargarP2P(hash, contentDiv, metaDiv, previewDiv);
                return;
            }

            const ahoraInicial = Math.floor(Date.now() / 1000);
            if (ahoraInicial > (data.t + data.d)) {
                eliminarArchivoDB(hash);
                if (previewDiv) previewDiv.style.display = "block";
                if (contentDiv) contentDiv.innerHTML = `<p class='error'>${escaparHTML(t.errExpired)}</p>`;
                return;
            }

            renderizarVistaArchivo(data, contentDiv, metaDiv, previewDiv);
        };
    });
}

// =========================================================================
// MOTOR P2P: FLUJO CONTROLADO Y REACTIVO POR EVENTOS (OPTIMIZADO CON FILE STREAM)
// =========================================================================

function inicializarTransmisionP2P(fileId, payload) {
    if (peerInstance) peerInstance.destroy();
    
    peerInstance = new Peer(fileId);

    peerInstance.on('connection', (conn) => {
        // Umbral bajo ideal para un procesamiento de baja latencia
        conn.bufferedAmountLowThreshold = 512 * 1024; 

        conn.on('data', async (data) => {
            if (data.request === 'DOWNLOAD_FILE_STREAM') {
                let offset = 0;
                const totalSize = payload.blob.size;
                let enviando = false;

                // MEJORA TÉCNICA CLAVE: Extraemos un Stream directo del archivo en disco de manera nativa.
                // En vez de usar blob.slice() repetidamente que duplica espacio en memoria RAM virtual,
                // leemos el archivo secuencialmente a través de su ReadableStream interno.
                const streamArchivo = payload.blob.stream();
                const lectorStream = streamArchivo.getReader();

                async function enviarSiguienteFlujo() {
                    if (!conn || conn.open === false || enviando) return; 
                    enviando = true;

                    try {
                        // El bucle corre de forma segura mientras el buffer de red WebRTC no esté saturado
                        while (offset < totalSize && conn.dataChannel.bufferedAmount < 1024 * 1024) {
                            const { done, value } = await lectorStream.read();
                            
                            if (done) break;

                            // Si el fragmento devuelto por el flujo del navegador difiere de nuestro CHUNK_SIZE base,
                            // lo enviamos directamente de forma dinámica optimizando la velocidad del hilo.
                            const bufferCargado = value.buffer; 
                            offset += value.byteLength;
                            const progresoReal = Math.min((offset / totalSize) * 100, 100);

                            conn.send({
                                id: payload.id,
                                t: payload.t,
                                d: payload.d,
                                name: payload.name,
                                type: payload.type,
                                size: payload.size,
                                chunk: bufferCargado, 
                                progress: progresoReal,
                                enTransferencia: true 
                            });
                        }
                    } catch (errStream) {
                        console.error("Fallo durante la lectura del stream de datos p2p:", errStream);
                    }

                    enviando = false;

                    if (offset >= totalSize) {
                        const tiempoFinTransferencia = Math.floor(Date.now() / 1000);
                        payload.t = tiempoFinTransferencia;
                        delete payload.enTransferencia;

                        abrirDB(function(db) {
                            db.transaction([STORE_NAME], "readwrite").objectStore(STORE_NAME).put(payload);
                        });

                        conn.send({ 
                            eof: true,
                            t: tiempoFinTransferencia,
                            d: payload.d,
                            name: payload.name,
                            type: payload.type,
                            size: payload.size
                        });
                        
                        setTimeout(() => {
                            eliminarArchivoDB(payload.id);
                            if (peerInstance && peerInstance.id === payload.id) {
                                peerInstance.destroy();
                                peerInstance = null;
                            }
                        }, payload.d * 1000);

                    } else if (conn.dataChannel.bufferedAmount >= 1024 * 1024) {
                        // Control reactivo pasivo: si el buffer se satura, pausamos y esperamos a que se vacíe.
                        conn.dataChannel.onbufferedamountlow = () => {
                            conn.dataChannel.onbufferedamountlow = null; 
                            enviarSiguienteFlujo(); 
                        };
                    }
                }

                await enviarSiguienteFlujo();
            }
        });
    });
}

function conectarYDescargarP2P(fileId, contentDiv, metaDiv, previewDiv) {
    const t = i18n[currentLang];
    if (contentDiv) {
        contentDiv.innerHTML = `
            <p id="p2pLoader" style="color: var(--text-color); font-weight: bold; margin-bottom: 5px;">${escaparHTML(t.p2pConnecting)} (0%)</p>
            <p id="p2pEta" style="font-size: 0.9em; color: var(--footer-color); margin-bottom: 15px;">${escaparHTML(t.etaLabel)} ${escaparHTML(t.etaCalculando)}</p>
        `;
    }
    
    if (peerInstance) peerInstance.destroy();
    peerInstance = new Peer(); 

    let arraysDeFragmentos = [];
    let metaDataBackup = null; 
    let tiempoInicio = null;
    let ultimoTiempoActualizacionUI = 0; 

    peerInstance.on('open', () => {
        const conn = peerInstance.connect(fileId, { 
            reliable: true,
            ordered: true 
        });
        
        conn.on('open', () => {
            tiempoInicio = performance.now();
            ultimoTiempoActualizacionUI = performance.now();
            conn.send({ request: 'DOWNLOAD_FILE_STREAM' });
        });

        conn.on('data', (data) => {
            const loader = document.getElementById("p2pLoader");
            const etaDisplay = document.getElementById("p2pEta");
            const ahoraMS = performance.now();
            
            if (data.chunk) {
                arraysDeFragmentos.push(data.chunk);
                
                if (!metaDataBackup && data.size) {
                    metaDataBackup = { 
                        t: data.t, 
                        d: data.d, 
                        name: data.name, 
                        type: data.type, 
                        size: data.size 
                    };
                }

                if (loader) {
                    loader.innerText = `${t.p2pConnecting} (${Math.floor(data.progress)}%)`;
                }

                if (etaDisplay && metaDataBackup && tiempoInicio && (ahoraMS - ultimoTiempoActualizacionUI >= 1000)) {
                    const tiempoTranscurridoMS = ahoraMS - tiempoInicio;
                    const bytesRecibidosHastaAhora = arraysDeFragmentos.length * CHUNK_SIZE;
                    
                    if (tiempoTranscurridoMS > 500 && bytesRecibidosHastaAhora > 0) {
                        const velocidadBytesPorSegundo = bytesRecibidosHastaAhora / (tiempoTranscurridoMS / 1000);
                        const bytesRestantes = metaDataBackup.size - bytesRecibidosHastaAhora;
                        
                        if (velocidadBytesPorSegundo > 0 && bytesRestantes > 0) {
                            const segundosRestantesTotales = bytesRestantes / velocidadBytesPorSegundo;
                            const minutes = Math.floor(segundosRestantesTotales / 60);
                            const segundos = Math.floor(segundosRestantesTotales % 60);
                            
                            if (minutes > 0) {
                                etaDisplay.innerText = `${t.etaLabel} ~ ${minutes} min y ${segundos} seg`;
                            } else {
                                etaDisplay.innerText = `${t.etaLabel} ~ ${segundos} seg`;
                            }
                            ultimoTiempoActualizacionUI = ahoraMS; 
                        }
                    }
                }
            }

            if (data.eof) {
                if (loader) loader.innerText = `${t.p2pConnecting} (100%)`;
                if (etaDisplay) etaDisplay.innerText = t.etaCompletado;

                const tipoMime = data.type || (metaDataBackup ? metaDataBackup.type : "application/octet-stream");
                const blobReconstruido = new Blob(arraysDeFragmentos, { type: tipoMime });
                arraysDeFragmentos = []; 

                const tiempoExactoDeDescargaCompleta = Math.floor(Date.now() / 1000);
                const duracionOriginal = data.d || (metaDataBackup ? metaDataBackup.d : 60);
                const tamanoReal = blobReconstructed.size > 0 ? blobReconstructed.size : (metaDataBackup ? metaDataBackup.size : 0);

                const objetoPayload = {
                    id: fileId,
                    t: tiempoExactoDeDescargaCompleta, 
                    d: duracionOriginal,
                    name: data.name || (metaDataBackup ? metaDataBackup.name : "archivo_descargado"),
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
        });

        conn.on('close', () => {
            if (arraysDeFragmentos.length === 0 && !metaDataBackup) {
                if (contentDiv) contentDiv.innerHTML = `<p class='error'>${escaparHTML(t.errNoExist)}</p>`;
            }
        });
    });

    peerInstance.on('error', () => {
        if (contentDiv) {
            contentDiv.innerHTML = `<p class='error'>${escaparHTML(t.errNoExist)}</p>`;
        }
    });
}

function renderizarVistaArchivo(data, contentDiv, metaDiv, previewDiv) {
    const t = i18n[currentLang];
    if (previewDiv) previewDiv.style.display = "block";
    
    if (metaDiv) metaDiv.innerHTML = `<strong>${escaparHTML(t.fileLabel)}</strong> ${escaparHTML(data.name)} (${(data.size / (1024*1024)).toFixed(2)} MB)`;
    
    const timerGroup = document.getElementById('timerGroup');
    const lifeBar = document.getElementById('lifeBar');
    const timeString = document.getElementById('timeString');
    if (timerGroup) timerGroup.style.display = "block";

    if (intervaloTemporizador) clearInterval(intervaloTemporizador);
    
    if (data.enTransferencia) {
        if (lifeBar) lifeBar.value = 100;
        if (timeString) timeString.innerText = "⏳ Transfiriendo...";
    } else {
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
    }

    if (objetoUrlActivo) {
        URL.revokeObjectURL(objetoUrlActivo);
    }
    objetoUrlActivo = URL.createObjectURL(data.blob);
    const urlObjeto = objetoUrlActivo;

    if (!contentDiv) return;

    const LIMITE_PREVIEW_VIVO = 40 * 1024 * 1024; 

    if (data.type.startsWith("image/") && data.size <= LIMITE_PREVIEW_VIVO) {
        contentDiv.innerHTML = `
            <img src="${urlObjeto}" style="max-width:100%; height:auto; border-radius: 4px; margin-bottom:10px;">
            <a href="${urlObjeto}" download="${escaparHTML(data.name)}" class="btn btn-primary" style="text-decoration:none; text-align:center; display:block;">${escaparHTML(t.btnDownload)}</a>
        `;
    } else if (data.type === "application/pdf" && data.size <= LIMITE_PREVIEW_VIVO) {
        contentDiv.innerHTML = `
            <embed src="${urlObjeto}" type="application/pdf" width="100%" height="450px" style="border-radius: 4px; margin-bottom:10px;">
            <a href="${urlObjeto}" download="${escaparHTML(data.name)}" class="btn btn-primary" style="text-decoration:none; text-align:center; display:block;">${escaparHTML(t.btnDownload)}</a>
        `;
    } else if ((data.type.startsWith("text/") || data.name.endsWith(".json") || data.name.endsWith(".js") || data.name.endsWith(".css")) && data.size <= LIMITE_PREVIEW_VIVO) {
        const bytesVistaPrevia = 50 * 1024;
        const fragmentoSeguro = data.blob.slice(0, bytesVistaPrevia);
        const lectorTexto = new FileReader();
        
        lectorTexto.onload = function(evt) {
            let textoFormateado = escaparHTML(evt.target.result);
            let descargaAdicional = '';
            
            if (data.size > bytesVistaPrevia) {
                textoFormateado += "\n\n[... Archivo truncado por rendimiento ...]";
                descargaAdicional = `<p style="font-size:0.9em; margin: 15px 0 5px 0; color:var(--footer-color); text-align:center;">${escaparHTML(t.textPreviewNotice)}</p>`;
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
            <div style="background: var(--timer-bg); padding: 25px; border-radius: 4px; text-align: center; margin-bottom: 15px;">
                <p style="font-size: 0.95em; color: var(--text-color); margin-bottom: 15px;">${escaparHTML(t.noPreviewNotice)}</p>
                <strong style="word-break: break-all; font-size: 1.1em; display: block; color: var(--text-color); margin-bottom: 10px;">${escaparHTML(data.name)}</strong>
            </div>
            <a href="${urlObjeto}" download="${escaparHTML(data.name)}" class="btn btn-primary" style="text-decoration: none; text-align:center; display:block; margin-top:5px;">${escaparHTML(t.btnDownload)}</a>
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
