var express = require("express");
var router = express.Router();
var formidable = require('formidable');
var fs = require('fs');
var path = require("path");
var clientSessions = require('client-sessions');
var bcrypt = require('bcryptjs');
const saltRounds = 10;
//var sightengine = require('sightengine')('544183525', 'fbd8EN4Kxju6W5RhWqso');

const Clarifai = require('clarifai');

// initialize with your api key. This will also work in your browser via http://browserify.org/
const app = new Clarifai.App({
    apiKey: 'd2d99adf767e4ba9a11ceddd85b4277f'
});

//const myDatabase = require('./myDatabase');
//let db = new myDatabase();

const MongoDBModule = require('./MongoDBModule');
let db = new MongoDBModule();

router.post("/signup", function (req, res) {
    if (req.body.username == "" || req.body.password == "" ||
        req.body.password !== req.body.passwordconfirm)
        res.json(null);
    else {
        bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
            // Store hash in your password DB.
            let obj = {
                username: req.body.username,
                password: hash
            };

            db.addObjectPromise(obj).then((succsesobj) => {
                if (succsesobj != null) {
                    req.session_state.login = req.body.username;
                    res.json({
                        redirect: "/session"
                    });
                } else {
                    res.json(null);
                }
            }).catch((error) => {
                console.error("failed to add newUser : " + error);
                res.json(null);
            });


        });
    }
});

router.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/views/login.html");
});

router.post("/login", function (req, res) {
    if (req.body.username == null || req.body.password == null) {
        res.json(null);
    }
    let templogin = JSON.parse(JSON.stringify(req.body));
    db.getObjectWithUsernamePromise(templogin.username).then((checked) => {
        if (checked == null || checked.password == null) {
            console.log("checked is " + checked);
            res.json(null);
        } else {
            bcrypt.compare(templogin.password, checked.password, function (err, isMatch) {
                if (isMatch) {
                    // Passwords match
                    req.session_state.login = templogin.username;
                    res.json({
                        redirect: "/session"
                    });
                } else {
                    // Passwords don't match
                    console.log("NoMatch:bcrypt");
                    res.json(null);
                }
            });
        }
    }).catch((error) => {
        console.error("loging attempt failed: " + error);
        res.json(null);
    });


});




router.get("/logout", function (req, res) {
    req.session_state.reset();
    res.json({
        redirect: "/"
    });
});

router.post("/delete", function (req, res) {
    //need to check if they are actualy a user for security reasons
    let templogin = JSON.parse(JSON.stringify(req.body));
    //the username should be correct from normal use but just in case

    db.deleteObjectWithUsernamePromise(templogin.username).then((succsesobj) => {
        if (succsesobj != null) {
            if (req.session_state.login == req.body.username) {
                req.session_state.reset();
                res.json({
                    redirect: "/"
                });
            } else {
                console.log("A HAXOR!!! attempted to delete another user");
                res.json(null);
            }

        } else {
            res.json(null);
        }
    }).catch((error) => {
        console.error("failed to Delete The User: " + error);
        res.json(null);
    });

});

router.get("/session", function (req, res) {
    if (!req.session_state.login || req.session_state.login == "")
        res.sendFile(__dirname + "/public/views/login.html");
    //DO THIS BETTER
    else
        res.sendFile(__dirname + "/public/views/Canvas.html");
});
router.get("/checksession", function (req, res) {
    if (!req.session_state.login || req.session_state.login == "")
        res.json({
            redirect: "/"
        });
    else
        res.json(null);
});
router.get("/userinfo", function (req, res) {
    if (!req.session_state.login || req.session_state.login == "")
        res.json(null);
    else {
        //let thetempobj = db.getObjectWithUsernamePromise(req.session_state.login);
        //Promises FTW
        db.getObjectWithUsernamePromise(req.session_state.login).then((result) => {
            console.log(result.username + " has connected");
            res.json(result);

        }).catch((error) => {
            console.error("that user dosent exist anymore: " + error);
            res.json(null);
        });

    }
});
router.get("/picturearray", function (req, res) {
    if (!req.session_state.login || req.session_state.login == "")
        res.json(null);
    else {
        //let thetempobj = db.getAllPicsObjects();

        db.getAllPicsObjectsPromise().then((StoredPics) => {
            //console.log("Its actualy empt " + StoredPics);
            res.json(StoredPics);
        }).catch((error) => {
            console.error("failed to recive all pics: " + error);
            res.json(null);
        });

        //console.log("picarray a x y ");
        //console.log(thetempobj[0].picAdress);
        //console.log(thetempobj[0].x);
        //console.log(thetempobj[0].y);

    }
});
//create a route that handles getting images from folder
//sending them back to user with requests such as bison.png
//change the route to be compatible with parameter
/*
router.get("/bison.jpg", function (req, res) {
    if (!req.session_state.login || req.session_state.login == "")
        res.json(null);
    else {
        res.sendFile(__dirname + "/public/images/bison.jpg");
    }
});
*/


