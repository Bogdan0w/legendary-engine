let nowDir: string;
let listeners: SimpleListener[] = [];

type SimpleListener = (dir: string) => any;

function update() {
    let u = location.hash.substring(1)
    if (!u.startsWith("/")) {
        location.hash = "/"
        nowDir = "/"
        return;
    }
    if (u === nowDir) return;
    nowDir = u
    listeners.forEach(l => l(u))
}

export function getNowDir(): string {
    return nowDir
}

export function setNowDir(newDir: string) {
    location.hash = newDir
}

export function addUpdateDirListener(listener: SimpleListener) {
    listeners.push(listener)
}

setTimeout(update, 10)
setInterval(update, 100)