const ipc = window.electron


class ipc_client {

    // /**@type {Promise.<number>} */
    // static get id() {
    //     return this.invoke("WindowID");
    // }


    /**
     * ローカルファイルのフルパスを取得
     * @param {File} file 
     * @returns {string}
     */
    static getFilePath(file) {
        return ipc.getFilePath(file);
    }



    /**
     * 
     * @param {string} channel 
     * @param  {...any} args 
     * @returns {Promise.<any>}
     */
    static invoke = (channel, ...args) => {
        return ipc.invoke(channel, ...args);
    }


    
    /**
     * 
     * @param {string} channel 
     * @param  {(...any) => void} callback 
     * @returns 
     */
    static on = (channel, callback) => {
        ipc.on(channel, (ev, ...args) => callback(...args));
        return this;
    }



    /**
     * 
     * @param {string} channel 
     * @param  {...any} args 
     * @returns {Promise.<any>}
     */
    static send = (channel, ...args) => {
        ipc.send(channel, ...args);
        return this;
    }

    
    /**
     * 
     * @param {import("electron").OpenDialogOptions} option 
     * @returns {Promise.<import("electron").OpenDialogReturnValue>}
     */
    static showOpenDialog(option) {
        const result = this.invoke("showOpenDialog", option);
        // console.log(result);
        return result;
    }
}