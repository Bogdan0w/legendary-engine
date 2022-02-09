//import highlight from "highlight.js";
import axios from "axios";
import CodeMirror from "codemirror";
// Modes imports
import 'codemirror/mode/apl/apl'
import 'codemirror/mode/asciiarmor/asciiarmor'
import 'codemirror/mode/asterisk/asterisk'
import 'codemirror/mode/asn.1/asn.1'
import 'codemirror/mode/brainfuck/brainfuck'
import 'codemirror/mode/clike/clike'
import 'codemirror/mode/clojure/clojure'
import 'codemirror/mode/cmake/cmake'
import 'codemirror/mode/cobol/cobol'
import 'codemirror/mode/css/css'
import 'codemirror/mode/coffeescript/coffeescript'
import 'codemirror/mode/commonlisp/commonlisp'
import 'codemirror/mode/crystal/crystal'
import 'codemirror/mode/cypher/cypher'
import 'codemirror/mode/d/d'
import 'codemirror/mode/dart/dart'
import 'codemirror/mode/diff/diff'
import 'codemirror/mode/dtd/dtd'
import 'codemirror/mode/django/django'
import 'codemirror/mode/dockerfile/dockerfile'
import 'codemirror/mode/php/php'
import 'codemirror/mode/pascal/pascal'
import 'codemirror/mode/pug/pug'
import 'codemirror/mode/swift/swift'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/jsx/jsx'
import 'codemirror/mode/toml/toml'
import 'codemirror/mode/yaml/yaml'
import 'codemirror/mode/rust/rust'
import 'codemirror/mode/htmlmixed/htmlmixed'
import 'codemirror/mode/go/go'
import 'codemirror/mode/lua/lua'

const el = document.querySelector(".fileEdit") as HTMLDivElement
const els = {
    content: el.querySelector(".content") as HTMLDivElement,
    cancel: el.querySelector(".cancel__button") as HTMLButtonElement,
    save: el.querySelector(".save__button") as HTMLButtonElement,
    name: el.querySelector(".file__name") as HTMLSpanElement,
};

let editor: CodeMirror.Editor = CodeMirror(els.content, {
    lineNumbers: true,
    lineWrapping: true,
    scrollbarStyle: "native",
    inputStyle: "contenteditable",
    autofocus: true,
    theme: "mdn-like",
    showCursorWhenSelecting: true,
    addModeClass: true
});

function display(show: boolean = true) {
    el.style.display = show ? "block" : "none";
}

display(false)

els.cancel.addEventListener('click', () => {
    display(false)
})

let path: string = "";

els.save.addEventListener('click', () => {
    display(false)
    const form = new FormData();
    form.set("furl", path);
    form.set("content", editor.getValue())
    axios.patch("/acts/edit", form).then(void 0)
})

export async function editFile(fpath: string, url: string) {
    els.name.innerText = `Файл: ${fpath}`;
    path = fpath;
    const value: string = (await axios.get(url, {
        transformResponse: data => data.toString()
    })).data;
    editor.setValue(value)
    editor.refresh();
    display()
}