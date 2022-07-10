const Root = tpci('main:#app:main-app:root').make();
const Lobby = tpci('div:#root:msg-area:lobby').make();

const Online = tpci('button:#root:show-online-btn:online', true);
const setToggle = Online.$state('toggle', false);

Online.$effect(() => {
  Online.prop = {
    text: Online.getState('toggle') ? '↑' : '↓'
  }
  Online.render('re')
}, ['$-toggle'])

Online.events = { click: () => setToggle(p => !p) }
Online.make('re');


const Chart = tpci('div:#root:show-online-chart:chart', true);

Online.init.pseudoChildren = [Chart];
Online.render('re');

const setOnline = Chart.$state('online', ['You']);
Chart.$effect(() => {
  Chart.prop = {
    css: {
      display: Chart.getPseudoState('toggle') ? 'block' : 'none'
    }
  };
  Chart.render('re');
}, ['$$-toggle'])
Chart.make('re')

const Send = tpci('form:#root:send-msg:send', true);
Send.events = {
  submit: e => {
    e.preventDefault()
    let message = Input.getState('input')
    console.log(message)
  }
}
Send.make('re')

const Input = tpci('input:#send:msg-input:input', true);

const setInput = Input.$state('input', '')
Input.prop = {
  value: '$-input'
}
Input.events = {
  input: e => setInput(e.target.value)
}
Input.attr = {
  placeholder: 'Message',
  autofocus: true,
  autocomplete: 'off'
}
Input.make('re')


const Btn = tpci('input:#send:send-btn:btn', true);
Btn.attr = {
  type: 'submit'
};
Btn.prop = { text: 'Send' };
Btn.make('re');


function createMsg(text = '', author = '', _self = true, date = '') {
  const Show = tpci(`div:#lobby:msg-show${_self ? ',self-msg' : ''}:show`, true);
  Show.prop = { text };
  Show.attr = { title: date ? date : dateBuilder() }
  Show.make('re');

  const Author = tpci(`div:#lobby:author-show${_self ? ',self-msg' : ''}:author`, true);
  Author.prop = {
    text: _self ? 'You' : author
  }
  Author.make()

  return {
    msg: text, author, date: date ? date : dateBuilder()
  }
}

function createJoinMsg(user = '') {
  const Join = tpci(`div:#lobby:author-joined:join`, true);
  Join.prop = {
    text: user + ' joined'
  }
  Join.make();
}

createJoinMsg('rakshit')

// console.log(createMsg('hello world this is rakshit', 'rakshit'))
// createMsg('hello this is me', 'rakshit')
// createMsg('hello this is the best thing in the world', 'rakshit')
// createMsg('hello', 'rakshit')
// createMsg('hello o yeah oeah yeam Iam killing this shit', 'rakshit', false)
// createMsg('hello boby villanois', 'rakshit', false)
// createMsg('hello', 'rakshit', false)
// createMsg('hello this is the best lib ever', 'rakshit', false)
// createMsg('hello socket.io', 'rakshit')
// createMsg('hello bun', 'rakshit')


function tpci(initString = '', render = false) {
  let [type, parent, className, id] = initString.split(':');
  let classNameArr = [];
  if (className !== '?') {
    for (let _class of className.split(',')) {
      classNameArr.push(_class);
    };
  };

  const El = new Spuck({
    type,
    parent,
    class: className === '?' ? '' : classNameArr.join(' '),
    id: id === '?' ? '' : id
  })
  if (render) El.render();
  return El;
};

function dateBuilder() {
  var currentdate = new Date();

  var datetime = + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ' '
    + currentdate.getDate() + "/" + (currentdate.getMonth() + 1)
    + "/" + currentdate.getFullYear()

  return datetime
}
