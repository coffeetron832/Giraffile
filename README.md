# Giraffile

<p align="center">
  <picture>
    <!-- Si el usuario usa modo oscuro, muestra la del contorno blanco limpia -->
    <source media="(prefers-color-scheme: dark)" srcset="giraffe02.png">
    <!-- Si usa modo claro, puedes aplicarle un filtro de silueta negra/oscura con CSS -->
    <img src="giraffe03.png" width="300" alt="Mascota Giraffile" style="filter: drop-shadow(0px 2px 5px rgba(0,0,0,0.3));">
  </picture>
</p>

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/coffeetron832/Giraffile?style=social)
![Privacy](https://img.shields.io/badge/Privacy-Zero_Server-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.1-blue)
![License](https://img.shields.io/badge/license-MIT-yellow)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

</div>

Giraffile is a **local privacy** tool designed to share files quickly and securely without relying on cloud servers. 

### Why Giraffile?
In today’s world, sharing a file often means handing it over to a large corporation, storing it on an external server, and losing control over who has access to it. Giraffile cuts out the middleman. 

By using your browser’s native storage capabilities (**IndexedDB**), files travel directly from your device to the recipient’s. Once the timer expires, the file is permanently destroyed.

### How It Works
1. Drag your file to the drop zone.
2. Select the link’s expiration time.
3. Generate a unique link that you can send to anyone you need.
4. When the time expires, the file disappears forever.

### Features
* **Zero-Server:** No intermediary servers. Your data never leaves your trusted network.
* **Self-Destruction:** Files are automatically deleted after the configured time.
* **100% Privacy:** No logs, no cloud databases, no tracking.
* **Dark Mode:** Designed for visual comfort in any environment.
* **Open Source:** You can verify the code and ensure your privacy is truly protected.

---

### 🦒 Try Giraffile v1.1.0

Need to share files privately and securely? Don't trust the cloud with your data.

Start sharing now: https://giraffile.pages.dev/

---

## ❤️ Acknowledgements

This project would not have been possible without the ecosystem of open-source tools and the valuable contributions from the community.

### 🛠️ Technologies That Made It Possible
We are deeply grateful to the creators and maintainers of the key libraries that power the core of the application:
*   **[PeerJS](https://peerjs.com/):** For brilliantly facilitating direct P2P (*Peer-to-Peer*) connection architecture between browsers without the need for intermediate storage servers.
*   **[JSZip](https://stuk.github.io/jszip/):** For enabling efficient and transparent real-time multiple file compression directly on the user’s device.
*   **[QRCode.js](https://davidshimjs.github.io/qrcodejs/):** For the dynamic and clean generation of QR codes to facilitate reception and interoperability with mobile devices.

### Project Contributors
A very special thank you to the developers who dedicated their time and talent to improving the platform through their *pull requests*:

*   **[@Daniel Angel](https://github.com/danansa86):** Thanks to his significant contribution to the file transfer process and the tool’s architecture, he has played a key role in its development.
*   **[@RamVignesh B](https://github.com/ramvignesh-b):** For their valuable contribution to implementing the QR code to improve the tool's usability.


Thank you for helping the giraffe continue to protect everyone's privacy! 🦒

---
*Developed by jahp / coffetron832 | Licensed under MIT.*
