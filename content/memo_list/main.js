window.addEventListener("load", async () => {
    const memo_list = document.getElementById("memo_list");



    /**@type {HTMLInputElement} */
    const searchInput = document.getElementById("searchInput");
    /**@type {HTMLFormElement} */
    const searchForm = document.getElementById("searchForm");
    searchForm.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const search = searchInput.value;
        updateList(search.length > 0 ? (i) => (i.tags.includes(search) || i.title.includes(search)) : () => true);
    })
    updateList(() => true);



    /**
     * 
     * @param {(index: import("./speechIndex").SpeechIndex) => boolean} filter 
     */
    async function updateList(filter) {
        /**@type {import("./speechIndex").SpeechIndex[]} */
        const SpeechIndex = await ipc_client.invoke("VOSK_Speech", "getSpeechIndex");

        [...memo_list.children].forEach(m => m.remove());


        const SpeechDataFrameList = SpeechIndex.filter(e => filter(e)).map(({id: _id, title: _title, time: _time, tags: _tags}) => {


            /**フレーム▼ */
            const root = jsonHTML.toHTML({
                tag: "div",
                class: ["memo-item"],
                attribute: {"id": `${_id}-root`}
            });

            
            /**メモコンテンツフレーム▼ */
            const memo_content = jsonHTML.toHTML({
                tag: "div",
                class: ["memo-content"]
            });
            root.append(memo_content);


            /**タイトル▼ @type {HTMLInputElement} */
            const title = jsonHTML.toHTML({
                tag: "input",
                class: ["memo-title-input"],
                attribute: {"value": _title, "id": `${_id}-title`}
            });
            memo_content.append(title);


            //タグ一覧▼
            const tags = jsonHTML.toHTML({
                tag: "div",
                class: ["memo-tags"]
            });
            memo_content.append(tags);


            /**タグコンテナ▼ */
            const tag_container = jsonHTML.toHTML({
                tag: "div",
                class: ["tag-container"]
            });
            tags.append(tag_container);


            /**タグ一覧生成▼ */
            _tags.forEach(tag => addTag(_tags, tag_container, tag));


            /**タグ追加ボタン▼ */
            const tagB = jsonHTML.toHTML({
                tag: "button",
                class: ["tag-add"],
                child: [
                    {
                        tag: "i",
                        class: ["fas", "fa-plus"]
                    },
                    "タグを追加"
                ]
            });
            tags.append(tagB);


            /**タグ追加処理▼ */
            tagB.addEventListener("click", () => {
                console.log("タグ追加処理");
                addTag(_tags, tag_container, "tag name");
                _tags.push("tag name");
            });


            /** */
            const memo_actions = jsonHTML.toHTML({
                tag: "div",
                class: ["memo-actions"]
            });
            root.append(memo_actions);


            /**コンテンツ編集ボタン▼ */
            const memo_edit = jsonHTML.toHTML({
                tag: "button",
                class: ["edit-button"],
                child: [
                    {
                        tag: "i",
                        class: ["fas", "fa-edit"]
                    }
                ]
            });
            memo_actions.append(memo_edit);
            memo_edit.addEventListener("click", () => ipc_client.invoke("VOSK_Speech", "editor", _id));


            /**保存ボタン▼ */
            const memo_save = jsonHTML.toHTML({
                tag: "button",
                class: ["edit-button"],//!!!デザイン修正後にここも修正
                child: [
                    {
                        tag: "i",
                        class: ["fas", "fa-check"]
                    }
                ]
            });
            memo_actions.append(memo_save);
            memo_save.addEventListener("click", async () => {
                ipc_client.invoke("VOSK_Speech", "setSpeechIndex", _id, "title", title.value);
                await ipc_client.invoke("VOSK_Speech", "setSpeechIndex", _id, "tags", _tags);
            });

            return root;
        });


        memo_list.append(...SpeechDataFrameList);
    }
    


    /**
     * 
     * @param {string[]} _tags 
     * @param {HTMLElement} tag_container 
     * @param {string} tag 
     */
    function addTag(_tags, tag_container, tag) {
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
        });

        tag_container.append(tagE);
    }
});