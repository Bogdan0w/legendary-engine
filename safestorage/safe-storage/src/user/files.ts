import {getUserInfo} from "./userInfo";

export interface SimpleFile {
    URL: string
    Type: string
    FileName: string
    ByteSize: number
    LastEdited: Date
}

const searchD = /href="([\/a-zA-Zа-яА-Я.\d_()\s\-\[\]]*)" class="([a-zA-Z]*)">([\/a-zA-Zа-яА-Я.\d_()\s\-\[\]]*)<\/a>, [a-zA-Z_]*, ?(([\d]*) bytes,)? last modified ([\d-\s:]*[\d])/gm;
const backURL = /<a href="([/a-zA-Z\d]*)" class="dir">..<\/a>/gm;

export async function getFiles(directory: string): Promise<SimpleFile[]> {
    while (!getUserInfo()) {
        await new Promise(r => setTimeout(r, 3))
    }
    let files: SimpleFile[] = []
    try {
        const BrowseView = await fetch(`${location.origin}/storage${getUserInfo().prefix}${directory}`)
        const text = await BrowseView.text()
        files.push({
            ByteSize: 0,
            FileName: "z8yr3n2z8yr3n223zn7t32tz732n23tn72zt23zn7t32tz732n23tn72zt",
            LastEdited: new Date(),
            Type: "dir",
            URL: text.matchAll(backURL).next().value[1]
        })
        let res;
        while ((res = searchD.exec(text)) != null) {
            files.push({
                URL: res[1],
                Type: res[2],
                ByteSize: Number(res[5]) || -1,
                FileName: res[3],
                LastEdited: new Date(res[6])
            })
        }
    } catch (ignored) {
    }
    return files
}