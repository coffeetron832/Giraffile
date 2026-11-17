// p2p.js - Motor de transmisión P2P, flujo por chunks y guardado en disco

function soportaGuardadoEnDisco() {
    return typeof window.showSaveFilePicker === 'function' && window.isSecureContext;
}

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
    let timeoutConexion = null;

    mostrarProgreso(t.p2pConnecting);

    timeoutConexion = setTimeout(() => {
        if (!conexion || conexion.open === false) {
            if (contentDiv) {
                contentDiv.innerHTML = `<p class='error'>${escaparHTML(t.errNoExist)}</p>`;
            }
            if (peerInstance) {
                peerInstance.destroy();
                peerInstance = null;
            }
        }
    }, PEER_CONNECTION_TIMEOUT_MS);

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

        const btnGuardar = document.getElementById('btnGuardarDisco');
        const btnVer = document.getElementById('btnVerNavegador');

        btnGuardar.addEventListener('click', () => {
            btnGuardar.disabled = true;
            btnVer.disabled = true;
            iniciarRecepcionEnDisco();
        });

        btnVer.addEventListener('click', () => {
            btnGuardar.disabled = true;
            btnVer.disabled = true;
            iniciarRecepcion('memoria');
        });
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
        clearTimeout(timeoutConexion);
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