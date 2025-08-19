window.addEventListener("load", async () => {
    /**@type {import("../../config").defaultConfigType} */
    const config = await ipc_client.invoke("VOSK_Speech", "getConfig");
    const log = [];

    const result_area = document.getElementById("result_area");

    let resultText = document.createElement("p");
    resultText.classList.add("text-partial");
    result_area.prepend(resultText);

    ipc_client.on("partialResult", (text) => {
        resultText.innerText = text;
    });
    ipc_client.on("result", (/**@type {String}*/text) => {
        resultText.innerText = text;
        if (!text) return;
        log.push(config.removeSpace ? text.replaceAll(" ", "") : text);
        resultText.classList.remove("text-partial");
        resultText = document.createElement("p");
        resultText.classList.add("text-partial");
        result_area.prepend(resultText);
    });


    const save_button = document.getElementById("save_button");
    save_button.addEventListener("click", async () => {
        const contentR = log.join("");
        const content = log.join("\n");
        const now = new Date();
        const Y = now.getFullYear();
        const M = now.getMonth();
        const D = now.getDate();
        const h = now.getHours();
        const m = now.getMinutes();
        const title = (() => {
            switch (config.defaultTitle) {
                case "date": return `${Y}_${M}_${D}`;
                case "time": return `${Y}_${M}_${D}:${h}:${m}`;
                case "first15": return contentR.length < 15 ? contentR : contentR.slice(0, 15);
                case "last15": return contentR.length < 15 ? contentR : contentR.slice(-15);
            }
        })()

        const id = await ipc_client.invoke("VOSK_Speech", "save", content, title, []);

        if (!id) return window.alert("記録を保存できませんでした");

        ipc_client.invoke("VOSK_Speech", "open", "view", id);
    });


    const recordButton = document.getElementById("recordButton");
    recordButton.addEventListener("click", () => switchMicStatus());
    const recordButton_display = document.getElementById("recordButton_display");


    let MicStatus = false;
    function switchMicStatus() {
        MicStatus = !MicStatus;

        ipc_client.invoke("VOSK_Speech", "setMic", MicStatus);
        recordButton_display.innerText = MicStatus ? "録音中" : "録音開始";

    }
})