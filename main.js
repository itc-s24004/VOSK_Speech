const { BrowserWindow, ipcMain } = require("electron");
const child = require("child_process")
// const express = require("express");
// const app = express();
// const http = require("http");
const path = require("path");
// const {  } = require("./vosk");
// const server = http.createServer(app);


// const root = path.join(__dirname, "content");

// app.use((req, res) => {
//     const target = decodeURI(req.path);
//     const targetPath = path.join(root, target);

//     res.sendFile(targetPath);
    
// });

// server.listen(9000)


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

    const local_node = REP.get("local_node");
    const voskPath = path.join(__dirname, "vosk.js");

    console.log(local_node)
    console.log(voskPath)

    // child.spawn("node", [path.join(__dirname, "vosk.js")], {cwd: __dirname});
    const vosk_ =child.spawn(local_node, [voskPath], {cwd: __dirname});
    vosk_.stdout.on("data", (/**@type {Buffer} */ms) => {
        console.log(ms.toString())
        // process.stdout.write(ms);
        // vosk_.send("hello");
    });

    const addExitCall = REP.get("addExitCall");
    console.log("=".repeat(20));
    console.log(addExitCall)
    console.log("=".repeat(20));
    addExitCall(() => {
        console.log("kill")
        vosk_.kill("SIGINT")
    })




    vosk_.on("spawn", () => {
        console.log("vosk spawn");

    }).on("exit", () => {
        console.log("exit vosk");

    })

    
    ipcMain.on("audio-data",  (ev, /**@type {ArrayBuffer} */ buff) => {
        console.log(buff instanceof ArrayBuffer)
        // console.log(buff);
        try {
            vosk_.stdin.write(Buffer.from(buff));
        } catch (error) {
            console.log(error)
        }
    });

    setInterval(() => {
        vosk_.stdin.write("buff");
    }, 1000);
}

// console.log(path.join(__dirname, "../../system/_node_npm/node-binary/bin/node"))
// console.log(path.join(__dirname, "vosk.js"))
// const vosk_ = child.spawn(, [path.join(__dirname, "vosk.js")], {cwd:__dirname, stdio: ["pipe", "inherit", "inherit"]});
// vosk_.on("message", (ms) => {
//     console.log(ms)
// })


// vosk_.stdout.on("data", (data) => {
//     console.log(data)
// })

// vosk_.on("error", (err) => {
//     console.log(err)
// });


// vosk_.on("exit", (code) => {
//     console.log(code)
// })

// setInterval(() => {
//     if (Math.random() < 0.5) {
//         vosk_.send("test")

//     } else {
//         vosk_.send({hello: "test"})

//     }
// }, 1000);

