var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('req-flash');
var mongoose = require('mongoose');

var connection = mongoose.createConnection('mongodb://kyo:kyo@localhost/kyowechat');
//mongoose.connect('mongodb://kyo:kyo@localhost/kyowechat');

var routes = require('./routes/index');
var users = require('./routes/users');
var wechat = require('./routes/wechat');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('env','development');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
/*app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'kyoye',
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}
}));*/
//app.use(session({ secret: 'kyoye'}));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'kyoye',
    store: new MongoStore({ mongooseConnection: connection })
    //store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(flash({ locals: 'flash'}));
//app.use(express.static(path.join(__dirname, 'public')));
app.use('/public',express.static(__dirname + '/public'));

app.use('/', routes);
app.use('/users', users);
app.use('/wechat', wechat);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(express.query());

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
