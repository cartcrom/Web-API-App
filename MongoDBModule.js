let MongoDBModule = function () {
    var fs = require('fs');

    var mongoose = require('mongoose');
    mongoose.connect('mongodb://M4rk:0987@ds147799.mlab.com:47799/meme-place');
    //CONNECTS TO USERS DB mongodb://M4rk:0987@ds147799.mlab.com:47799/meme-place
    //localhost:27017
    //M4rk:0987@ds147799.mlab.com:47799

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        // we're connected!
        console.log("Connected to mongo sucessfully");
        //Testing ephemeral FS
        //convert binaries to images



    });
    //create User format
    var usersSchema = mongoose.Schema({
        username: {
            type: String,
            unique: [true, 'Why no eggs?']
        },
        password: String
    });
    var User = mongoose.model('User', usersSchema);

    //create Image format
    var imagesSchema = mongoose.Schema({
        picAdress: {
            type: String,
            unique: [true, 'Why no eggs?']
        },
        x: Number,
        y: Number,
        mimeType: String,
        imgBinary: Buffer
    });
    var Picture = mongoose.model('Picture', imagesSchema);




    //1 unused
    MongoDBModule.prototype.addObject = function (obj) {
        let TempObj = new User({
            username: obj.username,
            password: obj.password
        });
        TempObj.save(function (err, tempObj) {
            if (err) {
                console.error(err);
                return (null);
            }
            console.log("sucessfully saved " + tempObj.username);
            return (tempObj);
        });
    }
    //1.5
    MongoDBModule.prototype.addObjectPromise = function (obj) {
        return new Promise(function (resolve, reject) {
            let TempObj = new User({
                username: obj.username,
                password: obj.password
            });
            TempObj.save(function (err, tempObj) {
                if (err) {
                    console.error(err);
                    reject(null);
                }
                //console.log("sucessfully saved " + tempObj.username);
                resolve(tempObj);
            });

        });
    }
    //2 
    MongoDBModule.prototype.getObjectWithUsername = function (_username) {
        User.findOne({
            'username': _username
        }, function (err, result) {
            if (err) {
                console.error(err);
                return (null);
            }
            if (result) {
                console.log("in getobjwithuser" + result);
                return (result);
            } else
                return (null);
        });
    }
    //2.5 
    MongoDBModule.prototype.getObjectWithUsernamePromise = function (_username) {
        return new Promise(function (resolve, reject) {
            User.findOne({
                'username': _username
            }, function (err, result) {
                if (err) {
                    console.error(err);
                    reject(null);
                }
                if (result) {
                    console.log("in getobjwithuser" + result);
                    resolve(result);

                } else {
                    reject(null);
                }
            });
        });

    }
    //3
    MongoDBModule.prototype.deleteObjectWithUsername = function (_username) {
        User.findOneAndRemove({
            'username': _username
        }, function (err, result) {
            if (err) {
                console.error(err);
                return (null);
            }
            console.log("Maybee deleted objwithusername not sure if result is null or not");
            return (result);
        });
    }
    //3.5
    MongoDBModule.prototype.deleteObjectWithUsernamePromise = function (_username) {
        return new Promise(function (resolve, reject) {
            User.findOneAndRemove({
                'username': _username
            }, function (err, result) {
                if (err) {
                    console.error(err);
                    reject(null);
                }
                console.log("deleted Object:" + result.username);
                resolve(result);
            });
        });
    }
    //4
    MongoDBModule.prototype.getAllPicsObjects = function () {
        Picture.find(function (err, pictures) {
            if (err) {
                console.error(err);
                return (null);
            }
            //console.log("picsarray: " + pictures);
            return (pictures);
        });
    }
    //4.5
    MongoDBModule.prototype.getAllPicsObjectsPromise = function () {
        return new Promise(function (resolve, reject) {
            Picture.find(function (err, pictures) {
                if (err) {
                    console.error(err);
                    reject(null);
                }
                //console.log("picsarray: " + pictures);
                resolve(pictures);
            });
        });

    }
    //5
    MongoDBModule.prototype.addPicObj = function (picObj) {
        let TempPicObj = new Picture({
            picAdress: picObj.picAdress,
            x: picObj.x,
            y: picObj.y,
            mimeType: picObj.mimeType,
            imgBinary: picObj.imgBinary
        });
        TempPicObj.save(function (err, origCBPicObj) {
            if (err) {
                //pic with same name
                console.log("SAME NAME HERE");
                Picture.findOneAndRemove({
                    'picAdress': TempPicObj.picAdress
                }, function (err, result) {
                    if (err) {
                        console.log("FindOneAndRemove");
                        console.error(err);
                        return (null);
                    }
                    console.log("deleted Object:" + result.picAdress);
                    //save again now that the document the document with same name has been deleted
                    TempPicObj.save(function (err, CallbackObj) {
                        if (err) {
                            console.log("Error Saving After Deleting");
                            console.error(err);
                            return (null);
                        }
                        console.log("sucessfully replaced: " + CallbackObj.picAdress);
                        return (CallbackObj);
                    });
                    return (result);
                });
                //
                console.error(err);
                return (null);
            }



            console.log("sucessfully saved " + origCBPicObj.picAdress);
            return (origCBPicObj);
        });
    }
    //5.5
    ///////////////////////////////////////
    //////////////////////
    ////////
    //
    /*  MongoDBModule.prototype.addPicObjPromise = function (picObj) {
        return new Promise(function (resolve, reject) {
            let TempPicObj = new Picture({
                picAdress: picObj.picAdress,
                x: picObj.x,
                y: picObj.y,
                mimeType: picObj.mimeType,
                imgBinary: picObj.imgBinary
            });
            TempPicObj.save(function (err, origCBPicObj) {
                if (err) {
                    //pic with same name
                    console.log("SAME NAME HERE");
                    Picture.findOneAndRemove({
                        'picAdress': TempPicObj.picAdress
                    }, function (err, result) {
                        if (err) {
                            console.log("FindOneAndRemove");
                            console.error(err);
                            reject(null);
                        }
                        console.log("deleted Object:" + result.picAdress);
                        //save again now that the document the document with same name has been deleted
                        TempPicObj.save(function (err, CallbackObj) {
                            if (err) {
                                console.log("Error Saving After Deleting");
                                console.error(err);
                                reject(null);
                            }
                            console.log("sucessfully replaced: " + CallbackObj.picAdress);
                            resolve(CallbackObj);
                        });
                        resolve(result);
                    });
                    //
                    console.error(err);
                    reject(null);
                }



                //uncoment when done console.log("sucessfully saved " + origCBPicObj.picAdress);
                if (origCBPicObj != null) {
                    console.log("NULL here 6132456");
                    resolve(origCBPicObj);
                }

            });
        });
    }
*/

    /////////////
    ////////////////
    /////////////////
    MongoDBModule.prototype.addPicObjPromise = function (picObj) {
        return new Promise(function (resolve, reject) {
            let TempPicObj = new Picture({
                picAdress: picObj.picAdress,
                x: picObj.x,
                y: picObj.y,
                mimeType: picObj.mimeType,
                imgBinary: picObj.imgBinary
            });
            TempPicObj.save(function (err, origCBPicObj) {
                if (err) {
                    console.log("A Dupe was recived");
                    resolve(TempPicObj);
                } else {
                    console.log("sucessfully saved " + origCBPicObj.picAdress);
                    if (origCBPicObj != null) {
                        console.log("NULL here 6132456");
                        reject(origCBPicObj);
                    }
                }
            });
        });
    }
    //
    //
    //
    //
    MongoDBModule.prototype.removePicObjPromise = function (newPicObj) {
        return new Promise(function (resolve, reject) {
            console.log("SAME NAME HERE " + newPicObj.picAdress);
            Picture.findOneAndRemove({
                'picAdress': newPicObj.picAdress
            }, function (err, result) {
                if (err) {
                    console.log("remove error");
                    console.error(err);
                    reject(null);
                } else {
                    console.log("succsesfully removed : " + result.picAdress);
                    resolve(result);
                }

            });
        });
    }

    //could be synchronus because it only runs at the start of the server
    //no longer need to dump images to ephemeral File System
    /*
    this.getAllPicsObjectsPromise().then((StoredPics) => {
        for (let i = 0; i < StoredPics.length; i++) {
            fs.writeFile(__dirname + '/public/images/' + StoredPics[i].picAdress, StoredPics[i].imgBinary, (err) => {
                if (err) throw err;
                console.log(StoredPics[i].picAdress + ' binaries from the DB have been saved to the ephemeral FileSystem!');
            });
        }
    }).catch((error) => {
        console.error("Converting binaries failed: " + error);
    });
    */
}


module.exports = MongoDBModule;
//nesasary functions
/* 
1 ~~~db.addObject return null on error; return anything thats not null
2 ~~~db.getObjectWithUsername(_username) return null on error; return obj with .password and .username
3 ~~~db.deleteObjectWithUsername(_username); return null on error
4 ~~~db.getAllPicsObjects(); send all the PicObjects
5 ```db.addPicObj(picObj) return null on error; schema is .picAdress .x .y ; rework the way images are saved might need to add .binaryimgData
get all binary data and save it /^_^/

*/
