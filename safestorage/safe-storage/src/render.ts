import {getFiles, SimpleFile} from "./user/files";
import {el} from "./main";
import {getNowDir, setNowDir} from "./user/nowDir";
import {contextMenu} from "./ui/contextMenu";
import {showMediaFile} from "./ui/media_view";

export function updateFilesRender(timeout: number = 0) {
    const dir = getNowDir();
    setTimeout(() => getFiles(dir).then(f => renderFiles(f, dir)), timeout)
}

export async function renderFiles(files: SimpleFile[], dir: string): Promise<void> {
    el.nowFolderPath.innerText = `Path: ${dir}`
    const all_dirs: HTMLLIElement[] = []
    const all_files: HTMLLIElement[] = []

    for (const file of files) {
        const li = document.createElement("li")
        const name = document.createElement("span")
        const content = document.createElement("main")

        content.innerHTML = `<img src="/assets/images/file.png" alt="">`

        let isDir = false
        if (file.Type == "dir") {
            let is_blakw = file.FileName === "z8yr3n2z8yr3n223zn7t32tz732n23tn72zt23zn7t32tz732n23tn72zt";
            content.innerHTML = `<img src="/assets/images/folder.png" alt="">`
            name.innerText = file.FileName
            if (is_blakw) {
                if (dir !== "/") {
                    name.innerText = "Назад"
                } else {
                    continue
                }
            }
            isDir = true
            li.onclick = (e) => {
                if (!e.ctrlKey) {
                    setNowDir(file.URL.substring(8))
                    return;
                }
            }
            if (!is_blakw) {
                li.addEventListener('contextmenu', e => contextMenu(false, file.URL, file.FileName, "", e));
            }
        } else {
            const exp = file.FileName.split('.').pop() || "";
            switch (exp) {
                case 'png':
                case 'gif':
                case 'jpeg':
                case 'svg':
                case 'webp':
                case 'jpg': {
                    content.innerHTML = `<img src="${file.URL}" alt="">`
                    break;
                }
                case 'mpeg':
                case 'ogg':
                case 'webm':
                case 'mp4': {
                    content.innerHTML = `<video buffered="1s" muted="muted" class="file-video"><source src="${file.URL}"/></video>`
                }
            }
            li.addEventListener('contextmenu', e => contextMenu(true, file.URL, file.FileName, exp, e));
            li.addEventListener('click', ev => showMediaFile({
                ...file,
                Exp: exp
            }, ev))
            name.innerText = file.FileName;
        }

        li.appendChild(content);
        li.appendChild(name);
        (isDir ? all_dirs : all_files).push(li);
    }
    let child: ChildNode | null;
    while ((child = el.files.firstChild) !== null) {
        el.files.removeChild(child)
    }
    el.files.append(...all_dirs, ...all_files)
}