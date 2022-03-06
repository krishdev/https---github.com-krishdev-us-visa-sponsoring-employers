var express = require('express');
var router = express.Router();
var dataImportCtrl = require('../controller/data-import');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/start-import/', dataImportCtrl.initializeImport);

module.exports = router;
