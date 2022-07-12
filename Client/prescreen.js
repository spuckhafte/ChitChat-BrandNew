const Start = tpci('main:#pre-screen:login-window:start', true);
const setMode = Start.$state('mode', 'Login');
Start.make('re');

const Heading = tpci('h1:#start:log-or-sign:heading', true);
Start.init.pseudoChildren = [Heading];
Start.render('re');
Heading.prop = {
    text: '$$-mode'
}
Heading.make('re');


const Login = tpci('form:#start:login-mode:login', true);
Login.events = {
    submit: e => {
        e.preventDefault();
    }
}
Login.make('re')

const [LoginName, setLoginNameInp] = createInput('login-name', '#login', 'loginNameInp', 'username');
LoginName.make('re')

const [LoginPass, setLoginPassInp] = createInput('login-pass', '#login', 'loginPassInp', 'password');
LoginPass.make('re')

createBtn('login-btn', '#login')


function createInput(className = '', parent = '', stateName = '', placeholder = '') {
    const Inp = tpci(`input:${parent}:${className},in-input:?`, true);
    const setInp = Inp.$state(stateName, '');
    Inp.attr = {
        required: true, autofocus: true,
        placeholder: placeholder, maxlength: '15'
    }
    Inp.prop = {
        value: `$-${stateName}`
    }
    Inp.events = {
        input: e => setInp(e.target.value)
    };
    return [Inp.render('re'), setInp]
}

function createBtn(className, parent) {
    const Btn = tpci(`input:${parent}:${className},in-btn:?`, true);
    Btn.attr = {
        type: 'submit'
    };
    Btn.prop = {
        text: 'Login'
    }
    Btn.make('re')
}