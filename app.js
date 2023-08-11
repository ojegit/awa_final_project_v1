require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const session = require('express-session'); //for 'session' 
const fetch = require('node-fetch'); //server side fetch
var mongoose = require("mongoose");
var logger = require('morgan');
const Role = require("./models/Role");


const i18next = require('i18next');
//const Backend = require('i18next-node-fs-backend');
const i18nextMiddleware = require('i18next-http-middleware');
//const ChainedBackend = require("i18next-chained-backend");
//const LocalStorageBackend = require("i18next-localstorage-backend");
const HttpBackend = require("i18next-http-backend");
//const LanguageDetector = require('i18next-browser-languagedetector');

//import routes
var apiRouter = require('./routes/api');
//

var app = express();
const cors = require('cors'); //has to be added even though not mentioned...


/*
i18n configuration
*/
//https://stackoverflow.com/questions/70291222/typeerror-this-services-languageutils-iswhitelisted-is-not-a-function
//https://lokalise.com/blog/node-js-i18n-express-js-localization/
//https://dev.to/adrai/how-does-server-side-internationalization-i18n-look-like-5f4c

/*
(async ()=> {
await i18next
.use(HttpBackend)
.use(i18nextMiddleware.LanguageDetector)
.init(
    {
    //lng: typeof window !== 'undefined' ? (window.localStorage.getItem('i18nextLng')) : 'en',
    fallbackLng: typeof window !== 'undefined' ? (window.localStorage.getItem('i18nextLng')): 'en',
    //fallbackLng: 'false',
    languages: ['en','fi'],
    locales: ['en', 'fi'],
    supportedLngs: ['en','fi'],
    //nonExplicitSupportedLngs: true, 
    //load: 'currentOnly',
    load: 'languageOnly',
    resources: {
        en: {
          translation: require('./public/locales/en/translation.json')
        },
        fi: {
          translation: require('./public/locales/fi/translation.json')
        }
      },
    debug: true,
    },
    (err, t) => {
        if (err) return console.error(err);
        console.log('i18next is ready...');
        console.log(t('welcome'));
        console.log(t('welcome', { lng: 'fi' }));
      },
    );

})();
app.use(i18nextMiddleware.handle(i18next));
*/

//view engine
app.engine('pug', require('pug').__express);
app.set('views', [
    path.join(__dirname, '/views'),
    path.join(__dirname, '/views/admin'),
    path.join(__dirname, '/views/user')
]);

app.set('view engine', 'pug');
//
//app.use(i18nextMiddleware.handle(i18next));

//database
const mongoDB = "mongodb://localhost:27017/projektidb1";
mongoose.connect(mongoDB);
mongoose.Promise = Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));
//

app.use(express.json());
//app.use(express.urlencoded({extended: true})); 
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
//
app.use(session({ //ATM: use to carry 
  secret: process.env.SECRET,
  saveUninitialized: false,
  resave: false
}));
//
app.use(express.static(path.join(__dirname, "public")));



(async ()=> {
  await i18next
  .use(HttpBackend)
  //.use(i18nextMiddleware.LanguageDetector)
  .init(
      {
      lng: typeof window !== 'undefined' ? (window.localStorage.getItem('i18nextLng')) : 'en',
      fallbackLng: typeof window !== 'undefined' ? (window.localStorage.getItem('i18nextLng')): 'en',
      //fallbackLng: 'false',
      languages: ['en','fi'],
      locales: ['en', 'fi'],
      supportedLngs: ['en','fi'],
      localeDetection: false,
      ignoreRoutes: [
        '/'
      ],
      //nonExplicitSupportedLngs: true, 
      //load: 'currentOnly',
      load: 'languageOnly',
      resources: {
          en: {
            translation: require('./public/locales/en/translation.json')
          },
          fi: {
            translation: require('./public/locales/fi/translation.json')
          }
        },
      debug: false, //if true, shows a bunch of messages in console.log
      },
      (err, t) => {
          if (err) return console.error(err);
          console.log('i18next proof of life...');
          console.log("English: "+ t('welcome', { lng: 'en' }));
          console.log("Finnish: "+ t('welcome', { lng: 'fi' }));
        },
      );
  
  })();
  app.use(i18nextMiddleware.handle(i18next));



//app.use(i18next.init);


//use routes
app.use('/', apiRouter);
//




//
//error handler
//


//port listener
port = 3000;
app.listen(port, () => console.log(`Server listening a port ${port}!`));
//


/*
Initialize
*/

//
//delete tokens and logout
//
(async() => {
  try {
      console.log("Attempting to remove old token at program start.");
      (await fetch('http://localhost:3000/logout',{method: "POST"}));
      if(typeof window !== 'undefined') {
        window.localStorage.removeItem("auth_token");
      }
      console.log("Tokens removed succesfully.");
      //window.location.replace('/');
  } catch(err) {
      console.log("Logout not successful. Token removal failed."+err);
      console.error("Logout not successful. Token removal failed."+err);
  }
})();

//
// create user roles
//
const sendRole = async (role)=> {
  let res = null;
  try {
      res = (await fetch('http://localhost:3000/admin/add_role', {
          method: "POST",
          headers: {"content-type":"application/json"},
          body: JSON.stringify(role)
      }));
  } catch(err) {
    console.log("Creating user roles failed "+err);
    console.error("Creating user roles failed "+err);
  }
}

(async() => {
  try {
      const userCount = (await Role.countDocuments({}));
      if(userCount == 0) {
        console.log("User roles NOT detected. Creating...");
        (await sendRole({name: 'basic', access: 1}));
        (await sendRole({name: 'admin', access: 3}));
      } else {
        console.log("Roles already exist. Not creating any.");
      }
  } catch(err) {
      console.log("Creating user roles failed "+err);
      console.error("Creating user roles failed "+err);
  }
})();