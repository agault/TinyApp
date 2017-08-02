var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id };
  res.render("urls_show", templateVars);
});
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 6; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
console.log(generateRandomString());


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

