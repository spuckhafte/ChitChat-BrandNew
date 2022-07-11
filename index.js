const Root = tpci('main:#app:main-app:root').make();
const Lobby = tpci('div:#root:msg-area:lobby').make();

const Online = tpci('button:#root:show-online-btn:online', true);
const setToggle = Online.$state('toggle', true);

Online.$effect(() => {
  Online.prop = {
    text: Online.getState('toggle') ? '↑' : '↓'
  }
  Online.render('re')
}, ['$-toggle'])

Online.events = {
  click: () => setToggle(p => !p)
}
Online.make('re');


const Chart = tpci('div:#root:show-online-chart:chart', true);

Online.init.pseudoChildren = [Chart];
Online.render('re');

const setOnline = Chart.$state('online', JSON.stringify([]));
Chart.$effect(() => {
  Chart.prop = {
    css: {
      display: Chart.getPseudoState('toggle') ? 'block' : 'none'
    }
  };
  Chart.el.innerHTML = ''
  Chart.isMount() ? Chart.render('re') : Chart.make('re')

  // console.log(Chart.getPseudoState('toggle'))

  const OnlinePeople = tpci('div:#chart:online-user-in-chart:d');
  OnlinePeople.init.iterate = JSON.parse(Chart.getState('online'));
  OnlinePeople.$state(':user');
  OnlinePeople.prop = {
    text: '$$-:user'
  }
  OnlinePeople.renderFor();
}, ['$$-toggle', '$-online'])
Chart.make('re')

const Send = tpci('form:#root:send-msg:send', true);
Send.events = {
  submit: async e => {
    e.preventDefault()
    await sendMsg(Input.getState('input'))
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

  Lobby.el.scrollTop = Lobby.el.scrollHeight;

  return {
    msg: text, author, date: date ? date : dateBuilder()
  }
}

// setToggle(true)
function createJoinMsg(user = '', title = false) {
  const Join = tpci(`div:#lobby:author-joined:join`, true);
  Join.prop = {
    text: user + ' joined'
  }
  if (title)
    Join.attr = {
      title: user
    }
  Join.make();
}

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
