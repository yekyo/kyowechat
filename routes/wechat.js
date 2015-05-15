var express = require('express');
var router = express.Router();
var https = require('https');
var crypto = require('crypto');
var wechat = require('wechat');
var async = require('async');
var querystring = require('querystring');

var config = {
    token: 'kyoye',
    //appid: 'wx1932a9e3e33da326',
    appid: 'wxe5b14551ab25a20f',
    //appsecret: '6950e96804bf47b6b99bff92e8ec31bf',
    appsecret: 'a6c049eb6abc112f0e09b173384eacd7',
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

function getAccessToken(session, callback){
    var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + config.appid +'&secret='+ config.appsecret;
    var backtoken = '';
    https.get(url, function(res){
        res.on('data', function(chunk){
            backtoken += chunk;
        });
        res.on('end', function(){
            var token = JSON.parse(backtoken);
            session.accesstoken = token;
            callback(null);
        });
    }).on('error', function(e){
        console.error(e);
    });
    /*async.waterfall([
        function(callback){
            https.get(url, function(res){
                res.on('data', function(chunk){
                    backtoken += chunk;
                });
                res.on('end', function(){
                   var token = JSON.parse(backtoken);
                    callback(null, token.access_token);
                });
            }).on('error', function(e){
                console.error(e);
            });
        },
        function(token, callback){
            session.accesstoken = token;
            callback(null)
        }
    ], function(err, result){
        if(err){
            console.error(err);
        }
        callback(null);
    });*/
}

function getbacktoken(url, callback){
    var reply = '';
    https.get(url, function(res){
        res.on('data', function(chunk){
            reply += chunk;
        });
        res.on('end', function(){
            var autoreply = JSON.parse(reply);
            callback(null, autoreply);
        });
    }).on('error', function(e){
        console.error(e);
    });
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
    getAccessToken(req.session, function(){
        console.log(req.session.accesstoken);
    });
});

router.get('/autoreply', function(req, res, next){
    var url = "https://api.weixin.qq.com/cgi-bin/get_current_autoreply_info?access_token=";
    async.waterfall([
        function(callback){
            //console.log('first');
            getAccessToken(req.session, function(){
                //console.log(req.session.accesstoken.access_token);
                callback(null, url + req.session.accesstoken.access_token);
            });
        },
        function(url, callback){
            //console.log('second');
            //console.log(url);
            getbacktoken(url, function(err, autoreply){
                if(err){
                    console.error(err);
                }
                console.log(autoreply);
                res.render('wechat_autoreply',{
                    title: "微信自动回复规则",
                    addfriend: autoreply.is_add_friend_reply_open,
                    //addfriend_info_type: autoreply.add_friend_autoreply_info.type,
                    //addfriend_info_content: autoreply.add_friend_autoreply_info.content,
                    autoreply: autoreply.is_autoreply_open,
                    successMsg: req.flash('successMsg'),
                    errorMsg: req.flash('errorMsg')
                });
            });
        }
    ], function(err, result){
        if(err){
            console.error(err);
        }
    });
});

router.post('/autoreply', function(req, res, next){
    console.log('start auto');
    /*var url = "https://api.weixin.qq.com/cgi-bin/get_current_autoreply_info?access_token=";
    async.waterfall([
        function(callback){
            getAccessToken(req.session, function(){
                callback(null, url + req.session.accesstoken.access_token);
            });
        },
        function(url, callback){
            https
        }
    ], function(err, result){
        if(err){
            console.error(err);
        }
    });*/
});

router.get('/custmenu', function(req, res, next){
    console.log('start customer menu');
    var url = 'https://api.weixin.qq.com/cgi-bin/get_current_selfmenu_info?access_token=';
    async.waterfall([
        function(callback){
            getAccessToken(req.session, function(){
                callback(null, url + req.session.accesstoken.access_token);
            });
        },
        function(url, callback){
            getbacktoken(url, function(err, menuinfo){
                if(err){
                    console.error(err);
                }
                console.log(menuinfo.is_menu_open);
                res.render('wechat_menu', {
                    title: '微信自定义菜单',
                    menuopen: menuinfo.is_menu_open,
                    successMsg: req.flash('successMsg'),
                    errorMsg: req.flash('errorMsg')
                });
            });
        }
    ]);
});

