window.addEventListener("load", async () => {
    const media = await navigator.mediaDevices.getUserMedia({audio: {sampleRate: 16000}}).catch(() => undefined);

    if (!media) return alert("マイクを取得できません");

    // const stream = new MediaStream();
    // stream.addTrack(media.getAudioTracks()[0]);
    // const micTestOptions = {
    //   mimeType : 'audio/webm; codecs=opus'
    // };

    // WebAudioでノードをつなぐ
    const audioContext = new AudioContext()

    // AudioWorkletにするのも複雑なんでdeprecatedだけどサンプル通りScriptProcessorNodeで実装
    // 言語バインディングによって異なるが、JavaScriptバインディングは AudioBuffer を受け取るので
    // ScriptProcessorNode が一番簡単。f32-plannerでも受け取ってくれる
    const recognizerNode = audioContext.createScriptProcessor(4096, 1, 1);
    recognizerNode.onaudioprocess = event => {
        console.log(event.inputBuffer.sampleRate);
        ipc_client.send("audio-data", event.inputBuffer.getChannelData(0).buffer);
        // try {
        // // 認識エンジンに突っ込む
        // recognizer.acceptWaveform(event.inputBuffer)
        // // outputをゼロフィル（無音化）しておく
        // // 何もしなくても無音かも
        // event.outputBuffer.getChannelData(0).fill(0)
        // } catch (err) {
        // console.error(err)
        // }
    }

    // destinationまでつながないと動かないような・・・？
    const sourceNode = audioContext.createMediaStreamSource(media)
    sourceNode.connect(recognizerNode).connect(audioContext.destination)



    // const micTestRecorder = new MediaRecorder(stream, micTestOptions);
    // // micTestChunks = []; // 格納場所をクリア
    // // 一定間隔で録音が区切られて、データが渡される。
    // micTestRecorder.ondataavailable = async function(ev) {
    // //   console.log("type=" + ev.data.type + " size=" + ev.data.size);
    // //   micTestChunks.push(ev.data);
    // //   console.log( await ev.data.arrayBuffer())
    //     const buff = await ev.data.arrayBuffer();
    //     console.log(buff);
    //     ipc_client.send("audio-data", buff);
    // };
    // micTestRecorder.start(100);
    // console.log(micTestRecorder.audioBitsPerSecond)
    // console.log('start mic test');


    
})