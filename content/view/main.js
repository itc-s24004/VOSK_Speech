window.addEventListener("load", () => {
    /**@type {HTMLInputElement} */
    const title = document.getElementById("title");
    /**@type {HTMLTextAreaElement} */
    const content = document.getElementById("content");

    const tagContainer = document.getElementById("tagContainer");
    const addTagButton = document.getElementById("addTagButton");


    /**@type {HTMLButtonElement} */
    const save = document.getElementById("save");


    const modify = {
        title: false,
        tag: false,
        content: false
    }
    ipc_client.on("option", async (id) => {
        /**
         * 
         * @param {keyof modify} type 
         */
        const modifyEvent = (type) => () => {
            modify[type] = true;
            save.disabled = false;
        }


        /**@type {import("../../speechIndex").SpeechIndex[]} */
        const index = await ipc_client.invoke("VOSK_Speech", "getSpeechIndex");
        const data = index.find(d => d.id == id);
        if (!data) {
            window.alert("コンテンツが存在しません");
            return ipc_client.invoke("VOSK_Speech", "open", "home");
        }

        title.value = data.title;
        title.addEventListener("input", modifyEvent("title"));


        /**タグ一覧生成▼ */
        data.tags.forEach(tag => addTag(data.tags, tagContainer, tag, modifyEvent("tag")));

        /**タグ追加処理▼ */
        addTagButton.addEventListener("click", () => {
            console.log("タグ追加処理");
            addTagForm(data.tags, tagContainer, modifyEvent("tag"), modifyEvent("tag"));
        });


        const text = await ipc_client.invoke("VOSK_Speech", "getContent", id);
        content.value = text;
        content.addEventListener("input", modifyEvent("content"));




        save.addEventListener("click", () => {
            const c = window.confirm("変更を保存しますか?\n※上書きするともとに戻すことはできません");
            if (!c) return;
            if (modify.title) ipc_client.invoke("VOSK_Speech", "setSpeechIndex", id, "title", title.value);
            if (modify.tag) ipc_client.invoke("VOSK_Speech", "setSpeechIndex", id, "tags", data.tags);
            if (modify.content) ipc_client.invoke("VOSK_Speech", "updateContent", id, content.value);
            Object.keys(modify).forEach(k => modify[k] = false);
            save.disabled = true;
        });

    });


})