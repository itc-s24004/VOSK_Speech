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
    const GUI_APP_Launcher = REP.get("GUI_APP_Launcher")



}