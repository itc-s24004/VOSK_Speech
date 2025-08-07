/**
 * 
 * @typedef HTMLJSON_Attribute 
 * @property {} width
 * 
 * 
 * @typedef HTMLJSON
 * @property {keyof HTMLElementTagNameMap} tag
 * @property {(HTMLJSON | string)[]} child
 * @property {string[]} class
 * @property { CSSStyleDeclaration } style
 * @property {Object.<string, string> & HTMLJSON_Attribute} attribute
*/



class jsonHTML {
    /**
     * 
     * @param {HTMLJSON} json 
     */
    static toHTML(json) {
        if (typeof json == "string") return json;
        if (typeof json != "object" && !Array.isArray(json)) return null;

        const {tag, child, class:classList, style, attribute} = json;
        if (typeof tag != "string") return null;

        const element = document.createElement(tag);

        if (Array.isArray(classList)) element.classList.add(...classList.filter(c => typeof c == "string"));
        if (typeof style == "object" && !Array.isArray(style)) Object.keys(style).forEach(sname => element.style[sname] = style[sname]);
        if (typeof attribute == "object" && !Array.isArray(attribute)) Object.keys(attribute).forEach(attr => element.setAttribute(attr, attribute[attr]));

        if (Array.isArray(child)) element.append(...child.map(hj => this.toHTML(hj)));
        
        return element;
    }
}