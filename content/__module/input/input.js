window.addEventListener("load", () => {
    /**@type {HTMLInputElement | HTMLTextAreaElement} */
    let target;
    function insert(text) {
        const c = target.value;
        const pos = target.selectionStart;
        const before   = c.slice(0, pos);
        const after    = c.slice(pos);
        target.value = `${before}${text}${after}`;
    }

    ipc_client.on("result", (/**@type {String}*/text) => {
        insert(text.replaceAll(" ", ""));
    });

    let mic = false;
    document.body.addEventListener("keydown", (ev) => {
        if (!ev.altKey || mic) return;
        /**@type {HTMLElement} */
        const e = ev.target;
        if (e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement) {
            ipc_client.invoke("VOSK_Speech", "setMic", true);
            target = e;
            mic = true;
        }
    });

    document.body.addEventListener("keyup", (ev) => {
        if (ev.altKey || !mic) return;
        /**@type {HTMLElement} */
        const e = ev.target;
        if (e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement) {
            ipc_client.invoke("VOSK_Speech", "setMic", false);
            mic = false;
        }
    });
});