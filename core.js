// core.js - Constantes, utilidades e IndexedDB

const MAX_SIZE_BYTES = 1500 * 1024 * 1024; // 1.5 GB
const MAX_PREVIEW_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const DB_NAME = "GirafileDB"; 
const DB_VERSION = 1;
const STORE_NAME = "archivos";

const CHUNK_SIZE = 256 * 1024;
const ESPERA_METADATA_MS = 4000;
const PEER_CONNECTION_TIMEOUT_MS = 30000;
const PAUSAR_FLUJO_BYTES = 8 * 1024 * 1024;
const REANUDAR_FLUJO_BYTES = 2 * 1024 * 1024;

// Estado global compartido
let intervaloTemporizador = null;
let archivoCargado = null;
let peerInstance = null; 
let objetoUrlActivo = null;
let coleccionArchivos = [];
let pasoActual = 1;

function escaparHTML(cadena) {
    if (!cadena) return '';
    return cadena.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function abrirDB(callback) {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = function(e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
    };
    request.onsuccess = function(e) { 
        callback(e.target.result); 
    };
}

function eliminarArchivoDB(id) {
    abrirDB(function(db) {
        db.transaction([STORE_NAME], "readwrite").objectStore(STORE_NAME).delete(id);
    });
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