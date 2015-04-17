var express = require('express');
var router = express.Router();
var User = require('../models/user.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
    if(!req.session.user){
        req.flash('errorMsg',"Please login first!");
        return res.redirect('/users/login')
    }
    User.getAll(function(err,doc){
        if(err){
            throw err;
        }
        res.render('userlist',{
            users: doc,
            successMsg: req.flash('successMsg'),
            errorMsg: req.flash('errorMsg')
        });
    });
});

router.get('/delete/:id', function(req, res, next){
    if(!req.session.user){
        req.flash('errorMsg','Please login first!');
        res.redirect('/users/login');
    }
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
        if(!req.session.user){
            req.flash('errorMsg','You must login first!');
            return res.redirect('/users/login');
        }
        var id = req.params.id;
        User.getOne(id, function(err, doc){
           if(err){
               throw err;
           }
            res.render('userform',{
               title: "Edit User",
                user: doc,
                successMsg: req.flash('successMsg'),
                errorMsg: req.flash('errorMsg')
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
        if(req.session.user){
            req.flash('errorMsg','You are logged!');
            return res.redirect('back');
        }
        res.render('login',{
            successMsg: req.flash('successMsg'),
            errorMsg: req.flash('errorMsg')
        });
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
               // res.end("Login Success");
               req.flash('successMsg',"Login SuccessFully!");
                res.redirect('/users');
            }else{
                req.flash('errorMsg','Username or Password ERROR');
                res.redirect('back');
                //res.end("UserName or Password ERROR!");
            }
      });
    })

router.get('/logout', function(req, res, next){
    if(!req.session.user){
        req.flash('errorMsg','You not login!');
        return res.redirect('/users/login');
    }
    req.session.user = null;
    //console.log(req.session.user);
    res.end("Logout Success");
});

router.route('/reg')
    .get(function(req, res, next){
        if(req.session.user){
            req.flash('errorMsg','You are logged!');
            return res.redirect('/users');
        }
        res.render('register',{
            successMsg: req.flash('successMsg'),
            errorMsg: req.flash('errorMsg')
        });
    })
    .post(function(req, res, next){
        var user = {
            username: req.body.username,
            password: req.body.password,
            date: new Date()
        };
        //console.log(user.username);
        //check Username isexist
        User.get(user.username, function(err, doc){
            //console.log(err);
            if(!doc){
                newuser = new User(user);
                newuser.save(function(err, doc){
                    if(err){
                        throw err
                    }
                    req.session.user = doc;
                    req.flash('successMsg', 'Register Successfully!');
                    res.redirect('/users');
                });
            }else{
                req.flash('errorMsg', 'Username is used!');
                res.redirect('back');
            }
        });

        /*newuser = new User(user);
        newuser.save(function(err, doc){
            if(err){
                throw err;
            }
            //console.log(doc);
            req.session.user = doc;
            req.flash('successMsg','Register Successfully!');
            res.redirect('/users');
            //res.redirect('back');
            // res.end("Register Successfully!");
      });*/
    })

/*function checkLogin(){
    if(!req.session.user){
        res.redirect('/users/login')
    }
    next();
}*/

module.exports = router;