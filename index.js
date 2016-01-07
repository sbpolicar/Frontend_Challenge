// var data = require('./data.json');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var ejsLayouts = require('express-ejs-layouts');
var Yelp = require("yelp");
var yelp = new Yelp({
  consumer_key: process.env.YELP_CONSUMER_KEY,
  consumer_secret: process.env.YELP_CONSUMER_SECRET,
  token: process.env.YELP_TOKEN,
  token_secret: process.env.YELP_TOKEN_SECRET
});


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/assets'));
app.use(ejsLayouts);

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


app.listen(process.env.PORT || 3000);