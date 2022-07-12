const socket = io.connect('http://localhost:3000');
const PRE = 'shitkey-'

users = {}

window.onload = () => {
    let username;

    if (fromLs(PRE + 'username') || fromSs(PRE + 'username')) {
        if (fromLs(PRE + 'username'))
            username = fromLs(PRE + 'username');
        else
            username = fromSs(PRE + 'username')
    } else {
        do {
            username = prompt('Your Name: ')
        } while (!isName(username)) {
            username = prompt('Your Name: ')
        }
        toLs(PRE + 'username', username);
    }

    toSs(PRE + 'username', username);

    socket.emit('user-connect', username);
    createJoinMsg(username, true)
}

async function sendMsg(msg = '') {
    if (!isValid(msg)) return;
    Input.el.disabled = true;
    let username = fromSs(PRE + 'username')
    socket.emit('msg-from-client', msg, username);
    setInput('')
    return true;
}

socket.on('update-online', usernames => {
    setOnline(JSON.stringify(usernames))
})

socket.on('send-join-msg', username => {
    createJoinMsg(username)
})

socket.on('msg-of-user', (msg, username, id) => {
    Input.el.disabled = false;
    Input.el.focus();
    const msgData = createMsg(msg, username, socket.id == id);
    socket.emit('update-db', msgData);
})

function isValid(msg = '') {
    for (let char of msg.split('')) {
        if (char !== ' ') return true
    }
    return false;
}

function isName(name) {
    if (name.length > 10) return;
    if (!/^[a-zA-Z0-9]+$/.test(name)) return;
    return name;
}

function toSs(key, val) {
    sessionStorage.setItem(key, val);
}

function toLs(key, val) {
    localStorage.setItem(key, val);
}

function fromSs(key) {
    return sessionStorage.getItem(key)
}

function fromLs(key) {
    return localStorage.getItem(key)
}