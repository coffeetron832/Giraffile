// Límite universal robusto (1.5 GB) soportado gracias al flujo por fragmentos (Chunks)
const MAX_SIZE_BYTES = 1500 * 1024 * 1024; 
let intervaloTemporizador = null;
let archivoCargado = null;
let currentLang = 'en'; // Se define inglés como idioma por defecto al iniciar
let peerInstance = null; 
let objetoUrlActivo = null; // Variable global para el control de fugas de memoria RAM (Object URLs)

// Colección global para persistir la cola de múltiples archivos seleccionados
let coleccionArchivos = [];

const DB_NAME = "GirafileDB"; 
const DB_VERSION = 1;
const STORE_NAME = "archivos";
const CHUNK_SIZE = 256 * 1024; 

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
        dropLabel: "Arrastra cualquier archivo o haz clic abajo (Máx 1.5GB):",
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
        noPreviewNotice: "📦 Este formato no admite vista previa en el navegador o supera el tamaño de renderizado directo. Usa el botón de abajo para descargarlo de manera segura:",
        errNoFile: "Por favor, selecciona o arrastra un archivo primero.",
        errNotAllowed: "El archivo excede el tamaño máximo permitido (Máx 1.5GB).",
        successLink: "¡Enlace creado con éxito!",
        previewTitle: "Echa un vistazo a tu archivo",
        timeRemaining: "Tiempo restante de visualización:",
        fileLabel: "Archivo:",
        errNoExist: "El archivo no existe o ya ha sido eliminado por seguridad.",
        errExpired: "¡Este enlace ha caducado y el contenido fue destruido permanentemente!",
        errTimeOut: "¡El tiempo se ha agotado! El archivo ha sido completamente borrado de la memoria de forma segura.",
        p2pConnecting: "Cargando archivo...",
        p2pEstimado: "Tiempo estimado restante:",
        p2pCalculando: "calculando...",
        descifrando: "Preparando archivo ...",
        qrLabel: "Escanea para recibir el archivo",
        footer: '<a href="https://github.com/coffeetron832/Giraffile" target="_blank" style="color: var(--text-color); text-decoration: underline; font-weight: bold;">Giraffile</a> v1.1.0 | © 2026 jahp. Todos los derechos reservados. | <a href="#" onclick="abrirDisclaimer(event)" style="color: var(--text-color); text-decoration: underline; margin-left: 5px;">Aviso Legal</a>',
        disclaimerTitle: "Descargo de Responsabilidad (Disclaimer)",
        disclaimerBody: `
        <p><strong>Giraffile</strong> funciona como un canal de transporte privado P2P (Peer-to-Peer) directo entre dispositivos. Los archivos no se suben, analizan ni almacenan en ningún servidor externo.</p>
        <p>⚠️ <strong>Aviso sobre malware:</strong> Al ser una transferencia directa y cifrada, la plataforma no escanea ni verifica la seguridad del contenido. <strong>Giraffile no se hace responsable</strong> por software malicioso, virus o archivos infectados transmitidos a través de los enlaces. Es responsabilidad exclusiva del receptor verificar la procedencia del archivo y contar con un antivirus activo antes de realizar la descarga.</p>
        `,
        // Nuevas traducciones añadidas
        spaceLabel: "Espacio:",
        filesInQueue: "archivos en cola",
        errLocalDB: "Error local al procesar el almacenamiento.",
        textTruncated: "[... Archivo truncado por rendimiento para evitar colgar el navegador ...]",
        defaultFileName: "archivo_descargado"
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
        dropLabel: "Drag any file or click below (Max 1.5GB):",
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
        noPreviewNotice: "📦 Preview is not supported for this file type or size in the browser. Use the button below to download securely:",
        errNoFile: "Please select or drag a file first.",
        errNotAllowed: "The file exceeds the maximum size allowed (Max 1.5GB).",
        successLink: "Link created successfully!",
        previewTitle: "Take a look at your file",
        timeRemaining: "Remaining viewing time:",
        fileLabel: "File:",
        errNoExist: "The file does not exist or has already been deleted for security.",
        errExpired: "This link has expired and the content was permanently destroyed!",
        errTimeOut: "Time's up! The file has been completely and securely erased from memory.",
        p2pConnecting: "Loading file...",
        p2pEstimado: "Estimated time remaining:",
        p2pCalculando: "calculating...",
        descifrando: "Preparing file...",
        qrLabel: "Scan to receive the file",
        footer: '<a href="https://github.com/coffeetron832/Giraffile" target="_blank" style="color: var(--text-color); text-decoration: underline; font-weight: bold;">Giraffile</a> v1.1.0 | © 2026 jahp. All rights reserved. | <a href="#" onclick="abrirDisclaimer(event)" style="color: var(--text-color); text-decoration: underline; margin-left: 5px;">Legal Disclaimer</a>',
        disclaimerTitle: "Legal Disclaimer",
        disclaimerBody: `
        <p><strong>Giraffile</strong> operates as a private, content-agnostic P2P (Peer-to-Peer) transport channel directly between devices. Files are never uploaded, scanned, or stored on external servers.</p>
        <p>⚠️ <strong>Malware Notice:</strong> Since transfers are direct and encrypted, the platform does not scan or verify file security. <strong>Giraffile is not responsible</strong> for any malware, viruses, or infected files transmitted through shared links. It is the sole responsibility of the recipient to verify the sender's trustworthiness and run appropriate antivirus software before downloading.</p>
        `,
        // Nuevas traducciones añadidas
        spaceLabel: "Space:",
        filesInQueue: "files in queue",
        errLocalDB: "Local error processing storage.",
        textTruncated: "[... File truncated for performance to prevent browser lag ...]",
        defaultFileName: "downloaded_file"
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
            if(e.dataTransfer.files.length) manejarSeleccionArchivo(e.dataTransfer);
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
            if (coleccionArchivos.length === 1) {
                prompt.innerHTML = `<strong>${escaparHTML(t.dropSelected)}</strong> ${escaparHTML(coleccionArchivos[0].name)} (${tamanoMB} MB)`;
            } else {
                prompt.innerHTML = `<strong>${escaparHTML(t.dropSelected)}</strong> ${coleccionArchivos.length} ${escaparHTML(t.filesInQueue)} (${tamanoMB} MB)`;
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
    // Al iniciar, toma el idioma del localStorage o usa 'en' (Inglés) por defecto de forma estricta.
    currentLang = localStorage.getItem('girafile-lang') || 'en';
    document.documentElement.lang = currentLang;
    const savedTheme = localStorage.getItem('girafile-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    aplicarTraduccion();
    ejecutarLimpiezaGarbageCollector();
    verificarLinkCompartido();
};

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
        aplicarTraduccion();
        return;
    }

    let tamañoTotalBytes = coleccionArchivos.reduce((acc, file) => acc + file.size, 0);
    let porcentajeUso = (tamañoTotalBytes / MAX_SIZE_BYTES) * 100;
    let tamanoTotalMB = (tamañoTotalBytes / (1024 * 1024)).toFixed(2);
    let maxMB = (MAX_SIZE_BYTES / (1024 * 1024)).toFixed(0);

    if (limiteContainer) limiteContainer.style.display = "block";
    if (barreLimite) barreLimite.value = Math.min(porcentajeUso, 100);
    if (lblLimite) lblLimite.innerHTML = `${escaparHTML(t.spaceLabel)} <strong>${tamanoTotalMB} MB</strong> / ${maxMB} MB`;

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
        aplicarTraduccion();
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
            // Inicializar JSZip para empaquetar los archivos de verdad[cite: 6]
            const zip = new JSZip();
            
            // Añadir individualmente cada archivo real de la cola.
            // Si dos archivos tienen el mismo nombre se pisarían dentro del zip
            // (JSZip sobrescribe la entrada), así que desambiguamos: foto.png -> foto (1).png
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

            // Generar el empaquetado ZIP asíncronamente reportando el progreso[cite: 6]
            blobFinalParaGuardar = await zip.generateAsync({ type: "blob" }, (metadata) => {
                const porcentajeCompresion = Math.floor(metadata.percent);
                if (prepBar) prepBar.value = porcentajeCompresion;
                if (prepText) prepText.innerText = `${t.descifrando} (${porcentajeCompresion}%)`;
            });
        } else {
            // Animación de barra de progreso segura para carga unitaria
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

        // Registrar el peso final calculado (crucial para transferencias P2P eficientes)
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
// MOTOR P2P MÁXIMA OPTIMIZACIÓN Y CONTROL DE EXCEPCIONES
// =========================================================================

function inicializarTransmisionP2P(fileId, payload) {
    if (peerInstance) peerInstance.destroy();
    
    peerInstance = new Peer(fileId);

    peerInstance.on('connection', (conn) => {
        conn.on('data', async (data) => {
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
                    
                    if (conn.bufferSize > 512 * 1024) { 
                        setTimeout(enviarSiguienteFlujo, 10);
                        return;
                    }

                    while (offset < totalSize && conn.bufferSize <= 512 * 1024) {
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

function conectarYDescargarP2P(fileId, contentDiv, metaDiv, previewDiv) {
    const t = i18n[currentLang];
    
    if (contentDiv) {
        contentDiv.innerHTML = `
            <p id="p2pLoader" style="color: var(--text-color); font-weight: bold; margin-bottom: 5px;">${escaparHTML(t.p2pConnecting)} (0%)</p>
            <p id="p2pEstimadoCont" style="font-size: 0.85em; color: var(--footer-color); margin-top: 0;">${escaparHTML(t.p2pEstimado)} <span id="p2pTimeRemaining">${escaparHTML(t.p2pCalculando)}</span></p>
        `;
    }
    
    if (peerInstance) peerInstance.destroy();
    peerInstance = new Peer(); 

    let arraysDeFragmentos = [];
    let metaDataBackup = null; 
    let tiempoInicio = Date.now(); 

    peerInstance.on('open', () => {
        const conn = peerInstance.connect(fileId, { 
            reliable: true,
            ordered: true 
        });
        
        conn.on('open', () => {
            tiempoInicio = Date.now(); 
            conn.send({ request: 'DOWNLOAD_FILE_STREAM' });
        });

        conn.on('data', (data) => {
            const loader = document.getElementById("p2pLoader");
            const tiempoEstimadoSpan = document.getElementById("p2pTimeRemaining");
            
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
                
                if (loader) loader.innerText = `${t.p2pConnecting} (${Math.floor(data.progress)}%)`;
                
                if (tiempoEstimadoSpan && metaDataBackup) {
                    const tiempoTranscurridoMs = Date.now() - tiempoInicio;
                    const bytesDescargados = arraysDeFragmentos.length * CHUNK_SIZE;
                    
                    if (bytesDescargados > 0 && tiempoTranscurridoMs > 200) {
                        const velocidadBytesPorMs = bytesDescargados / tiempoTranscurridoMs;
                        const bytesRestantes = metaDataBackup.size - bytesDescargados;
                        
                        if (bytesRestantes > 0 && velocidadBytesPorMs > 0) {
                            const tiempoRestanteSegundos = Math.ceil(bytesRestantes / (velocidadBytesPorMs * 1000));
                            
                            const minRestantes = Math.floor(tiempoRestanteSegundos / 60);
                            const segRestantes = tiempoRestanteSegundos % 60;
                            tiempoEstimadoSpan.innerText = `${minRestantes.toString().padStart(2, '0')}:${segRestantes.toString().padStart(2, '0')}`;
                        }
                    }
                }
            }

            if (data.eof) {
                if (loader) loader.innerText = `${t.p2pConnecting} (100%)`;
                if (tiempoEstimadoSpan) tiempoEstimadoSpan.innerText = "00:00";

                const tipoMime = data.type || (metaDataBackup ? metaDataBackup.type : "application/octet-stream");
                const blobReconstruido = new Blob(arraysDeFragmentos, { type: tipoMime });
                arraysDeFragmentos = []; 

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
        });

        conn.on('close', () => {
            if (arraysDeFragmentos.length > 0 && !metaDataBackup) {
                if (contentDiv) contentDiv.innerHTML = `<p class='error'>${escaparHTML(t.errNoExist)}</p>`;
            }
        });
    });

    peerInstance.on('error', () => {
        if (contentDiv) contentDiv.innerHTML = `<p class='error'>${escaparHTML(t.errNoExist)}</p>`;
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

    const LIMITE_PREVIEW_VIVO = 40 * 1024 * 1024; 

    if (data.type.startsWith("image/") && data.size <= LIMITE_PREVIEW_VIVO) {
        contentDiv.innerHTML = `<img src="${urlObjeto}" style="max-width:100%; height:auto; border-radius: 4px;">`;
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
                textoFormateado += `\n\n${t.textTruncated}`;
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
