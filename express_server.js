var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

var cookieParser = require('cookie-parser')

app.use(cookieParser())
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }

}

app.get("/", (req, res) => {
  res.end("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  var userId = req.cookies.user_id;
  var user = users[userId];
  let templateVars = { urls: urlDatabase, user: user};
console.log('req.cookies.user_id', req.cookies.user_id)
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/register", (req, res) => {
  res.render("urls_register");
});
app.get("/urls/:id", (req, res) => {
var userId = req.cookies.user_id;
var user = users[userId];
  let templateVars = { shortURL: req.params.id, user: user};
  res.render("urls_show", templateVars);
});





function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 6; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
generateRandomString();


app.post("/urls", (req, res) => {
  var returnVal = generateRandomString()
  console.log(req.body, res);  // debug statement to see POST parameters
  urlDatabase[returnVal] = req.body.longURL
  console.log(urlDatabase)
  res.redirect("http://localhost:8080/urls/" + returnVal);  // Respond with 'Ok' (we will replace this)

});
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});
app.post("/urls/:id/delete", (req, res) => {
  console.log(delete urlDatabase[req.params.id])
  res.redirect("http://localhost:8080/urls/")
});
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  console.log(req.params)
  console.log(req)
  res.redirect("http://localhost:8080/urls/")
});

app.post("/login", (req, res) => {
 //res.cookie( "user_id", req.body.email)
 var email = req.body.email;

 var password = req.body.password;
 var userId = req.cookies.user_id;
 var user = users[userId];
console.log(email)
console.log(password)
console.log(userId)
console.log(user)
console.log(users)
console.log(user.email)
console.log(user.password)


  if(email !== user.email){
    console.log(1)
    res.status(403).send('Forbidden')
    return;
  } else if (email === user.email && password !== user.password){
    console.log(2)
    res.status(403).send('Forbidden')
    return;
  } else {
    res.redirect("/")
  }

});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/logout", (req, res) => {
 res.clearCookie( "user_id")
 res.redirect("/urls")
});


app.post("/register", (req, res) => {

  var email = req.body.email;
  var password = req.body.password;


  if(email  === "" || password === ""){
    // return Error 400
    res.status(400).send('Error')
    return;
  }
  else {
    for (let user in users){
      if (email === users[user].email) {
        res.status(400).send('Error')
        return;
      }
    }

    var randomID = generateRandomString()
    users[randomID] = {id: randomID, email: email, password: password}

      res.cookie("user_id", randomID)
        res.status(200).send('Thumbs up')
  }


  // return Error 400
  // } else {




  // res.redirect("/urls")
  // (/register.email = user[userRandomID].email, /register.password= user[userRandomID].password );

})//*** need to make post and get rquest for theregister page

















