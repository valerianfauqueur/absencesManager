var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account_model');

var path = require('path');

//AUTHENTIFICATION

// Get data from post check them and create new user
router.post('/register', function(req, res, next) {
    var data = req.body;

    var newAccount = new Account({
            username: data.username,
            admin: data.type == "admin" ? true : false,
            promotion: data.promotion == "" ? "" : data.promotion,
            group: data.group,
            state: []
    });


    Account.register(newAccount, data.password, function(err, account) {
    if (err) {
      return res.status(500).json({
        err: err
      });
    }
    passport.authenticate('local')(req, res, function () {
      return res.status(200).json({
        status: 'Registration successful!'
      });
    });
  });
});

//return the status of the user
router.get('/status', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(200).json({
      status: false
    });
  }
  res.status(200).json({
    status: true
  });
});


router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
      res.status(200).json({
        status: 'Login successful!'
      });
    });
  })(req, res, next);
});

router.get('/logout', function(req, res) {
  req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
});
router.get('/admin', function(req, res) {
    if(req.isAuthenticated())
    {
        Account.find({ username:req.session.passport.user }, function(err,result){
            if(err)
            {
                res.status(401).json({
                    err: err
                })
            }
            else if(result[0].admin === true)
            {
                res.status(200).json({
                    status: true
                })
            }
            else if(result[0].admin === false)
            {
                res.status(200).json({
                    status: false
                })
            }
        });
    }
    else
    {
        res.redirect("/");
    }
});


// END AUTHENTIFICATION

router.get("/", function(req, res){
  res.sendFile("index.html", {root: "./views"});
});

router.get("/partials/:name", function (req, res) {
  var name = req.params.name;
  res.sendFile('partials/' + name, {root: "./views"});
});

module.exports = router;
