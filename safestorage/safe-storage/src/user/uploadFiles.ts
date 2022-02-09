import {sleep} from "../utils/thread";
import {renderFiles} from "../render";
import {getFiles} from "./files";
import {getNowDir} from "./nowDir";
import axios from "axios";

const queue: UnloadFilesQueue[] = []
export let uploadEventLast: Event | null = null;

type UnloadFilesQueue = { file: File, dir: string };

export function addFileToQueue(file: File, dir: string) {
    queue.push({
        file,
        dir
    })
    callListeners().then(void 0)
}

async function startUnload(file: File, dir: string) {
    const form = new FormData();
    console.log(dir)
    form.append("file", file);
    form.append("dir", dir)
    try {
        await axios.put('/upload', form, {
            onUploadProgress: ev => {
                uploadEventLast = ev
                const info: UploadStatusInfo = {
                    file,
                    dir,
                    size: ev.total,
                    uploaded: ev.loaded
                }
                for (const v of uploadStatusListeners) {
                    setTimeout(() => v(info, queue));
                }
            },
            responseType: 'text',
            validateStatus: () => true
        })
            .then(r => {
                if (r.data.toString().startsWith("FileSystem limit(")) {
                    console.log("FF")
                    alert(`Место на диске переполнено для выгрузки ${file.name}!`)
                }
            })
    } catch (ignored) {
    }
    uploadEventLast = null
    const info: UploadStatusInfo = {
        file,
        dir,
        size: 1,
        uploaded: 1
    }
    for (const v of uploadStatusListeners) {
        setTimeout(() => v(info, queue));
    }
}

const listeners: SimpleListener[] = [];
type SimpleListener = (queue: UnloadFilesQueue[]) => any;
const uploadStatusListeners: UploadStatusListener[] = []
type UploadStatusListener = (info: UploadStatusInfo, queue: UnloadFilesQueue[]) => any;
type UploadStatusInfo = {
    file: File,
    dir: string,
    size: number,
    uploaded: number
}

export function addUploadInfoUpdateListener(listener: UploadStatusListener) {
    uploadStatusListeners.push(listener)
}

async function callListeners() {
    for (const v of listeners) {
        setTimeout(() => v(queue));
    }
}

export async function newUploadThread() {
    let successful = 0;
    for (let i = 0; i < queue.length; i++) {
        const fel = queue[i]
        try {
            await startUnload(fel.file, fel.dir);
            queue.splice(i, 1)
            successful++;
            callListeners().then(void 0);
        } catch (ignore) {
            await sleep(100)
        }
    }
    if (successful > 0) {
        const nowDir = getNowDir()
        await renderFiles(await getFiles(nowDir), nowDir)
    }
    await sleep(500)
    newUploadThread().then(void 0)
}


export function getUploadQueue(): UnloadFilesQueue[] {
    return queue
}