var express = require('express');
var bodyParser = require('body-parser');
var db = require('./models');
var request = require('request');
var methodOverride = require('method-override');
var ejsLayouts = require('express-ejs-layouts');
var session = require('express-session');
var flash = require('connect-flash');
var app = express();
var Yelp = require("yelp");
var yelp = new Yelp({
  consumer_key: process.env.YELP_CONSUMER_KEY,
  consumer_secret: process.env.YELP_CONSUMER_SECRET,
  token: process.env.YELP_TOKEN,
  token_secret: process.env.YELP_TOKEN_SECRET
});


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/assets'));
app.use(ejsLayouts);
app.use(session({
  secret:"o12i3qwreaq3roj4t5haw4",
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

app.use(function(req,res,next){

  if(req.session.user){
    db.user.findById(req.session.user).then(function(user){
      req.currentUser = user;
      next();
    })
  }else{
    req.currentUser = false;
    next();
  }
})

app.use(function(req,res,next){
  res.locals.currentUser = req.currentUser;
  res.locals.alerts = req.flash();
  next();
})

app.get('/', function(req,res){
  yelp.search({term: "resturants", location: 'Seattle'}, function(error, data) {
    var photos = [];
    var ids = [];
    data.businesses.forEach(function(place){
      if(place.image_url != null){
        photos.push(place.image_url.replace("ms.jpg","l.jpg"))
        ids.push(place.id)
      }
    })
    var info = {photos:photos, ids:ids}
    res.render('main/home', {info:info});
  });
});

app.get('/api', function(req,res){
  yelp.search({term: "resturants", location: 'Seattle'}, function(error, data) {
    res.send(data);
  });
});

app.get('/location/:id', function(req,res){
  yelp.business(req.params.id, function(err, data){
    res.send(data)
    if(false){res.redirect('/')}
      else{
        res.render('main/show', {data: data})
      }
  })
});

app.listen(process.env.PORT || 3000);
