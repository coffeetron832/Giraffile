// hum.js - Lógica de traducción e idioma de Giraffile

let currentLang = localStorage.getItem('girafile-lang') || 'es';
const supportedLangs = ['es', 'en', 'pt', 'fr', 'sw'];

const i18n = {
    es: {
        themeDark: "Modo Oscuro",
        themeLight: "Modo Claro",
        pageTitle: "Giraffile - La jirafa que protege tus archivos",
        hook: "Comparte cualquier archivo de forma privada",
        desc2: "Confía en la jirafa, no en la nube",
        btnBenefits: "Beneficios",
        btnUpload: "Subir archivo",
        useTitle: "¿Por qué usar Giraffile?",
        use1: "<strong>De tu dispositivo al suyo al instante:</strong> Como la transferencia es 100% directa entre dispositivos, no hay servidores lentos ni intermediarios en el medio.",
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
        btnSendAnother: "¿Quieres enviar otro archivo?",
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
        footer: '<a href="https://github.com/coffeetron832/Giraffile" target="_blank" style="color: var(--text-color); text-decoration: underline; font-weight: bold;">Giraffile</a> v2.4.0 | © 2026 jahp. Todos los derechos reservados. | <a href="#" onclick="abrirDisclaimer(event)" style="color: var(--text-color); text-decoration: underline; margin-left: 5px;">Aviso Legal</a>',
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
        pageTitle: "Giraffile - The giraffe that protects your files",
        hook: "Share any file privately",
        desc2: "Trust the giraffe, not the cloud",
        btnBenefits: "Benefits",
        btnUpload: "Upload file",
        useTitle: "Why use Giraffile?",
        use1: "<strong>From your device to theirs in an instant:</strong> Since the transfer is 100% direct between devices, there are no slow servers or intermediaries involved.",
        use2: "<strong>Any format welcome:</strong> Send images, PDFs, compressed archives (ZIP/RAR), audio, or videos.",
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
        btnSendAnother: "Do you want to send another file?",
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
        footer: '<a href="https://github.com/coffeetron832/Giraffile" target="_blank" style="color: var(--text-color); text-decoration: underline; font-weight: bold;">Giraffile</a> v2.4.0 | © 2026 jahp. All rights reserved. | <a href="#" onclick="abrirDisclaimer(event)" style="color: var(--text-color); text-decoration: underline; margin-left: 5px;">Legal Disclaimer</a>',
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
    },
    pt: {
        themeDark: "Modo Escuro",
        themeLight: "Modo Claro",
        pageTitle: "Giraffile - A girafa que protege os seus arquivos",
        hook: "Compartilhe qualquer arquivo de forma privada",
        desc2: "Confie na girafa, não na nuvem",
        btnBenefits: "Benefícios",
        btnUpload: "Enviar arquivo",
        useTitle: "Por que usar o Giraffile?",
        use1: "<strong>Do seu dispositivo para o dele instantaneamente:</strong> Como a transferência é 100% direta entre dispositivos, não há servidores lentos nem intermediários.",
        use2: "<strong>Qualquer formato:</strong> Envie imagens, PDFs, arquivos compactados (ZIP/RAR), áudios ou vídeos.",
        use3: "<strong>Privacidade total:</strong> Envio seguro de arquivos sem deixar rastros em servidores externos.",
        prepare: "Prepare seu arquivo para enviar",
        dropLabel: "Arraste qualquer arquivo ou clique abaixo (Máx 1.5GB):",
        dropPrompt: "Arraste um arquivo aqui ou clique para procurar",
        dropSelected: "Arquivo selecionado:",
        expiryLabel: "Tempo de Expiração:",
        opt2: "2 Minutos (Para arquivos pequenos)",
        opt5: "5 Minutos",
        opt10: "10 Minutos",
        btnGenerate: "Gerar link seguro",
        btnSendAnother: "Deseja enviar outro arquivo?",
        btnCopy: "Copiar Link",
        btnCopied: "Link Copiado!",
        btnDownload: "Baixar Completo",
        textPreviewNotice: "Exibindo uma prévia do arquivo de texto. Para ver todo o conteúdo:",
        noPreviewNotice: "Este formato não suporta pré-visualização no navegador ou excede o tamanho direto. Use o botão abaixo para baixar com segurança:",
        errNoFile: "Por favor, selecione ou arraste um arquivo primeiro.",
        errNotAllowed: "O arquivo excede o tamanho máximo permitido (Máx 1.5GB).",
        successLink: "Link criado com sucesso!",
        previewTitle: "Dê uma olhada no seu arquivo",
        timeRemaining: "Tempo restante de visualização:",
        fileLabel: "Arquivo:",
        errNoExist: "O arquivo não existe ou já foi excluído por segurança.",
        errExpired: "Este link expirou e o conteúdo foi destruído permanentemente!",
        errTimeOut: "O tempo acabou! O arquivo foi completamente apagado da memória com segurança.",
        p2pConnecting: "Carregando arquivo...",
        p2pEstimado: "Tempo estimado restante:",
        p2pCalculando: "calculando...",
        descifrando: "Preparando arquivo...",
        qrLabel: "Escaneie para receber o arquivo",
        footer: '<a href="https://github.com/coffeetron832/Giraffile" target="_blank" style="color: var(--text-color); text-decoration: underline; font-weight: bold;">Giraffile</a> v2.4.0 | © 2026 jahp. Todos os direitos reservados. | <a href="#" onclick="abrirDisclaimer(event)" style="color: var(--text-color); text-decoration: underline; margin-left: 5px;">Aviso Legal</a>',
        disclaimerTitle: "Isenção de Responsabilidade",
        disclaimerBody: `
        <p>O <strong>Giraffile</strong> funciona como um canal de transporte privado P2P (Peer-to-Peer) direto entre dispositivos. Os arquivos nunca são enviados, analisados ou armazenados em servidores externos.</p>
        <p><strong>Aviso sobre malware:</strong> Por ser uma transferência direta e criptografada, a plataforma não verifica a segurança do conteúdo. O <strong>Giraffile não se responsabiliza</strong> por software malicioso ou vírus transmitidos. É responsabilidade exclusiva do destinatário verificar a procedência do arquivo.</p>
        `,
        spaceLabel: "Espaço:",
        filesInQueue: "arquivos na fila",
        errLocalDB: "Erro local ao processar o armazenamento.",
        textTruncated: "[... Arquivo truncado por desempenho para evitar travamento do navegador ...]",
        defaultFileName: "arquivo_baixado",
        chooseTitle: "Como você quer receber este arquivo?",
        btnSaveToDisk: "Salvar no disco",
        btnViewInBrowser: "Ver no navegador",
        saveToDiskNotice: "Gravado diretamente no seu dispositivo enquanto é recebido. <strong>Não expira:</strong> o arquivo fica salvo e você decide quando deletar.",
        viewInBrowserNotice: "Carregado na memória do navegador, com pré-visualização e temporizador. <strong>Destruído ao expirar.</strong>",
        savingToDisk: "Salvando no seu disco...",
        savedToDiskTitle: "Arquivo salvo no seu dispositivo",
        savedToDiskNotice: "Este arquivo não depende mais do Giraffile e não expira. Exclua-o quando não precisar mais.",
        errSaveCancelled: "Salvamento cancelado. Escolha como deseja receber o arquivo.",
        errSaveFailed: "Não foi possível gravar o arquivo no disco. Tente novamente ou receba no navegador."
    },
    fr: {
        themeDark: "Mode Sombre",
        themeLight: "Mode Clair",
        pageTitle: "Giraffile - La girafe qui protège vos fichiers",
        hook: "Partagez n'importe quel fichier en toute confidentialité",
        desc2: "Faites confiance à la girafe, pas au cloud",
        btnBenefits: "Avantages",
        btnUpload: "Téléverser un fichier",
        useTitle: "Pourquoi utiliser Giraffile ?",
        use1: "<strong>De votre appareil au sien en un instant :</strong> Le transfert étant 100% direct entre appareils, il n'y a ni serveurs lents ni intermédiaires.",
        use2: "<strong>Tous formats acceptés :</strong> Envoyez des images, des PDF, des archives (ZIP/RAR), de l'audio ou des vidéos.",
        use3: "<strong>Confidentialité totale :</strong> Envoi sécurisé sans laisser de trace sur des serveurs externes.",
        prepare: "Préparez votre fichier à envoyer",
        dropLabel: "Glissez un fichier ou cliquez ci-dessous (Max 1.5 Go) :",
        dropPrompt: "Glissez un fichier ici ou cliquez pour parcourir",
        dropSelected: "Fichier sélectionné :",
        expiryLabel: "Délai d'expiration :",
        opt2: "2 Minutes (Pour petits fichiers)",
        opt5: "5 Minutes",
        opt10: "10 Minutes",
        btnGenerate: "Générer un lien sécurisé",
        btnSendAnother: "Voulez-vous envoyer un autre fichier ?",
        btnCopy: "Copier le lien",
        btnCopied: "Lien copié !",
        btnDownload: "Télécharger tout",
        textPreviewNotice: "Aperçu du fichier texte. Pour voir tout le contenu :",
        noPreviewNotice: "Ce format ne prend pas en charge l'aperçu direct dans le navigateur. Utilisez le bouton ci-dessous pour télécharger en toute sécurité :",
        errNoFile: "Veuillez d'abord sélectionner ou glisser un fichier.",
        errNotAllowed: "Le fichier dépasse la taille maximale autorisée (Max 1.5 Go).",
        successLink: "Lien créé avec succès !",
        previewTitle: "Jetez un œil à votre fichier",
        timeRemaining: "Temps de lecture restant :",
        fileLabel: "Fichier :",
        errNoExist: "Le fichier n'existe pas ou a déjà été supprimé par sécurité.",
        errExpired: "Ce lien a expiré et le contenu a été définitivement détruit !",
        errTimeOut: "Temps écoulé ! Le fichier a été complètement effacé de la mémoire en toute sécurité.",
        p2pConnecting: "Chargement du fichier...",
        p2pEstimado: "Temps estimé restant :",
        p2pCalculando: "calcul en cours...",
        descifrando: "Préparation du fichier...",
        qrLabel: "Scannez pour recevoir le fichier",
        footer: '<a href="https://github.com/coffeetron832/Giraffile" target="_blank" style="color: var(--text-color); text-decoration: underline; font-weight: bold;">Giraffile</a> v2.4.0 | © 2026 jahp. Tous droits réservés. | <a href="#" onclick="abrirDisclaimer(event)" style="color: var(--text-color); text-decoration: underline; margin-left: 5px;">Avis Juridique</a>',
        disclaimerTitle: "Clause de Non-Responsabilité",
        disclaimerBody: `
        <p><strong>Giraffile</strong> fonctionne comme un canal de transport privé P2P (Peer-to-Peer) direct entre appareils. Les fichiers ne sont jamais téléversés, analysés ou stockés sur des serveurs externes.</p>
        <p><strong>Avis concernant les logiciels malveillants :</strong> S'agissant d'un transfert direct et chiffré, la plateforme ne vérifie pas la sécurité du contenu. <strong>Giraffile n'est pas responsable</strong> des virus ou fichiers infectés transmis.</p>
        `,
        spaceLabel: "Espace :",
        filesInQueue: "fichiers en attente",
        errLocalDB: "Erreur locale lors du traitement du stockage.",
        textTruncated: "[... Fichier tronqué pour des raisons de performance ...]",
        defaultFileName: "fichier_telecharge",
        chooseTitle: "Comment souhaitez-vous recevoir ce fichier ?",
        btnSaveToDisk: "Enregistrer sur le disque",
        btnViewInBrowser: "Voir dans le navigateur",
        saveToDiskNotice: "Écrit directement sur votre appareil. <strong>N'expire pas :</strong> le fichier reste enregistré sur votre équipement.",
        viewInBrowserNotice: "Chargé dans la mémoire du navigateur, avec aperçu et minuteur. <strong>Détruit à l'expiration.</strong>",
        savingToDisk: "Enregistrement sur votre disque...",
        savedToDiskTitle: "Fichier enregistré sur votre appareil",
        savedToDiskNotice: "Ce fichier ne dépend plus de Giraffile et n'expire pas : il est sur votre appareil.",
        errSaveCancelled: "Enregistrement annulé. Choisissez comment recevoir le fichier.",
        errSaveFailed: "Impossible d'écrire le fichier sur le disque. Réessayez ou recevez-le dans le navigateur."
    },
    sw: {
        themeDark: "Giza",
        themeLight: "Mwangaza",
        pageTitle: "Giraffile - Twiga anayelinda faili zako",
        hook: "Shiriki faili yoyote kwa siri",
        desc2: "Mwamini twiga, si wingu",
        btnBenefits: "Faida",
        btnUpload: "Pakia faili",
        useTitle: "Kwa nini utumie Giraffile?",
        use1: "<strong>Kutoka kifaa chako hadi chao mara moja:</strong> Kwa kuwa uhamishaji ni 100% wa moja kwa moja kati ya vifaa, hakuna seva za polepole wala wasuluhishi.",
        use2: "<strong>Aina yoyote ya faili:</strong> Tuma picha, PDF, faili zilizobanwa (ZIP/RAR), sauti au video.",
        use3: "<strong>Faragha kamili:</strong> Utumaji salama wa faili bila kuacha athari kwenye seva za nje.",
        prepare: "Andaa faili yako ya kutuma",
        dropLabel: "Buruta faili yoyote au bofya hapa chini (Upeo 1.5GB):",
        dropPrompt: "Buruta faili hapa au bofya ili kutafuta",
        dropSelected: "Faili iliyochaguliwa:",
        expiryLabel: "Muda wa kuisha:",
        opt2: "Dakika 2 (Kwa faili ndogo)",
        opt5: "Dakika 5",
        opt10: "Dakika 10",
        btnGenerate: "Tengeneza kiungo salama",
        btnSendAnother: "Je, unataka kutuma faili nyingine?",
        btnCopy: "Nakili Kiungo",
        btnCopied: "Kiungo Kimenakiliwa!",
        btnDownload: "Pakua Kamili",
        textPreviewNotice: "Inaonyesha muhtasari wa faili ya maandishi. Kuona maudhui yote:",
        noPreviewNotice: "Aina hii haihimili muhtasari katika kivinjari. Tumia kitufe kilicho hapa chini kupakua kwa usalama:",
        errNoFile: "Tafadhali chagua au buruta faili kwanza.",
        errNotAllowed: "Faili inazidi ukubwa wa juu unaoruhusiwa (Upeo 1.5GB).",
        successLink: "Kiungo kimetengenezwa kwa mafanikio!",
        previewTitle: "Tazama faili yako",
        timeRemaining: "Muda wa kutazama uliobaki:",
        fileLabel: "Faili:",
        errNoExist: "Faili haipo au imeshafutwa kwa sababu za usalama.",
        errExpired: "Kiungo hiki kimeisha muda wake na maudhui yameharibiwa kabisa!",
        errTimeOut: "Muda umeisha! Faili imefutwa kabisa na kwa usalama kutoka kwenye kumbukumbu.",
        p2pConnecting: "Inapakia faili...",
        p2pEstimado: "Muda unaokadiriwa kubaki:",
        p2pCalculando: "inakadiriwa...",
        descifrando: "Inaandaa faili...",
        qrLabel: "Piga picha ya QR ili kupokea faili",
        footer: '<a href="https://github.com/coffeetron832/Giraffile" target="_blank" style="color: var(--text-color); text-decoration: underline; font-weight: bold;">Giraffile</a> v2.4.0 | © 2026 jahp. Haki zote zimehifadhiwa. | <a href="#" onclick="abrirDisclaimer(event)" style="color: var(--text-color); text-decoration: underline; margin-left: 5px;">Taarifa ya Kisheria</a>',
        disclaimerTitle: "Taarifa ya Utekelezaji wa Sheria",
        disclaimerBody: `
        <p><strong>Giraffile</strong> inafanya kazi kama njia ya kibinafsi ya P2P (Peer-to-Peer) moja kwa moja kati ya vifaa. Faili hazipakiwi, hazichunguzwi wala hazihifadhiwi kwenye seva yoyote ya nje.</p>
        <p><strong>Ilani kuhusu programu haramu (Malware):</strong> Kwa kuwa uhamishaji ni wa moja kwa moja na umesimbwa kwa njia fiche, mfumo hauchunguzi au kuhakiki usalama wa yaliyomo. <strong>Giraffile haitawajibika</strong> kwa programu dharau au virusi vinavyotumwa kupitia viungo. Ni wajibu wa mpokeaji kuhakiki chanzo cha faili na kuwa na kingavirusi kabla ya kupakua.</p>
        `,
        spaceLabel: "Nafasi:",
        filesInQueue: "faili kwenye foleni",
        errLocalDB: "Hitilafu ya ndani wakati wa kuchakata hifadhi.",
        textTruncated: "[... Faili imefupishwa kwa utendaji bora ili kuzuia kivinjari kukwama ...]",
        defaultFileName: "faili_iliyopakuliwa",
        chooseTitle: "Ungependa kupokea vipi faili hii?",
        btnSaveToDisk: "Hifadhi kwenye diski",
        btnViewInBrowser: "Tazama kwenye kivinjari",
        saveToDiskNotice: "Inaandikwa moja kwa moja kwenye kifaa chako inapowasili. <strong>Haishi muda:</strong> faili inakaa kwenye kifaa chako na wewe unaamua wakati wa kuifuta.",
        viewInBrowserNotice: "Inapakia kwenye kumbukumbu ya kivinjari, na kihakiki na kipima muda. <strong>Inaharibiwa inapoisha muda.</strong> Inapendekezwa kwa faili ndogo.",
        savingToDisk: "Inahifadhi kwenye diski yako...",
        savedToDiskTitle: "Faili imehifadhiwa kwenye kifaa chako",
        savedToDiskNotice: "Faili hii haitegemei tena Giraffile wala haiishi muda: ipo kwenye kifaa chako. Ifute mwenyewe pale utakapokuwa huihitaji tena.",
        errSaveCancelled: "Uhifadhi umeghairiwa. Chagua jinsi unavyotaka kupokea faili.",
        errSaveFailed: "Kushindwa kuandika faili kwenye diski. Jaribu tena au ipokee kwenye kivinjari."
    }
};

