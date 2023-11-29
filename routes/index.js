  var express = require('express');
  var router = express.Router();
  const usersController = require('../controllers/usersController');
const passport = require('passport');
const messagesController = require('../controllers/messagesController');

  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.render('index', { title: 'BrotherHood', user: req.user });
  });
  
  router.get('/signupform', (req, res) => {
    res.render('signupform', { title: 'Signinup Page' });
  });
  router.post('/signupform', usersController.usersController.postCreateUserController);
  
  router.get('/joinclub', (req, res) => {
    res.render('joinclub', { title: 'Join Club Page' });
  });
  router.post('/joinclub',  usersController.usersController.joinClub);
  
  router.get('/login', (req, res) => {
    const errorMessage = req.flash('error')[0];
    res.render('login', { title: 'Log in' , errorMessage });
  });
  router.post('/login', 
  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' ,failureFlash: true })
);
router.get('/message', (req, res) => {
  messagesController.getAllMessagesController(req, res);
});

router.post('/message',  messagesController.postCreateMessageController);

router.delete('/message/:id', messagesController.deleteMessageController);

  module.exports = router;
