var routes = require('express').Router();
var bcrypt = require('bcryptjs');
var MongoClient=require('mongodb').MongoClient;

routes.get('/', (req, res) => {
  res.status(200).json({"data":[{"message": 'Connected!'}]});
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
                        res.send({"data":[{"result": 0}]});
                    }
                    else{
                        db.collection('users').insertOne(details,function(err,result){
                        if(err) throw err;
                        res.send({"data":[{"result": 1}]});
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
                                res.send({"data":[{"result": 1}]});
                        }
                        else {
                            res.send({"data":[{"result": 0}]});
                        } 
                    }); 
                }
                else{
                    res.send({"data":[{"result": -1}]});
                }
        });
    });
})

routes.get('/getparking',function(req,res){
    var lat1 = req.query.lat;
    var lon1 = req.query.lon;
    var curr=[];
    var all=[];
    MongoClient.connect('mongodb+srv://harsha:harsha@harsha1-ashl9.mongodb.net/test?retryWrites=true&w=majority',function(err,db){
        if(err) throw err;
        var db=db.db('parkaway');
                db.collection('providers').find().toArray(function(err,result){
                for(var i=0;i<result.length;i++){
                        lat2=result[i].lat;
                        lon2=result[i].lon;
                        var unit='K';
                    if ((lat1 == lat2) && (lon1 == lon2)) {
                        result[i].distance=0;
                    }
                    else {
                    var radlat1 = Math.PI * lat1/180;
                    var radlat2 = Math.PI * lat2/180;
                    var theta = lon1-lon2;
                    var radtheta = Math.PI * theta/180;
                    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                    if (dist > 1) {
                        dist = 1;
                    }
                    dist = Math.acos(dist);
                    dist = dist * 180/Math.PI;
                    dist = dist * 60 * 1.1515;
                    if (unit=="K") { dist = dist * 1.609344 }
                    if (unit=="N") { dist = dist * 0.8684 }
                    result[i].distance=Math.round(dist);
                }
            }
                for(var i=0;i<result.length;i++){
                    for(var j=0;j<result.length-1;j++){
                        if(result[j].distance>result[j+1].distance){
                            var t=result[j];
                            result[j]=result[j+1];
                            result[j+1]=t;
                        }
                    }
                }
                lat1=result[0].lat;
                lon1=result[0].lon;
                email=result[0].email;
                var distance = result[0].distance;
                    res.send({"data":[{"email":email,"lat1":lat1,"lon1":lon1,"distance":distance}]});
            }); 
      });
})

routes.get('/asprovider',function(req,res){
    var email=req.query.email;
    var curr=[];
        MongoClient.connect('mongodb+srv://harsha:harsha@harsha1-ashl9.mongodb.net/test?retryWrites=true&w=majority',function(err,db){
        if(err) throw err;
        var db=db.db('parkaway');
        query={email:email};
                db.collection('providers').find(query).toArray(function(err,result){
                if(err) throw err;
                if(result[0]){
                    curr=result[0];
                    res.send({'data':[curr]});
                }
                else{
                  res.send({'data':[{'details':0}]});
                }
            });
    });
})

routes.get('/regprovider',function(req,res){
                var email=req.query.email;
                var lon=req.query.lon;
                var lat=req.query.lat;
                var initial=0;
                var book=[];
                query={email:email};
                MongoClient.connect('mongodb+srv://harsha:harsha@harsha1-ashl9.mongodb.net/test?retryWrites=true&w=majority',function(err,db){
                    if(err) throw err;
                    var db=db.db('parkaway');
                     db.collection('users').find(query).toArray(function(err,result){
                        var name=result[0].name;
                        var mobile=result[0].mobile;
                        newItem={name:name,email:email,mobile:mobile,lat:lat,lon:lon,earnings:initial,bookings:book}
                        db.collection('providers').insert(newItem, function(err, result){
                          if (err) { console.log(err); };
                        });
                        db.collection('providers').find(query).toArray(function(err, result){
                              var curr=result[0];
                             res.send({'data':[{'details':curr}]});
                        });
              });
      });
  })

routes.get('/confirm',function(req,res){
    var email = req.query.email;
    var earn = req.query.earn;
    MongoClient.connect('mongodb+srv://harsha:harsha@harsha1-ashl9.mongodb.net/test?retryWrites=true&w=majority',function(err,db){
        if(err) throw err;
        var db=db.db('parkaway');
        var book=[],f=0;
        query={email:email};
        db.collection('providers').find(query).toArray(function(err,result){
            if(err) throw err;
            Array.prototype.push.apply(book,result[0].bookings);
            var n =Number(result[0].earnings)+Number(earn);
            var today = new Date();  
            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var de = {date:date,earn:earn};
            for(i=0;i<book.length;i++){
                if(de.date==book[i].date){
                    book[i].earn=Number(book[i].earn)+Number(earn);
                    f=1;
                    break;
                }
            }
            if(f==0){
                book.push(de);
            }
            myquery={email:email};
              var newvalues = { $set: {earnings: n, bookings: book } };
             db.collection("providers").updateOne(myquery, newvalues , function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
            });
            res.send({"data":[{"result":1}]});
        });
    });
})

module.exports = routes;