//创建自定义菜单
router.get('/createmenu', function(req, res, next){
    res.render('wechat_createmenu',{
        title: '创建微信菜单',
        successMsg: req.flash('successMsg'),
        errorMsg: req.flash('errorMsg')
    });
});

router.post('/createmenu', function(req, res, next){
    console.log('start ceate menu');
    var back = req.body;
    console.log(back);

   var url = 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=';
    var post_data = JSON.stringify({
        "button":[
            {
                "type": back.onetype,
                "name": back.onename,
                //"key":"V1001_TODAY_MUSIC"
                "url": back.oneurl
            },
            {
                "type": back.twotype,
                "name": back.twoname,
                "url": back.twourl
            },
            {
                "type": back.threetype,
                "name": back.threename,
                "url": back.threeurl
            }]
    });
    console.log(post_data);
    async.waterfall([
        function(callback){
            getAccessToken(req.session, function(){
                callback(null, req.session.accesstoken.access_token);
            });
        },
        function(token, callback){
            var post_options = {
                hostname: 'api.weixin.qq.com',
                port: 443,
                path: '/cgi-bin/menu/create?access_token=' + token,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Lenght': post_data.length
                }
            };

            var post_req = https.request(post_options, function(res){
                res.setEncoding('utf8');
                res.on('data', function(chunk){
                    console.log('Response: ' + chunk);
                });
            });
            //post the data
            post_req.write(post_data);
            post_req.end();

        }
    ]);
});

//查询自定义菜单
router.get('/getmenu', function(req, res, next){
    var url = "https://api.weixin.qq.com/cgi-bin/menu/get?access_token=";

    getAccessToken(req.session, function(){
        var token = req.session.accesstoken.access_token;
        //console.log(url + token);
        getbacktoken(url + token, function(err, menurule){
            //console.log(menurule);
            //console.log(menurule['menu']);
            //console.log(menurule['menu']['button'].length);
            if('errcode' in menurule){
                console.log(menurule);
                return res.end(menurule.errmsg);
            }

            var button = menurule['menu']['button'];
            //console.log(typeof button);
            //console.log(button instanceof  Array);
            //console.log(button.length);
            //var menu = JSON.parse(menurule);
            res.render('wechat_viewmenu',{
                title: '自定义菜单',
                button: button,
                successMsg: req.flash('successMsg'),
                errorMsg: req.flash('errorMsg')
            });
        });
    });
});

//删除自定义菜单
router.get('/rmmenu', function(req, res, next){
    var url = 'https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=';

    getAccessToken(req.session, function(){
        var token = req.session.accesstoken.access_token;
        var msg = '';

        https.get(url + token, function(res){
            //console.log(url + token);
            res.on('data', function(chunk){
                msg += chunk;
            });
            res.on('end', function(){
                console.log(msg);
            });
        });
    });
});

//语义理解
router.get('/semantic', function(req, res, next){
    var url = "https://api.weixin.qq.com/semantic/semproxy/search?access_token=";
    var ares = res;
    var post_data = JSON.stringify(
        {
            "query":"查一下明天从北京到上海的南航机票",
            "city":"北京",
            "category": "flight,hotel",
            "appid":"wxaaaaaaaaaaaaaaaa",
            "uid":"123456"
        }
    );

    getAccessToken(req.session, function(){
        var token = req.session.accesstoken.access_token;
        var post_options = {
            hostname: 'api.weixin.qq.com',
            port: 443,
            path: '/semantic/semproxy/search?access_token=' + token,
            method: 'POST'
        };
        var msg = '';

        var post_req = https.request(post_options, function(res){
            res.on('data', function(chunk){
                msg += chunk;
            });
            res.on('end', function(){
                console.log(msg);
                ares.end(msg);
            });
        });

        post_req.write(post_data);
        post_req.end();
    });
});

module.exports = router;