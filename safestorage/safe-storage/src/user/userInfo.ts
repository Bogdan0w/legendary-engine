let loaded = false;
let userInfo: UserInfoInter;
let listeners: SimpleListener[] = [];

type SimpleListener = (info: UserInfoInter) => any;

export function isLoaded(): boolean {
    return loaded
}

export function getUserInfo(): UserInfoInter {
    return userInfo
}

export interface UserInfoInter {
    name: string
    prefix: string
    limit: number
    admin: boolean
    dir_size: number
}

export function addUInfoListener(listener: SimpleListener) {
    listeners.push(listener)
}

export async function updateUserInfo() {
    return new Promise<UserInfoInter>((resolve, reject) => {
        fetch("/uInfo", {
            cache: "default",
            keepalive: false
        })
            .then(r => r.json())
            .then(info => {
                const inf = Object.assign<UserInfoInter, UserInfoInter>({
                    admin: false,
                    limit: -1,
                    name: "User",
                    prefix: "/",
                    dir_size: 0
                }, info)
                if (userInfo === inf) {
                    return;
                }
                userInfo = inf
                loaded = true;
                listeners.forEach(func => setTimeout(func(inf)))
                resolve(userInfo)
            })
            .catch(reject)
    })
}

updateUserInfo().then(void 0)
setInterval(updateUserInfo, 10500)
