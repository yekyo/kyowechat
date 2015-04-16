var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express',
    successMsg: req.flash('successMsg'),
    errorMsg: req.flash('errorMsg')
  });
});

router.get('/test', function(req, res, next){
  res.render('test',{
    successMsg: req.flash('successMsg'),
    errorMsg: req.flash('errorMsg')
  });
});
module.exports = router;
