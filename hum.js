// hum.js - Lógica de traducción e idioma de Giraffile

let currentLang = 'en'; // Inglés por defecto

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
        btnCopy: "Copiar Enlace",
        btnCopied: "¡Enlace Copiado!",
        btnDownload: "Descargar Completo",
        textPreviewNotice: "Mostrando una vista previa del archivo de texto. Para ver todo el contenido:",
        noPreviewNotice: "Este formato no admite vista previa en el navegador o supera el tamaño de renderizado directo. Usa el botón de abajo para descargarlo de manera segura:",
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
        footer: '<a href="https://github.com/coffeetron832/Giraffile" target="_blank" style="color: var(--text-color); text-decoration: underline; font-weight: bold;">Giraffile</a> v2.2.0 | © 2026 jahp. Todos los derechos reservados. | <a href="#" onclick="abrirDisclaimer(event)" style="color: var(--text-color); text-decoration: underline; margin-left: 5px;">Aviso Legal</a>',
        disclaimerTitle: "Descargo de Responsabilidad (Disclaimer)",
        disclaimerBody: `
        <p><strong>Giraffile</strong> funciona como un canal de transporte privado P2P (Peer-to-Peer) directo entre dispositivos. Los archivos no se suben, analizan ni almacenan en ningún servidor externo.</p>
        <p><strong>Aviso sobre malware:</strong> Al ser una transferencia directa y cifrada, la plataforma no escanea ni verifica la seguridad del contenido. <strong>Giraffile no se hace responsable</strong> por software malicioso, virus o archivos infectados transmitidos a través de los enlaces. Es responsabilidad exclusiva del receptor verificar la procedencia del archivo y contar con un antivirus activo antes de realizar la descarga.</p>
        `,
        spaceLabel: "Espacio:",
        filesInQueue: "archivos en cola",
        errLocalDB: "Error local al procesar el almacenamiento.",
        textTruncated: "[... Archivo truncado por rendimiento para evitar colgar el navegador ...]",
        defaultFileName: "archivo_descargado",
        chooseTitle: "¿Cómo quieres recibir este archivo?",
        btnSaveToDisk: "Guardar en disco",
        btnViewInBrowser: "Ver en el navegador",
        saveToDiskNotice: "Se escribe directamente en tu equipo mientras se recibe, sin llenar la memoria del navegador. <strong>No caduca:</strong> el archivo queda guardado y eres tú quien decide cuándo borrarlo.",
        viewInBrowserNotice: "Se carga en la memoria del navegador, con vista previa y temporizador. <strong>Se destruye al caducar.</strong> Recomendado para archivos pequeños.",
        savingToDisk: "Guardando en tu disco...",
        savedToDiskTitle: "Archivo guardado en tu equipo",
        savedToDiskNotice: "Este archivo ya no depende de Giraffile ni caduca: vive en tu equipo. Bórralo tú cuando no lo necesites.",
        errSaveCancelled: "Guardado cancelado. Elige cómo quieres recibir el archivo.",
        errSaveFailed: "No se pudo escribir el archivo en el disco. Vuelve a intentarlo o recíbelo en el navegador."
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
        btnCopy: "Copy Link",
        btnCopied: "Link Copied!",
        btnDownload: "Download Full File",
        textPreviewNotice: "Showing a preview of the text file. To see the full content:",
        noPreviewNotice: "Preview is not supported for this file type or size in the browser. Use the button below to download securely:",
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
        footer: '<a href="https://github.com/coffeetron832/Giraffile" target="_blank" style="color: var(--text-color); text-decoration: underline; font-weight: bold;">Giraffile</a> v2.2.0 | © 2026 jahp. All rights reserved. | <a href="#" onclick="abrirDisclaimer(event)" style="color: var(--text-color); text-decoration: underline; margin-left: 5px;">Legal Disclaimer</a>',
        disclaimerTitle: "Legal Disclaimer",
        disclaimerBody: `
        <p><strong>Giraffile</strong> operates as a private, content-agnostic P2P (Peer-to-Peer) transport channel directly between devices. Files are never uploaded, scanned, or stored on external servers.</p>
        <p><strong>Malware Notice:</strong> Since transfers are direct and encrypted, the platform does not scan or verify file security. <strong>Giraffile is not responsible</strong> for any malware, viruses, or infected files transmitted through shared links. It is the sole responsibility of the recipient to verify the sender's trustworthiness and run appropriate antivirus software before downloading.</p>
        `,
        spaceLabel: "Space:",
        filesInQueue: "files in queue",
        errLocalDB: "Local error processing storage.",
        textTruncated: "[... File truncated for performance to prevent browser lag ...]",
        defaultFileName: "downloaded_file",
        chooseTitle: "How do you want to receive this file?",
        btnSaveToDisk: "Save to disk",
        btnViewInBrowser: "View in browser",
        saveToDiskNotice: "Written straight to your device as it arrives, without filling up browser memory. <strong>It does not expire:</strong> the file stays on your device and you decide when to delete it.",
        viewInBrowserNotice: "Loaded into browser memory, with preview and countdown. <strong>Destroyed when it expires.</strong> Recommended for small files.",
        savingToDisk: "Saving to your disk...",
        savedToDiskTitle: "File saved to your device",
        savedToDiskNotice: "This file no longer depends on Giraffile and does not expire: it lives on your device. Delete it yourself when you no longer need it.",
        errSaveCancelled: "Save cancelled. Choose how you want to receive the file.",
        errSaveFailed: "The file could not be written to disk. Try again or receive it in the browser."
    }
};

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

    const infoBox = document.getElementById('infoBoxContainer');
    if (infoBox) {
        infoBox.innerHTML = `
            <div class="brand-container">
                <img src="giraffe.svg" alt="Mascota" class="mascot-img">
            </div>
            
            <div class="hero-intro">
                <h2 class="hero-hook">${t.hook}</h2>
                <p class="hero-desc">${t.desc2}</p>
            </div>

            <p style="margin-top: 25px; margin-bottom: 12px; font-weight: bold; text-align: center;">${t.useTitle}</p>
            
            <div class="cards-container">
                <div class="card-item">
                    <div class="card-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <div>${t.use1}</div>
                </div>
                <div class="card-item">
                    <div class="card-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                    </div>
                    <div>${t.use2}</div>
                </div>
                <div class="card-item">
                    <div class="card-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <div>${t.use3}</div>
                </div>
            </div>
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
        if (typeof coleccionArchivos === 'undefined' || coleccionArchivos.length === 0) {
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
