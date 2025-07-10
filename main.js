const { BrowserWindow, ipcMain } = require("electron");
const mic = require("mic");
const path = require("path");

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
            // window.loadFile(path.join(__dirname, "content/home/index.html"));
            window.webContents.openDevTools();
            window.once("closed", () => {
                window = null;
            });
        }
    });

    const VOSK_Wrapper = await REP.getAsync("VOSK_Wrapper");


    const sample_rate = 48000;


    const vosk = new VOSK_Wrapper(sample_rate);

    var micInstance = mic({
        rate: String(sample_rate),
        channels: '1',
        debug: false,
        device: 'default',    
    });

    var micInputStream = micInstance.getAudioStream();

    process.on('SIGINT', function() {
        micInstance.stop();
    });

    micInstance.start();

    micInputStream.on('data', data => {
        vosk.sendAudio(data);
    });

    vosk.on("result", (result) => {
        console.log(result);
    });



    const addExitCall = REP.get("addExitCall");
    addExitCall(() => {
        console.log("kill")
        vosk.stop();
    })


    
    ipcMain.on("audio-data",  (ev, /**@type {ArrayBuffer} */ buff) => {
    });

}