require('dotenv').config();
var express = require("express");
var router = express.Router();
const multer = require("multer");
const { dirname } = require("path");
const path = require("path");
const data = require("../modules/data");
const sign_data = require("../modules/sign_data");
var jwt = require("jsonwebtoken");
// const wbm = require('wbm');
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

//All the routes start here!!!
//Home Page Route
router.get("/", function (req, res, next) {
    console.log(process.env);
    res.render("homepage");
});


//File-Share Route
router.get("/file", function (req, res, next) {
    var loginuser=localStorage.getItem('loginuser');
    if(loginuser)
        res.render("index", { title: "Express", name: " " ,user:loginuser});
    else
        res.redirect('/');
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
        const files = `https://shareeasy.onrender.com/show/${doc.dataname}`
        // const files = `http://localhost:3000/show/${doc.dataname}`;
        res.render("index", { title: "Express", name: files ,user:loginuser});
    });
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
        }else {
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
//email
router.get('/email',(req,res)=>{
  var loginuser=localStorage.getItem('loginuser');
  res.render("index", { title: "Express", name: "Kishan" ,user:loginuser});
})
router.post('/email',async (req,res)=>{
  var loginuser=localStorage.getItem('loginuser');
  
  var query = sign_data.findOne({ username: loginuser }).select('emails'); //selecting emails field
  const gotemail = await query.exec();// This helps to execute the query at a later time 
  const sender = gotemail.emails;
  // console.log(loginuser);
  // console.log(sendermail);
  // const sender = req.body.sender;
  const receiver = req.body.receiver;
  // const files = `http://localhost:3000/show/${doc.dataname}`;
  const link = req.body.link;//console.log(link);
  const result = link.slice(36,link.length);
  // const result = link.slice(27,link.length);
  
  var query2 = data.findOne({ dataname: result }).select('datasize'); //selecting datasize field
  const gotfile = await query2.exec();// This helps to execute the query at a later time 
  const filesize = gotfile.datasize;// console.log(filesize);
  
  const sendMail = require('./email');
      await sendMail({
      from:sender,
      to:receiver,
      subject:"Share Easy File Sharing",
      text:`${loginuser} shared a file with you.`,
      html:require('./emailTemplate')({
          emailFrom:loginuser,
          downloadLink:`${link}`,
          size:parseInt(filesize/1000)+' KB',
          expires:'15 minutes'
        })
  } )
  return res.render('mailSuccess');
  // return res.send();
})

router.get('/logout', function (req, res, next) {
  localStorage.removeItem('loginuser');
  localStorage.removeItem('usertoken');
  res.redirect('/');
});
module.exports = router;
