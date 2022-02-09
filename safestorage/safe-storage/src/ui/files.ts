import {addFileToQueue, addUploadInfoUpdateListener, getUploadQueue, uploadEventLast} from "../user/uploadFiles";
import {getNowDir} from "../user/nowDir";
import {el} from "../main";

export async function initUI() {
    const {files, uploadInfo, uploadInfoFiles, stopUploadFiles} = el;
    files.addEventListener("dragover", ev => {
        el.files.style.background = "#cbcbff";
        ev.preventDefault()
        ev.stopPropagation()
    }, false)
    files.addEventListener("dragleave", ev => {
        el.files.style.background = "none";
        ev.preventDefault()
        ev.stopPropagation()
    }, false)
    files.addEventListener("drop", ev => {
        el.files.style.background = "none";
        ev.preventDefault();
        ev.stopPropagation()
        if (getUploadQueue().length >= 1) {
            return;
        }
        if (!ev?.dataTransfer?.files) {
            return;
        }
        Object.values(ev.dataTransfer.files).forEach(f => addFileToQueue(f, getNowDir()))
    }, false);
    stopUploadFiles.addEventListener('click', () => {
        getUploadQueue().splice(0, getUploadQueue().length)
        if (uploadEventLast) {
            uploadEventLast.stopPropagation()
            uploadEventLast.stopImmediatePropagation()
        }
    })
    addUploadInfoUpdateListener((info, queue) => {
        const size = queue.length
        if (info.size <= info.uploaded || size <= 0) {
            uploadInfoFiles.innerHTML = '';
            uploadInfo.style.display = "none"
            return;
        }
        let c = 0;
        uploadInfoFiles.innerHTML =
            `Left: ${size} files. <br/>` +
            queue
                .map(value => {
                    const ch = value.file === info.file ?
                        `${value.file.name}(${((info.uploaded / info.size) * 100).toFixed(0)}%)`
                        : `${value.file.name}`
                    c += ch.length
                    return c % 3 == 0 ? ch + "<br/>" : ch
                })
                .join(', ')
        uploadInfo.style.display = "block"
    })
}

