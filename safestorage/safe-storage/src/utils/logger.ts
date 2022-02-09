let log: [string, string][] = []

interface loggerStyles {
    color?: string | "green" | "lime"

    [key: string]: any
}

export function logInfo(value: any, css: loggerStyles = {}) {
    let rawCSS = ''
    for (const st in css) {
        const cont = css[st]
        if (cont && st) {
            rawCSS += `${st}: ${cont}`
        }
    }
    if (typeof value === "object") {
        value = JSON.stringify(value)
    }
    console.log("%c%s", rawCSS, value)
    log.push([rawCSS, value])
}