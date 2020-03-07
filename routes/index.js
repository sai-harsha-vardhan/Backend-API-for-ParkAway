var routes = require('express').Router();
var bcrypt = require('bcryptjs');
var MongoClient=require('mongodb').MongoClient;

routes.get('/', (req, res) => {
  res.status(200).json({ message: 'Connected!' });
});

routes.get('/register',function(req,res){
    var a=req.query.name;
    var b=req.query.email;
    var c=req.query.mobile;
    var d=req.query.aadhar;
    var e=req.query.passwd;
    var count = 0;
    bcrypt.hash(e, 10, function(err, hash) {
        var newpwd = hash;
        details={
            name:a,email:b,mobile:c,aadhar:d,passwd:newpwd
        };
            MongoClient.connect('mongodb+srv://harsha:harsha@harsha1-ashl9.mongodb.net/test?retryWrites=true&w=majority',{ useNewUrlParser: true },function(err,db){
            if(err) throw err;
            var db=db.db('parkaway');
            query={email:b};
                db.collection('users').find(query).toArray(function(err,result){
                    if(result[0]){
                        res.send({result:0});
                    }
                    else{
                        db.collection('users').insertOne(details,function(err,result){
                        if(err) throw err;
                        res.send({result:1});
                    });
                }
            });
        });
    });
});

routes.get('/login',function(req,res){
        var a=req.query.email;
        var b=req.query.passwd;
        var q = {email:a};
        MongoClient.connect('mongodb+srv://harsha:harsha@harsha1-ashl9.mongodb.net/test?retryWrites=true&w=majority',function(err,db){
                if(err) throw err;
                var db=db.db('parkaway');
            db.collection("users").findOne(q, function(err, result) {
                if(result){
                    var hash = result.passwd;
                    bcrypt.compare(b, hash, function(err, res1) {
                        if(res1) {
                                res.send({result:1});
                        }
                        else {
                            res.send({result:0});
                        } 
                    }); 
                }
                else{
                    res.send({result:-1});
                }
        });
    });
})

module.exports = routes;