function changeLanguage(lang) {
    if (supportedLangs.includes(lang)) {
        currentLang = lang;
        localStorage.setItem('girafile-lang', currentLang);
        document.documentElement.lang = currentLang;
        aplicarTraduccion();
    }
}

function aplicarTraduccion() {
    const t = i18n[currentLang] || i18n['es'];
    document.title = t.pageTitle; 

    // Sincronizar el valor visible del selector <select id="langSelect">
    const langSelect = document.getElementById('langSelect');
    if (langSelect && langSelect.value !== currentLang) {
        langSelect.value = currentLang;
    }

    // 1. Ubicar o crear #brandHeroContainer JUSTO DEBAJO de .top-controls
    let brandHero = document.getElementById('brandHeroContainer');
    if (!brandHero) {
        brandHero = document.createElement('div');
        brandHero.id = 'brandHeroContainer';
        
        const topControls = document.querySelector('.top-controls');
        if (topControls) {
            topControls.insertAdjacentElement('afterend', brandHero);
        } else {
            const mainContainer = document.querySelector('.container') || document.body;
            mainContainer.insertBefore(brandHero, mainContainer.firstChild);
        }
    }

    brandHero.innerHTML = `
        <div class="hero-intro">
            <h2 class="hero-hook">${t.hook}</h2>
            <p class="hero-desc">${t.desc2}</p>
        </div>
    `;

    // 2. Renderizado exclusivo de las tarjetas dentro de #infoBoxContainer
    const infoBox = document.getElementById('infoBoxContainer');
    if (infoBox) {
        infoBox.innerHTML = `
            <p style="margin-top: 15px; margin-bottom: 12px; font-weight: bold; text-align: center; font-size: 1.75rem;">${t.useTitle}</p>
            
            <div class="cards-container">
                <div class="card-item">
                    <div class="card-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
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

    // 3. Traducción de elementos de navegación, formulario y pie de página
    if (document.getElementById('btnBeneficios')) document.getElementById('btnBeneficios').innerText = t.btnBenefits;
    if (document.getElementById('btnSubirArchivo')) document.getElementById('btnSubirArchivo').innerText = t.btnUpload;
    if (document.getElementById('lblPrepare')) document.getElementById('lblPrepare').innerText = t.prepare;
    if (document.getElementById('lblDropZone')) document.getElementById('lblDropZone').innerText = t.dropLabel;
    if (document.getElementById('lblExpiry')) document.getElementById('lblExpiry').innerText = t.expiryLabel;
    if (document.getElementById('opt2m')) document.getElementById('opt2m').innerText = t.opt2;
    if (document.getElementById('opt5m')) document.getElementById('opt5m').innerText = t.opt5;
    if (document.getElementById('opt10m')) document.getElementById('opt10m').innerText = t.opt10;
    if (document.getElementById('btnGenerar')) document.getElementById('btnGenerar').innerText = t.btnGenerate;
    if (document.getElementById('btnSendAnother')) document.getElementById('btnSendAnother').innerText = t.btnSendAnother;
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

// Cargar la traducción al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    aplicarTraduccion();
});
