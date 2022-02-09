import axios from "axios";
import {updateFilesRender} from "../render";
import {getNowDir} from "../user/nowDir";

window.addEventListener('keyup', e => {
    if (!e.ctrlKey || e.key.toLocaleLowerCase() !== "x") {
        return
    }
    e.preventDefault();
    let fn = prompt("Creating new file. Enter filename or cancel", "")
    if (fn === null) {
        return;
    }
    if (fn.length <= 0) {
        return;
    }
    const form = new FormData();
    form.set("file", getNowDir() + "/" + fn);
    axios.put("/acts", form)
        .then(() => updateFilesRender(1000))
        .catch(void 0)

})