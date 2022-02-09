import axios from "axios";

interface SimpleUser {
    Pass: string
    Prefix: string
    Limit: number
    IsAdmin: boolean
    Name: string
}

type UsersMassive = { [key: string]: SimpleUser };

export async function initAdmin() {
    const [btn, admDir, admMenu, admTable, removeUser, btnNew, btnSave, btnCancel] = [
        "#admConfig",
        ".admDir",
        ".admMenu",
        ".admMenu > table",
        ".admMenu > div > .remove__button",
        ".admMenu > div > .new__button",
        ".admMenu > div > .save__button",
        ".admMenu > div > .cancel__button",
    ].map(query => document.querySelector<HTMLElement>(query)!)

    function menuVisible(hide: boolean) {
        admMenu.style.display = hide ? "none" : "block";
    }

    menuVisible(true)

    const tableDef = admTable.innerHTML;
    btn.addEventListener('click', async () => {
        const users: UsersMassive = (await axios.get("/acts/a_edit", {
            validateStatus: () => true,
            responseType: "json"
        })).data;
        let resp = "";
        for (const login in users) {
            const user = users[login];
            resp += `
           <tbody data-user>
              <tr>
                 <th contenteditable data-login>${login}</th>
                 <th contenteditable data-pass>${user.Pass}</th>
                 <th contenteditable data-prefix>${user.Prefix}</th>
                 <th contenteditable data-limit>${user.Limit}</th>
                 <th contenteditable data-admin>${user.IsAdmin}</th>
                 <th contenteditable data-name>${user.Name}</th>
              </tr>
           </tbody>
            `
        }
        admTable.innerHTML = tableDef + resp;
        menuVisible(false);
    });

    btnNew.addEventListener('click', () => {
        admTable.innerHTML += `
            <tbody data-user>
                <tr>
                    <th contenteditable data-login>New</th>
                    <th contenteditable data-pass>123123</th>
                    <th contenteditable data-prefix>/New</th>
                    <th contenteditable data-limit>128</th>
                    <th contenteditable data-admin>false</th>
                    <th contenteditable data-name>NoName</th>
                </tr>
            </tbody>
            `
    })
    removeUser.addEventListener('click', () => {
        const login = prompt("Please enter a user's login for remove:")
        if (login === null || login?.length <= 0) {
            return;
        }
        const tbody = Object.values(admTable.querySelectorAll<HTMLTableColElement>("tbody[data-user] > tr"))
            .filter(el => {
                const ch = el?.childNodes[1];
                if (!(ch instanceof HTMLElement)) {
                    return false;
                }
                return ch.innerText == login;
            })[0].parentNode;
        if (!(tbody instanceof HTMLElement)) {
            return;
        }
        tbody.remove()
    })
    btnSave.addEventListener('click', () => {
        const users: UsersMassive = {};
        for (const el of Object.values(admTable.querySelectorAll<HTMLTableColElement>("tbody[data-user] > tr"))) {
            const [Login, Pass, Prefix, Limit, IsAdmin, Name] = ["login", "pass", "prefix", "limit", "admin", "name"].map(
                v => (el.querySelector(`th[data-${v}]`)! as HTMLTableCellElement).innerText.toString()
            )
            users[Login] = {
                Pass,
                Prefix,
                Limit: Number(Limit),
                IsAdmin: Boolean(IsAdmin),
                Name,
            }
        }
        axios.patch("acts/a_edit", users).then(() => menuVisible(true));
    })
    btnCancel.addEventListener('click', () => menuVisible(true));
    admDir.style.display = "block";
}