router.get("/findImageSrc/:imageAdresses", function (req, res) {
    if (!req.session_state.login || req.session_state.login == "")
        res.json(null);
    else {
        //console.log("in findimageSrc the param is");
        //console.log(req.params.imageAdresses);

        let source = req.params.imageAdresses;
        //remove previously added timestamps
        source = source.split("?", 1);

        res.sendFile(__dirname + "/public/images/" + source);
    }
});

router.post('/fileupload', function (req, res) {
    // console.log(req.body.xCordinate);
    // console.log(req.body.yCordinate);
    var form = new formidable.IncomingForm();

    form.parse(req);
    /*
    form.parse(req, function (err, fields, files) {
        res.write('received upload:\n\n');
        res.end(util.inspect({
            fields: fields,
            files: files
        }));
    });
    */
    let picObj = {};
    let whatDOYouMeAnFiLepAtHnOtdeIfInED = "";
    let base64StringBinary = "";
    let DogRecived = false;
    form.on('fileBegin', function (name, file) {
        file.path = __dirname + '/public/images/' + file.name;
        whatDOYouMeAnFiLepAtHnOtdeIfInED = file.path;
        picObj.picAdress = file.name;
        picObj.mimeType = file.type;


    });

    form.on('file', function (name, file) {
        console.log('Saved to ephermal fs :' + file.name);
        //picObj.imgBinary = fs.readFileSync(file.path);

    });

    form.on('field', function (name, value) {
        if (name == "xCordinate") {
            picObj.x = value;
        } else if (name == "yCordinate") {
            picObj.y = value;
        }
    });

    form.on('error', function (err) {
        res.json(err);
        //request.resume();
    });
    form.on('end', function () {

        console.log("on END");

        fs.readFile(whatDOYouMeAnFiLepAtHnOtdeIfInED, "base64", (err, data) => {
            if (err) throw err;
            base64StringBinary = data;

            app.models.predict(Clarifai.GENERAL_MODEL, {
                base64: base64StringBinary
            }).then(
                function (response) {
                    console.log(response.outputs[0].data.concepts[0].name); //returns name
                    console.log(response.outputs[0].data.concepts.length);
                    console.log("test complete");
                    // console.log();


                    // do something with response
                    if (response.status.code == 10000) {
                        console.log("a number");
                    }
                    if (response.status.code == "10000") {
                        console.log("a string");
                    }

                    if (response.status.code == 10000 && response.status.description == "Ok") {
                        console.log("it was true");
                        for (let i = 0, len = response.outputs[0].data.concepts.length; i < len; i++) {
                            if (response.outputs[0].data.concepts[i].name == "dog") {
                                console.log("recived a Dog");
                                DogRecived = true;
                                i = len;
                                fs.readFile(whatDOYouMeAnFiLepAtHnOtdeIfInED, (err, data) => {
                                    if (err) throw err;
                                    picObj.imgBinary = data;

                                    db.addPicObjPromise(picObj).then((succsesobj) => {
                                        return db.removePicObjPromise(succsesobj);
                                    }).then((succsesobj) => {
                                        return db.addPicObjPromise(picObj);
                                    }).then((succsesobj) => {
                                        if (succsesobj != null) {
                                            console.log("Shouldnt be here");
                                            res.json({
                                                isAdog: true,
                                            });
                                        } else {
                                            console.log("Strange ebeignghere")
                                            res.json(null);

                                        }

                                    }).catch((error) => {
                                        if (error != null) {
                                            res.json({
                                                isAdog: true,
                                            });
                                        } else if (error == null) {
                                            console.error("failed to replace Picture");
                                            res.json(null);
                                        }
                                    });

                                });
                            }
                        }
                        if (DogRecived == false) {
                            res.json({
                                isAdog: false,
                            });
                        }
                    } else {
                        conosle.log("BAD RESPONS/Status Code");
                        res.json(null);
                    }
                },
                function (err) {
                    // there was an error
                    console.log("error");
                    console.log(err);
                    res.json(null);
                }
            );

        });






    });



});
//res.end();
//res.sendFile(__dirname + "/public/views/Canvas.html");

module.exports = router;
