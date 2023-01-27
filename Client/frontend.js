const socket = io.connect('https://shit-chat.onrender.com');
const PRE = 'shitkey-'

users = {}

window.onload = async () => {
    let username;

    // if (fromLs(PRE + 'username') || fromSs(PRE + 'username')) {
    //     if (fromLs(PRE + 'username'))
    //         username = fromLs(PRE + 'username');
    //     else
    //         username = fromSs(PRE + 'username')
    // } else {
    //     do {
    //         username = prompt('Your Name: ')
    //     } while (!isName(username)) {
    //         username = prompt('Your Name: ')
    //     }
    //     toLs(PRE + 'username', username);
    // }

    // toSs(PRE + 'username', username);
    // socket.emit('user-connect', username);
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

socket.on('load-prev-msg', (data, username) => {
    data = JSON.parse(data);
    for (let id of Object.keys(data)) {
        let { author, msg, date } = data[id];
        createMsg(msg, author, author == username, date);
    }
    socket.emit('fire-join-msg', fromSs(PRE + 'username'))
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

socket.on('user-left', user => {
    createJoinMsg(user, false, 1)
})

socket.on('registration-failed', username => {
    tooltip('Username Already Taken', 2500)
})

socket.on('registered', username => {
    toSs(PRE + 'username', username);
    toLs(PRE + 'username', username);
    socket.emit('user-connect', username);
    document.querySelector('#pre-screen').style['display'] = 'none';
    setDisplay('flex');
});

socket.on('login-failed', username => {
    tooltip('No Such User', 2000);
});

socket.on('logged-in', username => {
    toSs(PRE + 'username', username);
    toLs(PRE + 'username', username);
    socket.emit('user-connect', username);
    document.querySelector('#pre-screen').style['display'] = 'none';
    setDisplay('flex');
    if (!isMobile()) Input.el.focus();
});

socket.on('session-running', activeSessionId => {
    tooltip(`Session Active <button onClick="endSession('${activeSessionId}')">End It</button>`, 5000);
});

socket.on('nuke-session', (sessionAddress, nukedFrom) => {
    if (sessionAddress == socket.id) {
        socket.emit('session-nuked', nukedFrom);
        location.reload();
    };
});

socket.on('session-nuked', home => {
    if (socket.id == home) tooltip('Session Ended');
})

function getIn(name = '', pass = '', mode = '') {
    if (!isName(name)) {
        if (mode === 'SignUp')
            tooltip('Invalid Name <kbd>3-15 characters</kbd><br><kbd>letters and numbers', 2500);
        else
            tooltip('No Such User');
        return;
    }
    if (!isPass(pass)) {
        if (mode === 'SignUp')
            tooltip('Invalid Password <kbd>6-15 characters</kbd><br><kbd>letters, numbers and special chars</kbd>', 3000);
        else
            tooltip('No Such User');
        return;
    }

    if (mode === 'SignUp') socket.emit('user-register', name, pass)
    else socket.emit('user-login', name, pass)
}

function endSession(sessionId) {
    socket.emit('end-session', sessionId)
}

function isValid(msg = '') {
    for (let char of msg.split('')) {
        if (char !== ' ') return true
    }
    return false;
}

function isName(name) {
    if (name.length > 15 || name.length < 3) return false;
    if (!/^[a-zA-Z0-9]+$/.test(name)) return false;
    return name;
}

function isPass(pass) {
    if (pass.length > 15 || pass.length < 6) return false;
    if (!/^(?=.*[0-9])(?=.*[!_@#$%^&*])[a-zA-Z0-9!_@#$%^&*]{6,16}$/.test(pass)) return false;
    return pass;
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

function tooltip(text = '', time = 2000) {
    const tooltip = document.querySelector('#tool-tip');
    tooltip.innerHTML = text;
    tooltip.style['display'] = 'block';
    let timeout = setTimeout(() => {
        tooltip.style['display'] = 'none';
        tooltip.innerHTML = ''
    }, time)
    tooltip.addEventListener('click', () => {
        tooltip.style['display'] = 'none';
        tooltip.innerHTML = ''
        clearTimeout(timeout)
    })
}


function isMobile() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/windows phone/i.test(userAgent)) {
        return true;
    }

    if (/android/i.test(userAgent)) {
        return true;
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return true;
    }

    return false;
}
