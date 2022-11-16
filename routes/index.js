const router = require("express").Router();
const bcryptjs = require('bcryptjs')
const User = require('../models/User.model')
const { isLoggedIn, isAnon } = require('../middlewares/auth.middlewares')


/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get('/signup', (req, res, next) => {
  res.render('signup.hbs')
})

router.post('/signup', (req, res, next) => {
  console.log(req.body)
  if(!req.body.username || !req.body.password){
    res.send('Sorry! you forgot to add an username or password')
    return
  }

  User.findOne({ username: req.body.username })
  .then(foundUser => {
    if(foundUser){
      res.send('Sorry! Username already exist')
      return
    }

      return User.create({
        username: req.body.username,
        password: bcryptjs.hashSync(req.body.password)
      })
  })
    .then(createdUser => {
      console.log('here is the new user', createdUser)
      res.send(createdUser)
    })

    .catch(err => {
      console.log('err');
      res.send(err)
    })

})

  router.get('/login', (req, res ,next) => {
    res.render('login.hbs');
  })

  router.post('/login', (req, res, next) => {
      const { username, password } = req.body

      if(!username|| !password){
        res.render('login.hbs', { errorMessage: 'Sorry you forgot username or password' });
        return;
    }

    User.findOne({ username })
    .then(foundUser => {

      if(!foundUser){
        res.render('login.hbs', { errorMessage: 'The User does not exist' })
        return
      }

      const validPassword = bcryptjs.compareSync(password, foundUser.password)

      if(!validPassword){
        res.render('login.hbs', { errorMessage: 'Incorrect password' })
        return
      }

      req.session.user = foundUser
      res.render('profile.hbs', foundUser)




    })


    .catch(err => {
      console.log(err)
      res.send(err)
    })
      
  })

  router.get('/profile', isLoggedIn, (req, res, next) => {
    res.render('profile.hbs', req.session.user)
  })

  router.get('/main', isAnon, (req, res, next) => {
    res.render('main.hbs')
  })

  router.get('/private', isLoggedIn, (req, res, next) => {
    res.render('private.hbs')
  })

module.exports = router;
