const Start = tpci('main:#pre-screen:login-window:start', true);
const setMode = Start.$state('mode', 'Login');
Start.make('re');

const togglePhrases = {
    'Login': 'Not Registered?',
    'SignUp': 'Already Registered?'
}

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
        const name = LoginName.getState('loginNameInp');
        const password = LoginPass.getState('loginPassInp');
        getIn(name, password, Start.getState('mode'));
    }
}
Login.make('re')

const [LoginName, setLoginNameInp] = createInput('login-name', '#login', 'loginNameInp', 'username');
if (fromLs(PRE + 'username')) setLoginNameInp(fromLs(PRE + 'username'));
LoginName.make('re')

const [LoginPass, setLoginPassInp] = createInput('login-pass', '#login', 'loginPassInp', 'password');
LoginPass.make('re')

createBtn('login-btn', '#login')

const ToggleMode = createBtn('toggle-mode', '#start', false, true);
Start.init.pseudoChildren = [...Start.init.pseudoChildren, ToggleMode];
Start.render('re')
ToggleMode.$effect(() => {
    ToggleMode.prop = {
        text: togglePhrases[ToggleMode.getPseudoState('mode')]
    }
    ToggleMode.render('re')
}, ['$$-mode']);
ToggleMode.events = {
    click: () => {
        setMode(prevMode => prevMode === 'Login' ? 'SignUp' : 'Login');
    }
};
ToggleMode.make('re');

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

function createBtn(className, parent, make = true, btn = false) {
    const Btn = tpci(`${btn ? 'btn' : 'input'}:${parent}:${className},in-btn:?`, true);
    Btn.attr = {
        type: 'submit'
    };
    Btn.prop = {
        text: 'Login'
    }
    make ? Btn.make('re') : Btn.render('re')
    return Btn;
}