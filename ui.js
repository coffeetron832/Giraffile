// ui.js - Manejo de interfaz, pasos del asistente, compresión ZIP y vista previa

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

function irAlPaso(paso) {
    pasoActual = paso;
    
    const s1 = document.getElementById('step1');
    const s2 = document.getElementById('step2');
    const s3 = document.getElementById('step3');
    
    if (s1) s1.style.display = 'none';
    if (s2) s2.style.display = 'none';
    if (s3) s3.style.display = 'none';
    
    const pasoActivo = document.getElementById(`step${paso}`);
    if (pasoActivo) pasoActivo.style.display = 'block';

    for (let i = 1; i <= 3; i++) {
        const ind = document.getElementById(`indicatorStep${i}`);
        if (ind) {
            if (i === paso) {
                ind.style.opacity = '1';
                ind.style.color = 'var(--accent-color, #28a745)';
            } else if (i < paso) {
                ind.style.opacity = '0.8';
                ind.style.color = 'var(--text-color)';
            } else {
                ind.style.opacity = '0.4';
                ind.style.color = 'var(--text-color)';
            }
        }
    }
}

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
    const btnNext = document.getElementById('btnNextToStep2');
    const t = i18n[currentLang];
    
    let nuevosArchivos = [];
    if (inputOrData.files) {
        nuevosArchivos = Array.from(inputOrData.files);
    } else if (inputOrData instanceof HTMLInputElement) {
        nuevosArchivos = Array.from(inputOrData.files);
    }

    if (nuevosArchivos.length > 0) {
        coleccionArchivos = coleccionArchivos.concat(nuevosArchivos);
    }
    
    if (coleccionArchivos.length === 0) {
        if (limiteContainer) limiteContainer.style.display = "none";
        if (btnNext) btnNext.style.display = "none";
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
        if (btnNext) btnNext.style.display = "none";
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
        
        if (btnNext && coleccionArchivos.length > 0) {
            btnNext.style.display = 'block';
        }
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
            const btnDescarga = document.getElementById('btnDescargaDirecta');
            if (btnDescarga) btnDescarga.style.display = 'none';
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

    const permiteVistaPrevia = data.size <= MAX_PREVIEW_SIZE_BYTES;

    if (permiteVistaPrevia && data.type.startsWith("image/")) {
        contentDiv.innerHTML = `<img src="${urlObjeto}" style="max-width:100%; height:auto; border-radius: 4px; display: block; margin-left: auto; margin-right: auto;">`;
    } else if (permiteVistaPrevia && data.type === "application/pdf") {
        contentDiv.innerHTML = `<embed src="${urlObjeto}" type="application/pdf" width="100%" height="450px" style="border-radius: 4px;">`;
    } else if (permiteVistaPrevia && (data.type.startsWith("text/") || data.name.endsWith(".json") || data.name.endsWith(".js") || data.name.endsWith(".css"))) {
        const bytesVistaPrevia = 50 * 1024;
        const fragmentoSeguro = data.blob.slice(0, bytesVistaPrevia);
        const lectorTexto = new FileReader();
        
        lectorTexto.onload = function(evt) {
            let textoFormateado = escaparHTML(evt.target.result);
            
            if (data.size > bytesVistaPrevia) {
                textoFormateado += `\n\n${t.textTruncated || ''}`;
            }
            
            contentDiv.innerHTML = `
                <pre style="white-space: pre-wrap; background: var(--timer-bg); padding: 10px; border-radius: 4px; max-height: 300px; overflow-y: auto; font-family: monospace; font-size: 0.9em; text-align:left;">${textoFormateado}</pre>
            `;
        };
        lectorTexto.readAsText(fragmentoSeguro);
    } else {
        contentDiv.innerHTML = `
            <div style="background: var(--timer-bg); padding: 25px; border-radius: 4px; text-align: center;">
                <p style="font-size: 0.95em; color: var(--text-color); margin-bottom: 15px;">${escaparHTML(t.noPreviewNotice)}</p>
                <strong style="word-break: break-all; font-size: 1.1em; display: block; color: var(--text-color);">${escaparHTML(data.name)}</strong>
            </div>
        `;
    }

    const btnDescarga = document.getElementById('btnDescargaDirecta');
    if (btnDescarga) {
        btnDescarga.href = urlObjeto;
        btnDescarga.download = data.name;
        btnDescarga.innerText = t.btnDownload;
        btnDescarga.style.display = 'block';
    }
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