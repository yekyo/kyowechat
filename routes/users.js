var express = require('express');
var router = express.Router();
var User = require('../models/user.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
    console.log(req.session);
    console.log(req.session.user);
    User.getAll(function(err,doc){
        if(err){
            throw err;
        }
        res.render('userlist',{
            users: doc
        });
    });
});

router.get('/delete/:id', function(req, res, next){
    var id = req.params.id;
    User.remove(id, function(err, doc){
        if(err){
            throw err;
        }
        res.end("Delete success!");
    });
});

/*router.get('/edit/:id', function(req, res, next){
    var id = req.params.id;
    User.getOne(id, function(err,doc){
       if(err) {
           throw err;
       }
        res.render('userform',{
            title: "Edit User",
            user: doc
        });
    });
});*/

router.route('/edit/:id')
    .get(function(req, res, next){
        var id = req.params.id;
        User.getOne(id, function(err, doc){
           if(err){
               throw err;
           }
            res.render('userform',{
               title: "Edit User",
                user: doc
            });
        });
    })
    .post(function(req, res, next){
        var username = req.body.username;
        var password = req.body.password;
        var id = req.body.id;
        User.resave(id, username, password, function(err){
            if(err){
                throw err;
            }
            res.end("Update Success!");
        });
    })

router.route('/login')
    .get(function(req, res, next){
        console.log(req.session.user);
        res.render('login');
    })
    .post(function(req, res, next){
        var name = req.body.username;
        var password = req.body.password;
        User.get(name, function(err, doc){
            if(err){
                throw err;
            }
            if(password == doc.password){
                req.session.user = doc;
                console.log(req.session.user);
                res.end("Login Success");
            }else{
                res.end("UserName or Password ERROR!");
            }
      });
    })

router.route('/reg')
    .get(function(req, res, next){
        if(!req.session.user){
            console.log(req.session);
            res.render('register');
        }else{
            res.end("You Logged!");
        }
      //res.render('register');
    })
    .post(function(req, res, next){
      var user = {
        username: req.body.username,
        password: req.body.password,
        date: new Date()
      };
      newuser = new User(user);
      newuser.save(function(err, doc){
        if(err){
          throw err;
        }
        res.end("Register Successfully!");
      });
    })


function checkLogin(req, res, next){
    if(!req.session.user){
        res.redirect('/users/login');
    }
    next();
}

function checkNotLogin(req, res, next){
    if(req.session.user){
        res.redirect('back');
    }
    next();
}

module.exports = router;