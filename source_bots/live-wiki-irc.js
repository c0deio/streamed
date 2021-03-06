var irc = require('irc');

var server = "irc.robscanlon.com",
    nick = "wiki-bot",
    channel = "#wikipedia";

var separator_color = "gray",
    separator = "*";

var colors = [
    "orange",
    "light_magenta",
    "dark_blue",
    "gray",
    "yellow",
    "light_red",
    "light_magenta",
    "light_cyan"
    ];


var ircclient = new irc.Client(server, nick, {debug: false, showErrors: true, floodProtection: false, floodProtectionDelay: 0, channels: ["#wikipedia"]});
var ircwiki = new irc.Client("irc.wikimedia.org", "arscan", {channels: ["#en.wikipedia"]});

ircclient.addListener('error', function(message) {
         console.log('irc error: ' +  message);
 });
ircwiki.addListener('error', function(message) {
         console.log('irc error: ' +  message);
 });

var w = function(c,t){
    return irc.colors.wrap(c,t);
}

var shortentype = function(t){
    if(t == "PullRequestEvent"){
        return "PR";
    } else {
        return t.substring(0,1);

    }

}
var formatArray = function(arr){
    var i = 0;
    var ret = "";
    for(var j = 0; j< arr.length; j++){
        if(i > colors.length)
            i = 0;

        if(j>0)
            ret += w(separator_color, " " + separator + " ");

        ret += w(colors[i],arr[j]);
        i++;
    }

    return ret;
}

var stripColors = function(text){

    var ret = text.replace(/\u0003\d{1,2}/g,'');
    ret = ret.replace(/\u0003/g,'');

    return ret;

}

/* create a message */

var createMessage = function(m){
    var ret = "";
    var values = [];

    m = stripColors(m);

    var rePattern = new RegExp(/\[\[([^\]]*)\]\]/);
    var ret = rePattern.exec(m);

    if(ret.length > 0){
        values.push(ret[1]);
    } else {
        values.push('-');
    }

    var rePattern = new RegExp(/\[\[[^\]]*\]\]([^h]*)/);
    ret = rePattern.exec(m);

    if(ret && ret.length > 0 && ret[1].replace(/^\s\s*/, '').replace(/\s\s*$/, '').length > 0 && ret[1].length < 5){
        values.push(ret[1].replace(/^\s\s*/, '').replace(/\s\s*$/, ''));
    } else {
        values.push('-');
    }

    rePattern = new RegExp(/(http\:\/\/[^\*]*)/);
    ret = rePattern.exec(m);

    if(ret && ret.length > 0){
        values.push(ret[1]);
    } else {
        values.push('-');
    }

    rePattern = new RegExp(/http\:\/\/[^\s]*\s?\*\s?([^\*]*)*/);
    ret = rePattern.exec(m);
    if(ret && ret.length > 0){
        values.push(ret[1].replace(/\s\s*$/, ''));
    } else {
        values.push('-');
    }

    rePattern = new RegExp(/\(([(\+\-]\d+)\)/);
    ret = rePattern.exec(m);
    if(ret && ret.length > 0){
        values.push(ret[1]);
    } else {
        values.push('-');
    }

    return formatArray(values);
    
}

ircwiki.addListener('message', function (from, to, message) {
    var m = createMessage(message);
    console.log(m);
    ircclient.say(channel,  m);
});

