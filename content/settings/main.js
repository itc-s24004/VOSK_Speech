window.addEventListener("load", async () => {
    /**@type {import("../../config").defaultConfigType} */
    const config = await ipc_client.invoke("VOSK_Speech", "getConfig");


    /**@type {HTMLSelectElement} */
    const default_title = document.getElementById("default-title");
    /**@type {HTMLInputElement} */
    const trim_space = document.getElementById("trim-space");
    /**@type {HTMLInputElement} */
    const default_tag = document.getElementById("default_tag");
    /**@type {HTMLSelectElement} */
    const model_select = document.getElementById("model-select");
    /**@type {HTMLButtonElement} */
    const save_settings = document.getElementById("save-settings");


    const modify = {
        defaultTitle: false,
        removeSpace: false,
        defaultTag: false,
        model: false
    }
    /**
     * 
     * @param {keyof modify} type 
     * @param {() => any} valueGetCall
     */
    const modifyEvent = (type, valueGetCall) => () => {
        modify[type] = true;
        save_settings.disabled = false;
        config[type] = valueGetCall();
    }


    /**@type {HTMLOptionElement} */
    const option = [...default_title.children].find((/**@type {HTMLOptionElement} */o) => o.value == config.defaultTitle);
    if (option) option.selected = true;
    default_title.addEventListener("change", modifyEvent("defaultTitle", () => default_title.value));


    trim_space.addEventListener("change", modifyEvent("removeSpace", () => trim_space.checked));


    default_tag.value = config.defaultTag.join(",");
    default_tag.addEventListener("change", modifyEvent("defaultTag", () => default_tag.value.split(",").filter(t => t.length > 0)));


    /**@type {string[]} */
    const models = await ipc_client.invoke("VOSK_Wrapper", "getModels");
    const options = models.map(m => {
        const p = m.split("/");
        const option = document.createElement("option");
        option.value = m;
        option.innerText = p[p.length - 1];
        if (m == config.model) option.selected = true;
        return option;
    });
    [...model_select.children].forEach(c => c.remove());
    model_select.append(...options);
    model_select.addEventListener("change", modifyEvent("model", () => model_select.value));


    save_settings.addEventListener("click", () => {
        Object.entries(modify).filter(([k, v]) => v).forEach(([k]) => {
            ipc_client.invoke("VOSK_Speech", "setConfig", k, config[k]);
            modify[k] = false;
        });
        save_settings.disabled = true;
    })
});