import {SimpleFile} from "../user/files";
import {editFile} from "./editor";

const el = document.querySelector(".mediaView")! as HTMLDivElement;
let video: HTMLVideoElement | null;

function display(show: boolean = true) {
    el.style.display = show ? "block" : "none";
}

display(false)

export interface MediaSimpleFile {
    URL: string
    Type: string
    FileName: string
    ByteSize: number
    LastEdited: Date
    Exp: string
}

let file: SimpleFile | null;
let opened = false;

export function showMediaFile(sfile: MediaSimpleFile, ev: MouseEvent) {
    file = sfile;
    ev.preventDefault();
    let child: ChildNode | null;
    while ((child = el.firstChild) !== null) {
        el.removeChild(child)
    }
    display();
    opened = true;
    const exp = sfile.Exp;
    switch (exp) {
        case 'png':
        case 'gif':
        case 'jpeg':
        case 'svg':
        case 'webp':
        case 'jpg': {
            el.innerHTML = `<img src="${file.URL}" alt="файл ${sfile.FileName}"><br/><span>ESCAPE - close</span>`
            break;
        }
        case 'mpeg':
        case 'ogg':
        case 'webm':
        case 'mp4': {
            video = document.createElement("video");
            video.src = file.URL
            video.preload = "auto"
            try {
                video.srcObject = new MediaStream()
            } catch (ignored) {
                try {
                    video.srcObject = new Blob()
                } catch (ignored) {
                }
            }
            video.autoplay = true
            video.controls = true
            el.appendChild(video);
            el.innerHTML += "<br/><span>ESCAPE - close</span>";
            break;
        }
        default: {
            editFile(sfile.FileName, sfile.URL).then(void 0)
            opened = false;
            display(false);
            break;
        }
    }
}

window.addEventListener('keydown', e => {
    if (e.key.toLocaleUpperCase() === "ESCAPE" && opened) {
        display(false)
        let child: ChildNode | null;
        while ((child = el.firstChild) !== null) {
            el.removeChild(child)
        }
        e.stopPropagation()
    }
})
