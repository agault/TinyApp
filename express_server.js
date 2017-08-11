const express = require("express");
const bodyParser = require("body-parser");
const cookieSession  = require('cookie-session');
const bcrypt = require('bcrypt');

const port = process.env.PORT || 8080;
const urlDatabase = {};
const users = {};
const app = express();
app.set("view engine", "ejs");

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  secret: 'thehobbitwasunderwhelming',
  maxAge: 24 * 60 * 60 * 1000
}));

//Short URL JUMBLED
function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 6; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
generateRandomString();

// check if logged-in user owns the shortURL
function logIn(db, user, shortURL) {
  let result = false;
  for (let key in db) {
    if (db[user.id][shortURL]) {
      result = true;
    }
  }
  return result;
}

// GET =root directory
app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// GET =index page
app.get("/urls", (req, res) => {
  const newUser = req.session.user;
  if (!newUser) {
    res.sendStatus(401);
    return;
  }
  let templateVars = {
    urls: urlDatabase[newUser.id],
    user: newUser
  };
  res.render("urls_index", templateVars);
});

// GET the new input page
app.get("/urls/new", (req, res) => {
  const newUser = req.session.user;
  if (!newUser) {
    res.redirect('/login');
    return;
  }
  let templateVars = {
    user: newUser
  };
  res.render("urls_new", templateVars);
});

// GET the redirection towards the actual site
app.get("/u/:shortURL", (req, res) => {
  for (let userID in users) {
    if (urlDatabase[userID][req.params.shortURL]) {
      const longURL = urlDatabase[userID][req.params.shortURL];
      res.redirect(longURL);
      return;
    }
  }
  res.sendStatus(404);
  return;
});

// GET shortened url
app.get("/urls/:id", (req, res) => {
  const newUser = req.session.user;
  if (!newUser) {
    res.sendStatus(404);
    return;
  }
  if (!urlDatabase[newUser.id][req.params.id]) {
    res.sendStatus(404);
    return;
  }
  if (!logIn(urlDatabase, newUser, req.params.id)) {
    res.sendStatus(401);
    return;
  }
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[newUser.id][req.params.id],
    user: newUser
  };
  res.render("urls_show", templateVars);
});

// POST the newly generated short url
app.post("/urls", (req, res) => {
  const newUser = req.session.user;
  console.log(newUser);
  if (!newUser) {
    res.sendStatus(401);
    return;
  }
  if (!req.body.longURL){
    res.sendStatus(400);
    return;
  }
  const randomText = generateRandomString();
  urlDatabase[newUser.id][randomText] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${randomText}`);
});

// POST the updated short url
app.post("/urls/:id", (req, res) => {
  const newUser = req.session.user;
  if (!req.body.longURL) {
    res.sendStatus(400);
  }
  if (!newUser) {
    res.sendStatus(401);
    return;
  }
  if (!logIn(urlDatabase, newUser, req.params.id)) {
    res.sendStatus(401);
    return;
  }
  urlDatabase[newUser.id][req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
});

// POST for value deletion
app.post("/urls/:id/delete", (req, res) => {
  const newUser = req.session.user;
  if (!newUser) {
    res.sendStatus(401);
    return;
  }
  delete(urlDatabase[newUser.id][req.params.id]);
  res.redirect('/urls');
});

// GET the login page
app.get("/login", (req, res) => {
  const newUser = req.session.user;
  if (newUser) {
    res.redirect('/urls');
  } else {
    res.render("urls_login", {user: newUser});
  }
});

// GET the register page
app.get("/register", (req, res) => {
  const newUser = req.session.user;
  if (newUser) {
    res.redirect('/urls');
  } else {
    res.render("urls_register", {user: newUser});
  }
});

// POST the user_id into cookie for logging in
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  for (let id in users) {
    if (email === users[id].email) {
      if (bcrypt.compareSync(password, users[id].password)) {
        req.session.user = users[id];
        res.redirect('/urls');
        return;
      }
    }
  }
  res.sendStatus(400);
  return;
});

// POST the registration form information to user database
// initialize user data and url database for the new user
app.post("/register", (req, res) => {
  const {email, password} = req.body;

  for (let id in users){
    if (email === users[id].email) {
      res.sendStatus(400).alert("YO You already exsist.....like wow... login?");
      return;
    }
  }

  if (email && password) {
    const user_id = generateRandomString();
    users[user_id] = {
      id: user_id,
      email: email,
      password: bcrypt.hashSync(password, 14)
    };
    urlDatabase[user_id] = {};
    req.session.user = users[user_id];
    console.log(req.session.user);
    res.redirect('/urls').alert("Thumbs up!");
  } else {
    res.sendStatus(400).alert('Awkward...');
    return;
  }
});


app.post("/logout", (req, res) => {
  req.session = null;

  res.redirect('/login');
});

