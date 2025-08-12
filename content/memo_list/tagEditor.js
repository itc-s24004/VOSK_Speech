export class TagEditor {
    constructor(jsonHTML, ipc_client) {
        this.jsonHTML = jsonHTML;
        this.ipc_client = ipc_client;
    }

    /**
     * タグの追加
     * @param {string[]} _tags 
     * @param {HTMLElement} tag_container 
     * @param {string} tag 
     */
    addTag(_tags, tag_container, tag) {
        const tagE = this.jsonHTML.toHTML({
            tag: "span",
            class: ["tag"]
        });
        tagE.innerText = tag;

        const deleteB = this.jsonHTML.toHTML({
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

        deleteB.addEventListener("click", () => {
            tagE.remove();
            _tags.splice(_tags.indexOf(tag), 1);
        });

        tag_container.append(tagE);
    }

    createTagContainer(_tags, _id) {
        const tags = this.jsonHTML.toHTML({
            tag: "div",
            class: ["memo-tags"]
        });

        const tag_container = this.jsonHTML.toHTML({
            tag: "div",
            class: ["tag-container"]
        });
        tags.append(tag_container);

        _tags.forEach(tag => this.addTag(_tags, tag_container, tag));

        const tagB = this.jsonHTML.toHTML({
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

        tagB.addEventListener("click", () => {
            const input = this.createTagInput(_tags, tag_container, _id);
            tag_container.appendChild(input);
            input.focus();
        });

        return tags;
    }

    createTagInput(_tags, tag_container, _id) {
        const wrapper = this.jsonHTML.toHTML({
            tag: "span",
            class: ["tag", "editing"]
        });

        const input = this.jsonHTML.toHTML({
            tag: "input",
            class: ["tag-input"],
            attribute: {
                "type": "text",
                "placeholder": "新しいタグを入力..."
            }
        });

        wrapper.appendChild(input);

        input.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                const newTag = input.value.trim();
                wrapper.remove();
                this.addTag(_tags, tag_container, newTag);
                _tags.push(newTag);
                await this.ipc_client.invoke("VOSK_Speech", "setSpeechIndex", _id, "tags", _tags);
            }
        });

        input.addEventListener('blur', () => {
            wrapper.remove();
        });

        return wrapper;
    }
}