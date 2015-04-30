var express = require('express');
var router = express.Router();
var https = require('https');
var crypto = require('crypto');
var wechat = require('wechat');

var config = {
    token: 'kyoye',
    appid: 'wx1932a9e3e33da326',
    appsecret: '6950e96804bf47b6b99bff92e8ec31bf',
    encodingAESKey: 'P3b3zgMLtPvmd1q1n4vQwCrjogKC8sDxudnlzOniypT'
};

var checkSignature = function(query,token){
    var signature = query.signature;
    var timestamp = query.timestamp;
    var nonce = query.nonce;
    var arr = [token, timestamp, nonce].sort();
    var shasum = crypto.createHash('sha1');
    shasum.update(arr.join(''));
    return shasum.digest('hex') !== signature;
};

function AccessToken(callback){
    var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + config.appid +'&secret='+ config.appsecret;
    var backtoken = '';
    https.get(url, function(res){
        res.on('data', function(chunk){
           backtoken += chunk
        });
        res.on('end', function(){
            var token = JSON.parse(backtoken);
            callback(token.access_token);
        });
    }).on('error', function(e){
        console.error(e);
    });
}

function getAccessToken(session,callback){
    if(!session.accesstoken){;
        AccessToken(function(accesstoken){
            session.accesstoken = accesstoken;
            callback(null, accesstoken);
        });
    }else{
        callback(null, session.accesstoken);
    }
}

router.get('/', function(req, res, next){
    if(checkSignature(req.query, config.token)){
        return;
    }
    //console.log(req.query.echostr);
    res.end(req.query.echostr);
});

router.post('/', wechat(config, function(req, res, next){
    if(checkSignature(req.query, config.token)){
        return;
    }
    var message = req.weixin;
    if(message.FromUserName === 'og_KduKwHsY-En43agHiLRBYsacY'){
        res.reply('你好呀~wonder！！！');
    }else{
        res.reply('你瞅啥？');
    }
}));

router.get('/refresh', function(req, res, next){
    req.session.accesstoken = null;
    getAccessToken(req.session, function(err, doc){
        if(err){
            console.error(err);
        }
        res.end(doc);
    });
});
module.exports = router;
