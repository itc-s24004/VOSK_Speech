const { BrowserWindow, ipcMain, shell } = require("electron");
const mic = require('node-microphone');


// const IsSilence = require("mic/lib/silenceTransform");
const path = require("path");
const fs = require("fs");

/**
 * 
 * @param {import("../../system/ModuleRepository/main").ModuleReposiory} REP 
 */
exports.run = async (REP) => {
    exports.run = null;

    //保存先▼
    const ContentRoot = path.join(__dirname, "content");
    const LOCAL_CONTENT_ROOT = REP.get("LOCAL_CONTENT_ROOT");
    const APP_ROOT = path.join(LOCAL_CONTENT_ROOT, "VOSK_Speech")
    const LOG_ROOT = path.join(APP_ROOT, "logs");
    if (!fs.existsSync(LOG_ROOT)) fs.mkdirSync(LOG_ROOT, {recursive: true});


    //設定▼
    /**@type {import("./config").defaultConfigType} */
    const defaultConfig = {
        "defaultTitle": "date",
        "removeSpace": false,
        "defaultTag": [],
        "model": ""
    }
    const configPath = path.join(APP_ROOT, "config.json");
    const JsonConfig = REP.get("JsonConfig");
    const [config, useDefaultConfig, save_Config] = JsonConfig.load(
        configPath,
        defaultConfig
    );
    if (useDefaultConfig) save_Config();


    //検索辞書▼
    const speechIndexPath = path.join(APP_ROOT, "speechIndex.json");
    const [speechIndex, save_SpeechIndex] = (() => {
        const IndexType = {
            id: "",
            title: "",
            time: 0,
            tags: []
        };

        const [index, , save] = JsonConfig.load(
            speechIndexPath,
            {
                /**@type { {id: string, title: string, time: number, tags: string[]}[] } */
                speechIndex: []
            }
        );
        const SecureIndex = index.speechIndex.map(i => {
            if (JsonConfig.typeCheck(i, IndexType)) {
                i.tags = i.tags.filter(tag => typeof tag == "string");
                return i;
            }
        }).filter(i => !!i);
        index.speechIndex = SecureIndex;
        save();

        return [SecureIndex, save];
    })();
    


    //モジュール▼
    const createWindow = REP.get("createWindow");
    const GUI_APP_Launcher = REP.get("GUI_APP_Launcher");
    const VOSK_Wrapper = await REP.getAsync("VOSK_Wrapper");
    const addExitCall = REP.get("addExitCall");


    await GUI_APP_Launcher.whenReady();


    //アプリ本体▼!!!ここから!!!
    const app = new GUI_APP_Launcher();
    app.name = "文字起こし";
    app.icon = `rgb(224, 101, 70) url(${path.join(__dirname, "icon.png")}) center / 70% no-repeat `;


    const homeContentPath = path.join(__dirname, "content/home/index.html")



    /**@type {BrowserWindow} */
    let window;

    app.on("click", async (type) => {
        if (type == "single") return;

        if (window) {
            window.focus();

        } else {
            window = createWindow({width: 900, minWidth : 900, minHeight: 600});
            // window.webContents.openDevTools()
            window.loadFile(homeContentPath);
            app.bubble = "red";

            window.once("closed", () => {
                window = null;
                app.bubble = "transparent";
                stopMic();
            });
        }
    });


    //操作リクエスト▼
    ipcMain.handle("VOSK_Speech", async (ev, EventName, ...args) => {
        if (!window || window.webContents != ev.sender) return;

        switch (EventName) {
            case "open": {
                const [content, ...options] =  args;
                const target = path.join(ContentRoot, content, "index.html");
                window.loadFile(target);
                window.webContents.once("did-finish-load", () => window.webContents.send("option", ...options));
                stopMic();
                break
            }



            case "save": {
                const [content, title, tags] = args;

                if (typeof content != "string") break;
                if (typeof title != "string") break;
                if (!Array.isArray(tags)) break;

                const id = crypto.randomUUID();
                const contentPath = path.join(LOG_ROOT, id);
                try {
                    fs.writeFileSync(contentPath, content);
                } catch {break};
                speechIndex.push({id, title, time: new Date().getTime(), tags: tags.filter(t => typeof t == "string")});
                save_SpeechIndex();

                return id;
            }



            case "getSpeechIndex": {
                return speechIndex;
            }



            case "setSpeechIndex": {
                const [id, key, value] = args;
                if (typeof key != "string" || key == "id") return -1;
                const I = speechIndex.find(i => i.id == id);
                if (!I) return 0;
                if (!JsonConfig.typeCheck(I[key], value)) return -1;
                I[key] = value;
                save_SpeechIndex();
                return 1;
            }



            case "getContent": {
                const [id] = args;
                const contentPath = path.join(LOG_ROOT, id);
                try {
                    return fs.readFileSync(contentPath, {encoding: "utf-8"});
                } catch {
                    return "";
                }
            }



            case "updateContent": {
                const [id, content] = args;
                fs.writeFileSync(path.join(LOG_ROOT, id), content);
            }



            case "getConfig": {
                return config;
            }



            case "setConfig": {
                const [key, value] = args;
                if (!(key in config)) break;
                if (!JsonConfig.typeCheck(config[key], value)) break;
                config[key] = value;
                save_Config();
                break;
            }



            case "setMic": {
                const [status] = args;
                if (status) startMic(); else stopMic();
            }



        }
    });




    const sample_rate = 48000;


    const VOSK_Models = VOSK_Wrapper.models;

    const configModel = config.model;

    const useModel = VOSK_Models.includes(configModel) ? configModel : VOSK_Models[0]

    const vosk = new VOSK_Wrapper(sample_rate, useModel);


    vosk.on("result", (result) => {
        // console.log(result);
        if (window) window.webContents.send("result", result.text);
    });
    vosk.on("partialResult", (result) => {
        // console.log(result)
        if (window) window.webContents.send("partialResult", result.partial);
    })


    /**@type {mic} */
    let micInstance;
    function startMic() {
        if (micInstance) return;
        micInstance =  new mic({
            rate: sample_rate,
            bitwidth: 16,
            channels: 1,
            device: "default",
            useDataEmitter: true
        });
        micInstance.startRecording();
        micInstance.on("data", (data) => {
            vosk.inputAudio(data);
        });
    }
    function stopMic() {
        if (micInstance) micInstance.stopRecording()
        vosk.inputAudio(Buffer.from([0]));
        micInstance = null;
    }




    //終了時にマイクとVOSKを停止
    addExitCall(() => {
        // console.log("kill")
        vosk.stop();
        stopMic();
    });


    


    ipcMain.on("audio-data",  (ev, /**@type {ArrayBuffer} */ buff) => {
    });

}