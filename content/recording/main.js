window.addEventListener("load", () => {
    const result_area = document.getElementById("result_area");

    let resultText = document.createElement("p");
    resultText.classList.add("partial");
    result_area.prepend(resultText);

    ipc_client.on("partialResult", (text) => {
        resultText.innerText = text;
    });
    ipc_client.on("result", (text) => {
        resultText.innerText = text;
        resultText.classList.remove("partial");
        resultText = document.createElement("p");
        resultText.classList.add("partial");
        result_area.prepend(resultText);
    })
})