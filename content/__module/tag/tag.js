/**
 * 
 * @param {string[]} _tags 
 * タグ配列
 * @param {HTMLElement} tag_container 
 * タグを入れる親要素
 * @param {string} tag 
 * タグ名
 * @param {() => void} deleteCall 
 * タグが削除されたときのイベント
 */
function addTag(_tags, tag_container, tag, deleteCall) {
    const tagE = jsonHTML.toHTML({
        tag: "span",
        class: ["tag"]
    });
    tagE.innerText = tag;

    const deleteB = jsonHTML.toHTML({
        tag: "button",
        class: ["tag-delete"],
        child: [
            {
                tag: "i",
                class: ["fas", "fa-times"]
            }
        ]
    });
    tagE.append(deleteB);

    //タグ削除機能▼
    deleteB.addEventListener("click", () => {
        tagE.remove();
        _tags.splice(_tags.indexOf(tag), 1);
        if (typeof deleteCall == "function") deleteCall();
    });

    tag_container.append(tagE);
}



/**
 * 
 * @param {string[]} _tags 
 * タグ配列
 * @param {HTMLElement} tag_container 
 * タグを入れる親要素
 * @param {() => void} addTagCall 
 * タグが追加されたときのイベント
 * @param {() => void} deleteCall 
 * タグが削除されたときのイベント
 */
function addTagForm(_tags, tag_container, addTagCall, deleteCall) {
    const tagE = jsonHTML.toHTML({
        tag: "span",
        class: ["tag"]
    });

    /**@type {HTMLInputElement} */
    const input = jsonHTML.toHTML({
        tag: "input",
        class: ["tag-input"],
        attribute: {
            "type": "text",
            "placeholder": "新しいタグを入力..."
        }
    });
    tagE.append(input);

    input.addEventListener("blur", () => {
        console.log("入力終了");
        const tag = input.value;
        if (tag.length > 0) {
            addTag(_tags, tag_container, tag, deleteCall);
            _tags.push(tag);
            if (typeof addTagCall == "function") addTagCall();
        }
        tagE.remove();
    })

    tag_container.append(tagE);
    input.focus();
}