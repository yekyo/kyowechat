var mongoose = require('./db');
var crypto = require('crypto');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
    username: String,
    password: String,
    date: Date
},{
    collection: 'user'
});

var UserModel = mongoose.model('User',UserSchema);

function User(user){
    this.username = user.username;
    this.password = user.password;
    this.date = user.date;
};

User.prototype.save = function(callback){
    var user = {
        username: this.username,
        password: this.password,
        date: this.date
    };
    var newUser = new UserModel(user);

    newUser.save(function(err,doc){
        if(err){
            throw err;
        }
        callback(null, doc);
    })
};

User.get = function(name, callback){
    var username = {
        username: name
    };
    UserModel.findOne(username, function(err, doc){
        if(err){
            callback(err);
        }
        callback(null, doc);
    });
};

User.getAll = function (callback) {
    UserModel.find({},function(err, doc){
        if(err) {
            callback(err);
        }
        //console.log(doc);
        callback(null, doc);
    });
};

User.getOne = function(id, callback){
    var userid = {
        _id: mongoose.Types.ObjectId(id)
    };
    UserModel.findOne(userid, function(err, doc){
       if(err) {
           //throw err;
           callback(err);
       }
        //console.log(doc);
        callback(null, doc);
    });
};

User.resave = function(id,username,password,callback){
    var user = {
        username: username,
        password: password
    };
    var id = {
        _id: mongoose.Types.ObjectId(id)
    };
    UserModel.update(id,user, function(err){
        if(err){
            callback(err);
        }
        callback(null);
    });
};

User.remove = function(id, callback){
    var userid = {
        _id: mongoose.Types.ObjectId(id)
    };
    console.log(userid);
    UserModel.findOne(userid).remove(function(err, doc){
        if(err){
            console.log(err.toString());
        }
        callback(null, doc);
    });
};

module.exports = User;
