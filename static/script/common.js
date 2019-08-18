console.log("%c/* Powered by Shimmer Network Studio */", "color:green");
console.log("%c/* by @Tangtsz&Ruan Ver.20198 */", "color:green");
console.log("%c( ´ ▽ ` )ﾉ 小小世界中的又一个Web组织，微光网络工作室，期待和你相遇！\n了解更多 -> http://shimmer.neusoft.edu.cn/", "color:blue");
(function (window) {
  var wechatGetway = {
    login: function (redirect_uri) {
      var uri = redirect_uri && typeof redirect_uri === 'string' ? redirect_uri : location.href;
      $.get('http://shimmer.neusoft.edu.cn/wechat/web/page/login?redirect_uri=' + uri);
    }
  }
  function mix(a, b) {
    a = a || {};
    for (var key in b) {
      if (!a[key]) {
        a[key] = b[key];
      }
    }
    return a;
  }
  var StateMachine = function (option) {
    this.nowState = null;
    this.states = [];
    this.changeState = function (ns) {
      if (this.nowState) this.nowState.quit();
      this.nowState = ns;
      this.nowState.start();
    }
    this.emit = function (e, ...arg) {
      if (this.nowState[e] && typeof this.nowState[e] === 'function') {
        this.nowState[e](...arg);
      }
    }
    this.createState = function (name = 'newState', option) {
      var state = new State(name, mix(option, { context: this }));
      this.states.push(state);
      return state;
    }
    this.createDefaultState = function (name = 'newState', option) {
      var state = this.createState(name, option);
      this.changeState(state);
      return state;
    }
    if(option&&typeof option === 'object')
    {
      for(var item in option)
      {
        this[item] = option[item];
      }
    }
  }
  var State = function (name = 'newState', option) {
    this.name = name;
    if (option && typeof option === 'object') {
      for (var key in option) {
        this.on(key, option[key]);
      }
    }
  }
  State.prototype = {
    constructor: State,
    context: { changeState() { } },
    start() {

    },
    quit() {

    },
    on(event, cb) {
      if (event && typeof event === 'string') {
        this[event] = cb;
      }
    }
  }
  var EventBase = function(){
    this.events = [];
  }
  EventBase.prototype.emit = function(event,...args)
  {
    var e = this.events.find(function (v) { return v.en === event });
    if (e) {
        e.cb.forEach(function (v) {
            if (v && typeof v === 'function') v(...args);
        })
    }
  }
  EventBase.prototype.on = function(event, listener)
  {
    var cbs = [];
    if (this.events.length === 0) {
        this.events.push({ en: event, cb: cbs });
    }
    else {
        for (var i = 0; i < this.events.length; i++) {
            if (this.events[i].en === event) {
                cbs = this.events[i].cb;
                break;
            }
            if (i === this.events.length - 1) {
              this.events.push({ en: event, cb: cbs });
            }
        }
    }
    EventBase.prototype.off = function(event,listener)
    {
      let _event = this.events.find(v=>v.en === event)
      if(_event)
      {
        let idx = _event.cb.findIndex(v=>v===listener);
        if(idx>-1)
        {
          _event.cb.splice(idx,1);
        }
      }
    }
    cbs.push(listener);
  }

  window.wechatGetway = wechatGetway;
  window.StateMachine = StateMachine;
  window.State = State;
  window.EventBase = EventBase;
})(window)
