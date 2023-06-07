var express = require("express");
var router = express.Router();
const multer = require("multer");
const { dirname } = require("path");
const path = require("path");
const data = require("../modules/data");
const sign_data = require("../modules/sign_data");
var jwt = require("jsonwebtoken");
const wbm = require('wbm');
/* GET home page. */
router.use(express.static(__dirname + "./public/"));
var Storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
var upload = multer({
  storage: Storage,
}).single("file");

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}
// var globalname="";
//All the routes start here!!!
wbm.start().then(async () => {
  const phones = ['9178033667'];
  const message = 'Good Morning.';
  await wbm.send(phones, message);
  await wbm.end();
}).catch(err => console.log(err));
//Home Page Route
router.get("/", function (req, res, next) {
  res.render("homepage");
});

//File-Share Route
router.get("/file", function (req, res, next) {
  var loginuser=localStorage.getItem('loginuser');
  if(loginuser)
  {
    res.render("index", { title: "Express", name: " " ,user:loginuser});
  }
  else
  {
    res.redirect('/');
  }

});
router.post("/file", upload, function (req, res, next) {
  var file = req.file.filename;
  var loginuser=localStorage.getItem('loginuser');
  console.log(file);
  var datas = new data({
    dataname: file,
    datasize: req.file.size,
  });
  datas.save((err, doc) => {
    if (err) throw err;
    console.log(doc);
    const files = `http://localhost:3000/show/${doc.dataname}`;
    res.render("index", { title: "Express", name: files ,user:loginuser});
  });

  // const files=`${__dirname}/../public/uploads/${file}`;
});

//View File Route
router.get("/show/:id", (req, res, next) => {
  var dataid = req.params.id;
  var docs = data.findOne({ dataname: dataid });
  docs.exec((err, doc) => {
    if (err) throw err;
    if (doc) {
      res.render("show", {
        title: "ShareApp",
        name: doc.dataname,
        siz: doc.datasize,
      });
    } else {
      res.redirect("/exp");
    }
  });
});

//Download File Route
router.get("/download/:uuid", (req, res, next) => {
  var uid = req.params.uuid;
  const files = `${__dirname}/../public/uploads/${uid}`;
  // res.render('download', { title: 'Express',name:uid  });
  res.download(files);
});

//404 Page Route
router.get("/exp", (req, res) => {
  // res.send("404 Page Not Found || Link must Be Expired");
  res.render("pagenotfound");
});

//Sign in Route
router.get("/sign", (req, res) => {
  res.render("sign", { name: "" });
});
router.post("/sign", (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var cnfpass = req.body.cnfpass;
  if(cnfpass==password)
  {
    var da = new sign_data({
      username: name,
      emails: email,
      password: password,
    });
    da.save((err, doc) => {
      if (err) throw err;
      // res.render("sign", { name: doc.name });
      res.redirect('/login');
    });
  }
  else{
res.render('sign',{name:"Password are Not Matching"});
  }  
});

//Login in ROuter
router.get("/login", (req, res) => {
  res.render("login", { username: "" });
});
router.post("/login", (req, res) => {
  var username = req.body.name;
  var password = req.body.pass;
  

  sign_data.findOne({ username: username }, (err, doc) => {
    if (err) throw err;
    if (doc)
    {
      var id=doc._id;
      var token = jwt.sign({ userid: id }, 'logintoken');
      localStorage.setItem('usertoken', token);
      localStorage.setItem('loginuser', doc.username);
      
       res.redirect('/file');
    } 
    else res.render("login", { username: "Worng Username" });
  });
});


//logout Route

router.get('/logout', function (req, res, next) {
  localStorage.removeItem('loginuser');
  localStorage.removeItem('usertoken');
  res.redirect('/');
});
module.exports = router;
