window.addEventListener("load", async () => {
    const media = await navigator.mediaDevices.getUserMedia({audio: {sampleRate: 16000}}).catch(() => undefined);

    if (!media) return alert("マイクを取得できません");

    const stream = new MediaStream();
    stream.addTrack(media.getAudioTracks()[0]);
    const micTestOptions = {
      mimeType : 'audio/webm; codecs=opus'
    };
    const micTestRecorder = new MediaRecorder(stream, micTestOptions);
    // micTestChunks = []; // 格納場所をクリア
    // 一定間隔で録音が区切られて、データが渡される。
    micTestRecorder.ondataavailable = async function(ev) {
    //   console.log("type=" + ev.data.type + " size=" + ev.data.size);
    //   micTestChunks.push(ev.data);
    //   console.log( await ev.data.arrayBuffer())
        const buff = await ev.data.arrayBuffer();
        console.log(buff);
        ipc_client.send("audio-data", buff);
    };
    micTestRecorder.start(100);
    console.log(micTestRecorder.audioBitsPerSecond)
    console.log('start mic test');


    
})