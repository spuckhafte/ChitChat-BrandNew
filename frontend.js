const socket = io.connect('http://localhost:3000');
const PRE = 'shitkey-'

users = {}

window.onload = () => {
    const username = prompt('Your Name: ');
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
    createMsg(msg, username, socket.id == id);
})

function isValid(msg = '') {
    for (let char of msg.split('')) {
        if (char !== ' ') return true
    }
    return false;
}

function toSs(key, val) {
    sessionStorage.setItem(key, val);
}

function fromSs(key) {
    return sessionStorage.getItem(key)
}