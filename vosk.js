var vosk = require("vosk")

const fs = require("fs");
const path = require("path");

MODEL_PATH = path.join(__dirname, "vosk-model-small-ja-0.22")
SAMPLE_RATE = 128000

if (!fs.existsSync(MODEL_PATH)) {
    console.log("Please download the model from https://alphacephei.com/vosk/models and unpack as " + MODEL_PATH + " in the current folder.")
    process.exit()
}

vosk.setLogLevel(0);
const model = new vosk.Model(MODEL_PATH);
const rec = new vosk.Recognizer({model: model, sampleRate: SAMPLE_RATE});



process.stdin.on("data", (data) => {
    console.log(data);
    if (rec.acceptWaveform(data)) {
        console.log(rec.result());

    } else {
        const text = rec.partialResult();
        console.log(text);
        process.stdout.write(text.partial);

    }
})


process.on("SIGINT", () => {
    process.exit()
});

setInterval(() => {
    // console.log("time")
}, 1000);