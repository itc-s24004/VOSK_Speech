const { BrowserWindow, ipcMain, WebContentsView, BaseWindow } = require("electron");
const mic = require("mic");
const path = require("path");

/**
 * 
 * @param {import("../../system/ModuleRepository/main").ModuleReposiory} REP 
 */
exports.run = async (REP) => {
    exports.run = null;

    const createWebContentsView = REP.get("createWebContentsView");
    const preload_origin = REP.get("preload_origin");
    const GUI_APP_Launcher = REP.get("GUI_APP_Launcher");
    const VOSK_Wrapper = await REP.getAsync("VOSK_Wrapper");
    const addExitCall = REP.get("addExitCall");


    await GUI_APP_Launcher.whenReady();


    const app = new GUI_APP_Launcher();
    app.name = "文字起こし";
    app.icon = `rgb(224, 101, 70) url(${path.join(__dirname, "icon.png")}) center / 70% no-repeat `;


    const contentWindow = createWebContentsView();
    contentWindow.webContents.loadFile(path.join(__dirname, "content/home/index.html"))
    contentWindow.webContents.openDevTools()

    //エディタプラグイン▼
    let canUseEditor = false;
    const editorWindow = (async () => {
        const SimpleTextEditor = await REP.getAsync("SimpleTextEditor");
        const editor = new SimpleTextEditor();
        await editor.whenReady();
        canUseEditor = true;
        resize()
        if (window) {
            window.contentView.addChildView(editor.window);
        }
        return editor;
    })();


    /**@type {BaseWindow} */
    let window;
    let showEditor = false;
    async function resize() {
        if (!window) return;
        const [width, height] = window.getSize();

        if (showEditor && canUseEditor) {
            contentWindow.setBounds({x: 0, y: 0, width: 0, height: 0});
            (await editorWindow).window.setBounds({x: 0, y: 0, width, height});

        } else {
            contentWindow.setBounds({x: 0, y: 0, width, height});
            if (canUseEditor) (await editorWindow).window.setBounds({x: 0, y: 0, width: 0, height: 0});

        }
    }


    app.on("click", async (type) => {
        if (type == "single") return;

        if (window) {
            window.focus();

        } else {
            window = new BaseWindow();
            window.setMenu(null);

            window.contentView.addChildView(contentWindow);

            //エディタ埋め込み▼
            if (canUseEditor) window.contentView.addChildView((await editorWindow).window);

            resize();


            window.addListener("resize", resize);

            window.once("closed", () => {
                window = null;
            });
        }
    });


    //ウィンドウ操作▼
    const contentRoot = path.join(__dirname, "content");
    ipcMain.on("OVSK_Speech-Open", (ev, content) => {
        if (typeof content != "string") return;
        const target = path.join(contentRoot, content, "index.html");
        contentWindow.webContents.loadFile(target);
    });

    ipcMain.on("OVSK_Speech-Exit", (ev) => {
        if (window) window.close();
    });


    ipcMain.on("VOSK_Speech-Editor", (ev, file) => {
        
    });








    const sample_rate = 48000;


    const vosk = new VOSK_Wrapper(sample_rate, "vosk-model-small-ja-0.22");

    var micInstance = mic({
        rate: String(sample_rate),
        channels: '1',
        debug: false,
        device: 'default',
        bitwidth: "16"
    });

    var micInputStream = micInstance.getAudioStream();

    micInstance.start();

    micInputStream.on('data', data => {
        vosk.inputAudio(data);
    });

    vosk.on("result", (result) => {
        // console.log(result);
        contentWindow.webContents.send("result", result.text);
    });
    vosk.on("partialResult", (result) => {
        // console.log(result)
        contentWindow.webContents.send("partialResult", result.partial);
    })



    //終了時にマイクを停止
    addExitCall(() => {
        // console.log("kill")
        vosk.stop();
        micInstance.stop();
    })


    


    ipcMain.on("audio-data",  (ev, /**@type {ArrayBuffer} */ buff) => {
    });

}