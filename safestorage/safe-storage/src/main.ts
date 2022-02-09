import './styles/styles.scss'
import {addUpdateDirListener} from "./user/nowDir";
import {getFiles} from "./user/files";
import {renderFiles} from "./render";
import {addUInfoListener} from "./user/userInfo";
import {newUploadThread} from "./user/uploadFiles";
import './u'
import './utils/logger'
import {initUI} from "./ui/files";
import './ui/contextMenu'
import './ui/createDir'
import './ui/admConfig'
import {initAdmin} from "./ui/admConfig";
import {logInfo} from "./utils/logger";

export const el = {
    nowFolderPath: document.getElementById("now-folder-path")! as HTMLSpanElement,
    files: document.getElementById("files")! as HTMLUListElement,
    diskQuota: document.getElementById("disk-quota")! as HTMLProgressElement,
    diskQuotaText: document.getElementById("disk-quota-text")! as HTMLSpanElement,
    uploadInfo: document.getElementById("uploadInfo")! as HTMLDivElement,
    uploadInfoFiles: document.getElementById("uploadInfoFiles")! as HTMLSpanElement,
    stopUploadFiles: document.getElementById("stopUploadFiles")! as HTMLButtonElement
}

addUpdateDirListener(async dir => {
    await renderFiles(await getFiles(dir), dir)
})

let first = false

addUInfoListener(info => {
    if (!first) {
        initUI().then(() => setTimeout(() => {
            console.log("%cUI successful initialized!", "color: lime;")
        }, 220))
        first = true
        if (info.admin) {
            initAdmin().then(() => logInfo(
                "Admin initialized!", {
                    color: "green"
                }))
        }
    }
    el.diskQuota.max = info.limit
    const usage = Number((info.dir_size / 1024 / 1024).toFixed(2))
    el.diskQuota.value = usage;
    el.diskQuotaText.innerText = `${usage}MB из ${info.limit}MB`
})

newUploadThread().then(void 0)