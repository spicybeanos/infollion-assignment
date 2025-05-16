var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('log in page');
});

router.post('/',function(req,res,next) {
    console.log(req.body)
    res.send("ok")
});

module.exports = router;
