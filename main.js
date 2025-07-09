const { BrowserWindow, ipcMain } = require("electron");
const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const server = http.createServer(app);


const root = path.join(__dirname, "content");

app.use((req, res) => {
    const target = decodeURI(req.path);
    const targetPath = path.join(root, target);

    res.sendFile(targetPath);
    
});

server.listen(9000)


/**
 * 
 * @param {import("../../system/ModuleRepository/main").ModuleReposiory} REP 
 */
exports.run = async (REP) => {
    const createWindow = REP.get("createWindow")
    const GUI_APP_Launcher = REP.get("GUI_APP_Launcher");

    await GUI_APP_Launcher.whenReady();

    const app = new GUI_APP_Launcher();
    app.name = "文字起こし";
    app.icon = `rgb(224, 101, 70) url(${path.join(__dirname, "icon.png")}) center / 70% no-repeat `;


    /**@type {BrowserWindow} */
    let window;
    app.on("click", (type) => {
        if (type == "single") return;

        if (window && window.isEnabled()) {
            window.focus()
        } else {
            window = createWindow({}, false);
            window.loadURL("https://itc-s24004.github.io/VOSK_Speech/content/index.html");
            window.webContents.openDevTools();
            window.once("closed", () => {
                window = null;
            })
        }

    });


    ipcMain.on("audio-data", (buff) => {
        console.log(buff);
    });
}