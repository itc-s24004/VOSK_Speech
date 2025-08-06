window.addEventListener("load", async () => {
    let getSpeechIndex = await ipc_client.invoke("VOSK_Speech", "getSpeechIndex");

    console.log(getSpeechIndex);
});