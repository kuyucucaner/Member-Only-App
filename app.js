var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const dbConfig = require('./dbConfig');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const flash = require('express-flash'); // express-flash modülü eklenmiş
const mssql = require('mssql');
const methodOverride = require('method-override');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({ secret: 'turtles', resave: false, saveUninitialized: false }));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // express-flash modülü kullanılarak eklenmiş

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
},
async function(email, password, done) {
  try {
    const pool = await mssql.connect(dbConfig);
    const request = pool.request();
    const result = await request
      .input('email', mssql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email');
      console.log('Database Result:', result);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      const dbPassword = result.recordset[0].Password;
console.log('Database Password from Result:', dbPassword);

      console.log('User Object:', user);
      console.log('User Input Password:', password);
      console.log('Database Password:', user.Password);

   if (user.Password && bcrypt.compareSync(password, user.Password)) {
  console.log('Password Matched!');
  return done(null, user);
} else {
  console.log('Password Mismatch!');
  console.log('user.password:', user.Password);
  console.log('bcrypt.compareSync(password, user.password):', bcrypt.compareSync(password, user.Password));
  return done(null, false, { message: 'Invalid email or password' });
}

    } else {
      console.log('User not found!');
      return done(null, false, { message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Error during authentication:', err);
    return done(err);
  }
}));

passport.serializeUser(function(user, done) {
  done(null, user.ID);
});
passport.deserializeUser(async function(id, done) {
  try {
    // Id'ye dayalı olarak veritabanından kullanıcı bilgilerini al
    const pool = await mssql.connect(dbConfig);
    const result = await pool.request()
      .input('id', mssql.Int, id)
      .query('SELECT * FROM Users WHERE ID = @id');

    if (result.recordset.length > 0) {
      // Kullanıcı bulundu
      return done(null, result.recordset[0]);
    } else {
      // Kullanıcı bulunamadı
      return done(null, false);
    }
  } catch (err) {
    // Hata durumunda
    return done(err);
  }
});





// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
