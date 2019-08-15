console.log("%c/* Powered by Shimmer Network Studio */","color:green");
console.log("%c/* by @Tangtsz&Ruan Ver.20198 */","color:green");
console.log("%c( ´ ▽ ` )ﾉ 小小世界中的又一个Web组织，微光网络工作室，期待和你相遇！\n了解更多 -> http://shimmer.neusoft.edu.cn/","color:blue");
(function(window){
  var wechatGetway = {
    login:function(redirect_uri)
    {
      var uri = redirect_uri&&typeof redirect_uri === 'string'?redirect_uri:location.href;
      $.get('http://shimmer.neusoft.edu.cn/wechat/web/page/login?redirect_uri='+uri);
    }
  }
  window.wechatGetway = wechatGetway;
})(window)
