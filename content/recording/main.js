window.addEventListener("load", () => {
    const result_area = document.getElementById("result_area");

    let resultText = document.createElement("p");
    resultText.classList.add("partial");
    result_area.append(resultText);

    ipc_client.on("partialResult", (text) => {
        resultText.innerText = text;
    });
    ipc_client.on("result", (text) => {
        resultText.innerText = text;
        resultText.classList.remove("partial");
        resultText = document.createElement("p");
        resultText.classList.add("partial");
        result_area.append(resultText);
    });


    const save_button = document.getElementById("save_button");
    save_button.addEventListener("click", async () => {
        const now = new Date().toLocaleString().replaceAll("/", "_");
        const content = result_area.innerText.replaceAll("\n\n", "\n");
        const id = await ipc_client.invoke("VOSK_Speech", "save", content, now, []);

        if (!id) window.alert("記録を保存できませんでした");
        const editor = await ipc_client.invoke("VOSK_Speech", "editor", id);

        if (editor == -1) {
            window.alert("エディタを起動できませんでした");

        } else if (editor == 0) {
            window.alert("記録を取得できませんでした");

        }

        ipc_client.invoke("VOSK_Speech", "open", "home");
    });
})