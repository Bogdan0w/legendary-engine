import axios from "axios";
import {getNowDir} from "../user/nowDir";
import {updateFilesRender} from "../render";
import {editFile} from "./editor";
import FileDownload from "js-file-download";

export const elCtxM = document.getElementById("ctxMenu")! as HTMLDivElement

function hide(show = false) {
    if (show) {
        elCtxM.style.opacity = "1";
        setTimeout(() => elCtxM.style.display = "block", 160)
        return
    }
    elCtxM.style.opacity = "0";
    setTimeout(() => elCtxM.style.display = "none", 160)
}

hide()

interface NowElEd {
    isFile: boolean
    url: string
    fileName: string
    exp: string
    event: MouseEvent | undefined
}

let nowEl: NowElEd = {event: undefined, exp: "", fileName: "", isFile: false, url: ""}

const els = {
    download: elCtxM.querySelector(".download__file")! as HTMLButtonElement,
    remove: elCtxM.getElementsByClassName("remove__file")![0] as HTMLButtonElement,
    move: elCtxM.querySelector<HTMLButtonElement>(".move__file")!,
    rename: elCtxM.getElementsByClassName("rename__file")![0] as HTMLButtonElement,
    edit: elCtxM.getElementsByClassName("edit__file")![0] as HTMLButtonElement,
}

els.download.addEventListener('click', () => {
    axios.get(nowEl.url, {
        responseType: "blob"
    }).then((response) => {
        FileDownload(response.data, nowEl.fileName);
    });
})

els.remove.addEventListener('click', () => {
    const dir = getNowDir();
    const form = new FormData();
    form.set("file", `${dir}/${nowEl.fileName}`);
    axios.delete("/acts", {
        data: form
    })
        .then(() => {
            hide()
            updateFilesRender(1000);
        })
        .catch(hide);
})

els.move.addEventListener('click', () => {
    const dir = getNowDir();
    let fn = prompt("New file's path", `${dir}/${nowEl.fileName}`.replaceAll('//', '/'));
    if (fn === null) {
        return;
    }
    if (fn.length <= 0) {
        return;
    }
    const form = new FormData();
    form.set("fn", `${fn}`);
    form.set("fo", `${dir}/${nowEl.fileName}`);
    axios.post('/acts/rename', form)
        .then(() => {
            hide()
            updateFilesRender(1001);
        })
        .catch(hide)
})

els.rename.addEventListener('click', () => {
    let fn = prompt("New file's name", nowEl.fileName);
    if (fn === null) {
        return;
    }
    if (fn.length <= 0) {
        return;
    }
    const form = new FormData();
    const dir = getNowDir();
    form.set("fn", `${dir}/${fn}`);
    form.set("fo", `${dir}/${nowEl.fileName}`);
    axios.post('/acts/rename', form)
        .then(() => {
            hide()
            updateFilesRender(1001);
        })
        .catch(hide)
})

els.edit.addEventListener('click', () => {
    editFile(nowEl.fileName, nowEl.url).then(void 0)
    hide()
})

window.addEventListener('click', () => hide())
document.body.querySelector(".right-s")!.addEventListener('contextmenu', e => {
    hide();
    e.preventDefault();
})
elCtxM.addEventListener('contextmenu', e => e.stopPropagation())
elCtxM.addEventListener('click', e => e.stopPropagation())

export async function contextMenu(isFile: boolean, url: string, fileName: string, exp: string, e: MouseEvent) {
    els.edit.style.display = isFile ? "initial" : "none";
    nowEl = {
        isFile,
        url,
        fileName,
        exp,
        event: e
    }
    e.stopImmediatePropagation()
    //elCtxM.style.display = "block"
    hide(true)
    elCtxM.style.left = e.x.toString() + "px"
    elCtxM.style.top = e.y.toString() + "px"
    e.preventDefault()
}