var express = require('express');
var app = express();
var url = require('url');
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var swig  = require('swig');
var tpl = swig.compileFile('./templates/tem1');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var client = require('scp2');
var exec = require('node-ssh-exec');
var S = require('string');
var Client = require('node-rest-client').Client;
client1 = new Client();
var async = require('async');
var request = require('request');
var cookieParser = require('cookie-parser');

var session      = require('express-session');
var passport = require('passport');
var flash    = require('connect-flash');
var LocalStrategy = require('passport-local').Strategy;

app = express();


app.use(bodyParser());
app.use(cookieParser());
app.use(session({ secret: '1qaz2wsx3edc!@#werwersfdfwer' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


var users = [
    { id: 1, username: 'admin', password: '1qaz2wsx@', email: 'adm@example.com' }
];


function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});


passport.use(new LocalStrategy(
  function(username, password, done) {
    process.nextTick(function () {
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      });
    });
  }
));











app.use( express.static(__dirname+'/public') );
app.set('view engine', 'ejs');



app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    //send time period



    //res.redirect('/tot?to='+d2+'&from='+d1);
    res.redirect('/main');


});

app.get('/login', function (req, res) {
  res.render('login',{ user: req.user, message: req.flash('error')});
});


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});




function createDockerfile(name,info){

  var path = './templates/'+name;
  var file =path+'/Dockerfile';
  mkdirp(path, function(err) {
      if(!err){
        console.log("created");
        fs.writeFile(file, tpl(info), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");

        });


      }
  });
}


app.get('/',ensureAuthenticated ,function(req,res){
  res.render('index');
});

app.get('/re',ensureAuthenticated ,function(req,res){
  res.render('re');
});

app.get('/jrn',ensureAuthenticated ,function(req,res){
  res.render('journ');
});

app.get('/views',function(req,res){
  res.sendFile(path.join(__dirname+'/contain.html'));
});


app.get('/te',function(req,res){
  res.sendFile(path.join(__dirname+'/te.html'));
 

});



app.get('/machines', function(req, res) {

console.log(req.query)
var config = {
        host: '172.17.8.101',
        username: 'root',
        password: '1234'
    },
    command = 'fleetctl list-machines',
  jsonarr1=[];
  
exec(config, command,res ,function (error, response, res) {

 if (error) {
        throw error;  
    }
  //arrays
  var localips=[];
  var ipsurl=[];
  var ipsurldup=[];
  var compare=[];
  var hname=[];
  var expir=[];
  var jsonarr1=[];

  var IPS;
    
  console.log(response);
  var phrase = S(response).lines();
  
  //woking
  
  for (var i=1;i<phrase.length-1;i++)
  {
  
  
  var stripphrase1=S(phrase[i]).collapseWhitespace().s
  var sub=stripphrase1.substring(12,24);
  console.log('sub : '+sub);
  localips[i-1]=sub;
  
  }
  
console.log('localips : '+localips);
    
  var url = 'https://discovery.etcd.io/a72cee86e261b8433b2bb583061c4606';

  request(url, function(error, response, body){
    if(!error){
    
      var body1=JSON.parse(body);
    
  for (var i = 0; i < body1.node.nodes.length; i++)
  {
  
    var element=body1.node.nodes[i];
    
    var key=element.key;
    var value=element.value;
    console.log(value);
    var subs=value.substring(7,19);
    console.log(subs);
    var expiration=element.expiration;
    ipsurl[i]=subs;
    ipsurldup[i]=subs;
    expir[i]=expiration;
                
  }
  console.log('ipsurl :' + ipsurl);

  compare[0]="dead";
  compare[1]="dead";
  compare[2]="dead";
    
  for (var j=0;j<ipsurl.length;j++)
  {
  
  console.log('aaaaaaaaaa');
  var test=ipsurl[j];
  console.log('ipsurl[x]   :'+ipsurl[j]);
  console.log('expir[x]   :'+expir[j]);
  
   
   var l = ipsurl[j];
   
   for (var g=0;g<localips.length;g++)
   {
   
    
   console.log(l+'--------------'+g);
    if(ipsurl[j].trim() === localips[g].trim())
    {
    
     console.log('test :'+test);
     
     console.log('localips[g] :'+localips[g]);
    
    compare[j]="live";
     console.log('true');
    
    
    
    }
    
    console.log('tttttttttttttttttttt'+compare);
   
   }

  
  }
  console.log('ipsurl333 :' + ipsurl);
  
   console.log('local333 :' + localips);
   console.log('expir333 :'+expir);
   console.log('compare333 :'+compare);
   
   
 
  
  
  for (var k =0; k<compare.length;k++){
  console.log(k);
  
  var data=new Object();
  data.Hostip=ipsurl[k];
    data.Expir=expir[k];
  data.status = compare[k];
  
  
  jsonarr1.push(data);
  
  }
  
  console.log(jsonarr1);
    res.send(jsonarr1);

  }
  });
  
});
});


app.get('/stop',function(req,res){
console.log("lol inside stop")
  var IP=req.query.ip;
  
  console.log('IP:' + IP);
  var config = {
        host: IP,
        username: 'root',
        password: '1234'
    },
    command = 'shutdown';

exec(config, command, res,function (error, response,res) {
    if (error) {
        throw error;
    
    }
console.log(response);
  
});
});

app.get('/viewimages',function(req,res){
res.sendFile(path.join(__dirname+'/contain.html'));

});
app.get('/start',function(req,res){

var IP=req.query.ipt;
var nametset=req.query.name;
console.log("inside /start :"+req.query);
console.log("ipt: "+IP);
console.log("name: "+nametset);

});

app.post('/createcontainer1',function(req,res){
  console.log('workscontainers');
 // var imagename=req.body.ImageName;
  var IP=req.body.MachineIP;
  //var ing='docker pull '+''+imagename
  //console.log('Imagename fromhtml :'+imagename);
   console.log('ip fromhtml :'+IP);
 // console.log('Ing :'+ing);


});
////



app.get('/containerdata',function(req,res){

  var parts=url.parse(req.url,true);
  var query=parts.query;
  console.log('workssh');
  console.log("parts:"+parts);
   console.log("query:"+query);
  console.log("clicked ip :"+req.query)
  
  var IP=req.query.ip;
  var fullIP='172.17.8.'+IP+':2375';
  
  console.log('fullIP:' + fullIP);
  
  var urlC = 'http://'+fullIP+'/containers/json?all=1&size=1';
  
  console.log('url1 ::' + urlC);

  request(urlC, function(error, response, body){
    if(!error && response.statusCode == 200){

        console.log(body);
        var body1=JSON.parse(body);
        console.log("body1 :"+body1);
        
        var cid=[];
        var subcid=[];
        var cimage=[];
        var cstatus=[];
        var cname=[];
        var csubstatus=[];
        var jsonarr2=[];
        
      for (var i = 0; i < body1.length; i++)
        {
          var element=body1[i];
          var sub=element.Id;
          var sub_cid=sub.substring(0,12);
          console.log('sub_cid : '+sub_cid);
          var cim=element.Image;
          //console.log('CImagename : '+cim);
          var csta=element.Status;
          console.log('Cstatus : '+csta);
          var subs_staus;
          var cstasubs=csta.substring(0,2);
          if(cstasubs== 'Up')
          {
            subs_staus="Up";
          }
          else if ( cstasubs == 'Ex')
          {
            subs_staus="Exited";
          }
          console.log('cstasubs : '+cstasubs);
          var cnames=element.Names;
          //console.log('cnames : '+cnames);
          
          cid[i]=sub;
          subcid[i]=sub_cid;
          cimage[i]=cim;
          cstatus[i]=csta;
          csubstatus[i]=subs_staus;
          cname[i]=cnames;
          
        
        }
        console.log('cid : '+cid);
        console.log('subcid : '+subcid);
        console.log('cim : '+cimage);
        console.log('cstatus : '+cstatus);
        console.log('csubstatus : '+csubstatus);
        console.log('cname : '+cname);
        for (var k =0; k<cid.length;k++){
        console.log(k);
  
        var data=new Object();
        data.ContainerID=cid[k];
        data.subCID=subcid[k];
        data.Image=cimage[k];
        data.Status = cstatus[k];
        data.Names = cname[k];
        data.substatus=csubstatus[k];
  
  
        jsonarr2.push(data);
  
        }
  
        console.log("jsonarr2 :"+jsonarr2);
        res.render('contain',{data:jsonarr2});
        
        
        }
    if(response.statusCode == 400){

        console.log("Bad Parameters");
    
        }
    if(response.statusCode == 500){

        console.log("Server error");
    
        }
      })

});

//for image data
//
app.get('/imagedata1',function(req,res){

  var parts=url.parse(req.url,true);
  var query=parts.query;
  console.log('imagedata');
  console.log("parts:"+parts);
  console.log("query:"+query);
  console.log("clicked ip :"+req.query)
  var IP=req.query.ip;
  console.log('IP:' + IP);
  var fullIP='172.17.8.'+IP+':2375';
  console.log('fullIP:' + fullIP);
 var url1 = 'http://'+fullIP+'/images/json?all=0';
//var url1='http://172.17.8.102:2375/images/json?all=0';

console.log('url1 ::' + url1);

  request(url1, function(error, response, body){
    if(!error){
    
      var body1=JSON.parse(body);
      console.log('body ::' + body);
      console.log('body1 ::' + body1);
      
    var iname=[];
    var iid=[];
    var subiid=[];
    var idate=[];
    var isize=[];
    var jsonarr3=[];
    
  for (var i = 0; i < body1.length; i++)
  {
  
  
    
    var element=body1[i];
    
    var id=element.Id;
    console.log('id : '+id);
    
    var sub_iid=id.substring(0,12);
    console.log('sub_iid : '+sub_iid);
    
    var created=element.Created;
    console.log("created :"+created);
    
    
    var name=element.RepoTags[0];
    console.log("name :"+name);
    
    var size=element.VirtualSize;
    console.log("size :"+size);
    
    iid[i]=id;
    subiid[i]=sub_iid;
    idate[i]=created;
    iname[i]=name;
    isize[i]=size;
  
                
  }
  console.log('iname : '+iname);
  console.log('iid : '+iid);
  console.log('subiid : '+subiid);
  console.log('idate : '+idate);
  console.log('isize : '+isize);
  
  for (var k =0; k<iname.length;k++){
  console.log(k);
  
  var data=new Object();
  data.ImageN=iname[k];
    data.ImageI=iid[k];
  data.ImageSI=subiid[k];
  data.Date = idate[k];
  data.Size = isize[k];
  
  
  jsonarr3.push(data);
  
  }
  console.log(jsonarr3);
   res.render('images',{data:jsonarr3});
  
  }
  
});
});
//



//for image data
//


app.get('/testinfosl',function(req,res){

  var parts=url.parse(req.url,true);
  var query=parts.query;
  console.log('imagedata');
  console.log("parts:"+parts);
  console.log("query:"+query);
  console.log("clicked ip :"+req.query)
  var IP=req.query.ip;
  console.log('IP:' + IP);
  var fullIP='172.17.8.'+IP+':2375';
  console.log('fullIP:' + fullIP);
 var url1 = 'http://'+fullIP+'/images/json?all=0';
//var url1='http://172.17.8.102:2375/images/json?all=0';

console.log('url1 ::' + url1);

  request(url1, function(error, response, body){
    if(!error){
    
      var body1=JSON.parse(body);
      console.log('body ::' + body);
      console.log('body1 ::' + body1);
      
    var iname=[];
    var iid=[];
    var subiid=[];
    var idate=[];
    var isize=[];
    var jsonarr3=[];
    
  for (var i = 0; i < body1.length; i++)
  {
  
  
    
    var element=body1[i];
    
    var id=element.Id;
    console.log('id : '+id);
    
    var sub_iid=id.substring(0,12);
    console.log('sub_iid : '+sub_iid);
    
    var created=element.Created;
    console.log("created :"+created);
    
    
    var name=element.RepoTags[0];
    console.log("name :"+name);
    
    var size=element.VirtualSize;
    console.log("size :"+size);
    
    iid[i]=id;
    subiid[i]=sub_iid;
    idate[i]=created;
    iname[i]=name;
    isize[i]=size;
  
                
  }
  console.log('iname : '+iname);
  console.log('iid : '+iid);
  console.log('subiid : '+subiid);
  console.log('idate : '+idate);
  console.log('isize : '+isize);
  
  for (var k =0; k<iname.length;k++){
  console.log(k);
  
  var data=new Object();
  data.ImageN=iname[k];
    data.ImageI=iid[k];
  data.ImageSI=subiid[k];
  data.Date = idate[k];
  data.Size = isize[k];
  
  
  jsonarr3.push(data);
  
  }
  console.log(jsonarr3);
   res.render('run',{data:jsonarr3,ip:'172.17.8.'+IP});
  
  }
  
});
});

//docker info
//test infos


app.get('/imagedata2',function(req,res){

 
  var fullIP='172.17.8.101'+':2375';
  console.log('fullIP:' + fullIP);
 var url1 = 'http://'+fullIP+'/images/json?all=0';
//var url1='http://172.17.8.102:2375/images/json?all=0';

console.log('url1 ::' + url1);

  request(url1, function(error, response, body){
    if(!error){
    
      var body1=JSON.parse(body);
      console.log('body ::' + body);
      console.log('body1 ::' + body1);
      
    var iname=[];
    var iid=[];
    var idate=[];
    var isize=[];
    var jsonarr3=[];
    
  for (var i = 0; i < body1.length; i++)
  {
  
  
    
    var element=body1[i];
    
    var id=element.Id;
    console.log('id : '+id);
    
    var created=element.Created;
    console.log("created :"+created);
    
    
    var name=element.RepoTags[0];
    console.log("name :"+name);
    
    var size=element.VirtualSize;
    console.log("size :"+size);
    
    iid[i]=id;
    idate[i]=created;
    iname[i]=name;
    isize[i]=size;
  
                
  }
  console.log('iname : '+iname);
  console.log('iid : '+iid);
  console.log('idate : '+idate);
  console.log('isize : '+isize);
  
  for (var k =0; k<iname.length;k++){
  console.log(k);
  
  var data=new Object();
  data.ImageN=iname[k];
    data.ImageI=iid[k];
  data.Date = idate[k];
  data.Size = isize[k];
  
  
  jsonarr3.push(data);
  
  }
  console.log(jsonarr3);
   res.render('re',{data:jsonarr3});
  
  }
  
});
});


app.get('/testinfos',function(req,res){
  
var parts=url.parse(req.url,true);
  var query=parts.query;
  console.log('imagedata');
  console.log("parts:"+parts);
  console.log("query:"+query);
  console.log("clicked ip :"+req.query)
  
  var IP=req.query.ip;

  console.log('IP:' + IP);
  var MachineIP='172.17.8.'+IP+':2375';
  console.log("MachineIP: "+MachineIP);
  
  
    url1='http://'+MachineIP+'/info';
   console.log("url1  sysytem Info : "+url1);
  
request(url1, function (error, response, body) {
  if (!error && response.statusCode == 200  ) {
    //console.log(body) 
  
  var body1=JSON.parse(body);
  
  var Name=body1.Name;
  console.log("Name : "+Name); 
  var noofcontainers=body1.Containers;
  var noofimages=body1.Images;
  var Driver=body1.Driver;
  var MemoryLimit=body1.MemoryLimit;
  var SwapLimit=body1.SwapLimit;
  var ExecutionDriver=body1.ExecutionDriver;
  var KernelVersion=body1.KernelVersion;
  var OperatingSystem=body1.OperatingSystem;
  var IndexServerAddress=body1.IndexServerAddress;
  var InitPath=body1.InitPath;
  var DockerRootDir=body1.DockerRootDir;
  var MemTotal=body1.MemTotal;
  var arrdata=[];
  arrdata[0]=Name;
  arrdata[1]=noofcontainers;
  arrdata[2]=noofimages;
  arrdata[3]=Driver;
  arrdata[4]=MemoryLimit;
  arrdata[5]=SwapLimit;
  arrdata[6]=ExecutionDriver;
  arrdata[7]=KernelVersion;
  arrdata[8]=OperatingSystem;
  arrdata[9]=IndexServerAddress;
  arrdata[10]=InitPath;
  arrdata[11]=DockerRootDir;
  arrdata[12]=MemTotal;
  console.log("arrdata : "+arrdata); 
  res.render('testinfo',{arrdata:arrdata});
  }
    if(response.statusCode == 500 )
  {
  console.log("Server error") ;
  }
})

});
//docker inspect

//test inspect
app.get('/teatinspect',function(req,res){
  
  var parts=url.parse(req.url,true);
  var query=parts.query;
  console.log('teatinspect');
  console.log("parts:"+parts);
  console.log("query:"+query);
  console.log("clicked ip :"+req.query)
  
  var IP=req.query.ip;

  console.log('IP:' + IP);
  
  var CoID=req.query.id;

  console.log('CoID:' + CoID);
  
   var MachineIP='172.17.8.'+IP+':2375';
  console.log("MachineIP: "+MachineIP);
 
 //containers/d978dbae14a12929e5a680f3e45bad8cd6f608aa38147204c49002fc906fbb62/json
  
   url1='http://'+MachineIP+'/containers/'+CoID+'/json';
   console.log("url1  coninspect : "+url1);
  
request(url1, function (error, response, body) {
  if (!error && response.statusCode == 200 ) {
  //console.log(body) 
  
  var body1=JSON.parse(body);
  console.log("length :"+body1.length);
  
  var Cid=body1.Id;
  console.log('Cid '+Cid);
    
  var Created=body1.Created;
  console.log("Created :"+Created);
  
  var Path=body1.Path;
  console.log("Path :"+Path);
  
  var Running=body1.State.Running;
  console.log("Running :"+Running);
  
  var ContainerlastStartedAt=body1.State.StartedAt;
  console.log("StartedAt :"+ContainerlastStartedAt);
  
  var ContainerlastFinishedAt=body1.State.FinishedAt;
  console.log("FinishedAt :"+ContainerlastFinishedAt);
  
  var Imageins=body1.Image;
  console.log("Image :"+Imageins);
  
  var Imagename=body1.Config.Image;
  console.log("Image :"+Imagename);
  
  var HostnamePath=body1.HostnamePath;
  console.log("HostnamePath :"+HostnamePath);
  
  var HostsPath=body1.HostsPath;
  console.log("HostsPath :"+HostsPath);
  
  var LogPath=body1.LogPath;
  console.log("LogPath :"+LogPath);
  
  var HName=body1.Name;
  console.log("HName :"+HName);
  
  var HNameIP=body1.Config.Hostname;
  console.log("HNameIP :"+HNameIP);
  
  var Driver=body1.Driver;
  console.log("Driver :"+Driver);
  
  var ExecDriver=body1.ExecDriver;
  console.log("ExecDriver :"+ExecDriver);
  
  
  var Cmd=body1.Config.Cmd;
  console.log("Cmd :"+Cmd);
  
  var NetworkMode=body1.HostConfig.NetworkMode;
  console.log("NetworkMode :"+NetworkMode);
  

  
  var dataarray=[];
  dataarray[0]=Cid;
  dataarray[1]=Created;
  dataarray[2]=Path;
  dataarray[3]=Running;
  dataarray[4]=ContainerlastStartedAt;
  dataarray[5]=ContainerlastFinishedAt;
  dataarray[6]=Imageins;
  dataarray[7]=Imagename;
  dataarray[8]=HostnamePath;
  dataarray[9]=HostsPath;
  dataarray[10]=LogPath;
  dataarray[11]=HName;
  dataarray[12]=HNameIP;
  dataarray[13]=Driver;
  dataarray[14]=ExecDriver;
  dataarray[15]=Cmd;
  dataarray[16]=NetworkMode;
  
  console.log("DOCKER Container inspect dataarray "+ dataarray);
  res.render('testvalue',{data:dataarray});
  }
  
  if(response.statusCode == 404)
  {
  console.log("no such container") ;
  }
  
  if(response.statusCode == 500)
  {
  console.log("Server error") ;
  }
  
})
  

  
});
//docker inspect images

app.get('/testimageinspect',function(req,res){
  
  var parts=url.parse(req.url,true);
  var query=parts.query;
  console.log('AAAAAAAA');
  console.log("parts:"+parts);
  console.log("query:"+query);
  console.log("clicked ip :"+req.query)
  
  var IP=req.query.ip;

  console.log('IP:' + IP);
  
  var ImID=req.query.id;

  console.log('ImID:' + ImID);
  
  var MachineIP='172.17.8.'+IP+':2375';
  console.log("MachineIP: "+MachineIP);
 
 //images/ubuntu/json
  
   url1='http://'+MachineIP+'/images/'+ImID+'/json';
   console.log("url1  iminspect : "+url1);
  
request(url1, function (error, response, body) {
  if (!error && response.statusCode == 200 ) {
  //console.log(body) 
  var body1=JSON.parse(body);
  console.log("length :"+body1.length);
  
  var Iid=body1.Id;
  console.log('Iid '+Iid);
  var Parent=body1.Parent;
  console.log("parent :"+Parent);
  
  var Comment=body1.Comment;
  console.log("Comment :"+Comment);
  
  var Created=body1.Created;
  console.log("Created :"+Created);
  
  var Container=body1.Container;
  console.log("Container :"+Container);
  
  var Hostname=body1.ContainerConfig.Hostname;
  console.log("Hostname :"+Hostname);
  
  var Tty=body1.ContainerConfig.Tty;;
  console.log("Tty :"+Tty);
  
  var Cmd=body1.ContainerConfig.Cmd;
  console.log("Cmd :"+Cmd);
  
  var NetworkDisabled=body1.ContainerConfig.NetworkDisabled;
  console.log("NetworkDisabled :"+NetworkDisabled);
  var DockerVersion=body1.DockerVersion;
  console.log("DockerVersion :"+DockerVersion);
  
  var Author=body1.Author;
  console.log("Author :"+Author);
  
  var Architecture=body1.Architecture;
  console.log("Architecture :"+Architecture);
  
  var Os=body1.Os;
  console.log("Os :"+Os);
  
  var VirtualSize=body1.VirtualSize;
  console.log("VirtualSize :"+VirtualSize);
  
  var cmdI=body1.Config.Cmd;
  console.log("cmdI :"+cmdI);
  
  var TtyI=body1.Config.Tty;;
  console.log("TtyI :"+TtyI);
  
  var Valuearray=[];
  Valuearray[0]=Iid;
  Valuearray[1]=Parent;
  Valuearray[2]=Comment;
  Valuearray[3]=Created;
  Valuearray[4]=Container;
  Valuearray[5]=Hostname;
  Valuearray[6]=Tty;
  Valuearray[7]=Cmd;
  Valuearray[8]=NetworkDisabled;
  Valuearray[9]=DockerVersion;
  Valuearray[10]=Author;
  Valuearray[11]=Architecture;
  Valuearray[12]=Os;
  Valuearray[13]=VirtualSize;
  Valuearray[14]=cmdI;
  Valuearray[15]=TtyI;
  
  console.log("DOCKER image inspect Valuearray "+ Valuearray);
  res.render('testimagevalues',{data:Valuearray});
  }
  
  if(response.statusCode == 404)
  {
  console.log("no such Image") ;
  }
  
  if(response.statusCode == 500)
  {
  console.log("Server error") ;
  }
  
})
  
  
});






//container start

app.get('/startc',function(req,res){

var conid=req.query.ipt;
var IP=req.query.name;
console.log("inside /startc :"+req.query);
console.log("conid: "+conid);
console.log("IP: "+IP);
  var MachineIP='172.17.8.'+IP+':2375';
  console.log("MachineIP: "+MachineIP);
  var cmand='docker start '+conid;
  console.log("cmand: "+cmand);
  
    url1='http://'+MachineIP+'/containers/'+conid+'/start';
   console.log("url1  start : "+url1);
  
request.post(url1, function (error, response, body) {
  if (!error && response.statusCode == 204 ) {
    console.log(body) 
  }
  if(response.statusCode == 304)
  {
  console.log("container already started") ;
  }
  if(response.statusCode == 404)
  {
  console.log("no such container") ;
  }
  
  if(response.statusCode == 500)
  {
  console.log("Server error") ;
  }
  
})
  

});

//container stop

app.get('/stopc',function(req,res){

var conid1=req.query.ipt;
var IP1=req.query.name;
console.log("inside /stopc :"+req.query);
console.log("conid: "+conid1);
console.log("IP1: "+IP1);

  var MachineIP1='172.17.8.'+IP1+':2375';
  console.log("MachineIP: "+MachineIP1);
  var cmand1='docker stop '+conid1;
  console.log("cmand1: "+cmand1);
  
  url1='http://'+MachineIP1+'/containers/'+conid1+'/stop';
   console.log("url1  stop : "+url1);
  
request.post(url1, function (error, response, body) {
  if (!error && response.statusCode == 204) {
    console.log(body) 
  }
  if(response.statusCode == 304)
  {
  console.log("container already stopped") ;
  }
  if(response.statusCode == 404)
  {
  console.log("no such a container") ;
  }
  
  if(response.statusCode == 500)
  {
  console.log("Server error") ;
  }
})
  
  
  
  

});

//container kill
app.get('/killc',function(req,res){

var IPt=req.query.ipt;
var IP=req.query.name;
console.log("inside /killc :"+req.query);
console.log("ipt: "+IPt);
console.log("name: "+IP);

//containers/(id)/kill
var MachineIP1='172.17.8.'+IP+':2375';
  console.log("MachineIP: "+MachineIP1);
 
  url1='http://'+MachineIP1+'/containers/'+IPt+'/kill';
   console.log("url1  stop : "+url1);
  
request.post(url1, function (error, response, body) {
  if (!error && response.statusCode == 204) {
    console.log(body) 
  }
  
  if(response.statusCode == 404)
  {
  console.log("no such a container") ;
  }
  
  if(response.statusCode == 500)
  {
  console.log("Server error") ;
  }

});  

});
//remove image
app.get('/remove',function(req,res){

var ImgID=req.query.ipt;
var IP=req.query.name;
console.log("inside /remove :"+req.query);
console.log("ImgID:"+ImgID);
console.log("IP: "+IP);
  var MachineIP='172.17.8.'+IP+':2375';
  console.log("MachineIP: "+MachineIP);
  
  
    url1='http://'+MachineIP+'/images/'+ImgID+"?force=1";
   console.log("url1  start : "+url1);
  
request.del(url1, function (error, response, body) {
  if (!error && response.statusCode == 200  ) {
    console.log(body) 
  }
  if(response.statusCode == 304)
  {
  console.log("container already started") ;
  }
  if(response.statusCode == 404)
  {
  console.log("no such image") ;
  }
  
  if(response.statusCode == 409 )
  {
  console.log("conflict") ;
  }
   if(response.statusCode == 500 )
  {
  console.log("Server error") ;
  }
})

});
app.get('/search',function(req,res){

var textvalue=req.query.textvalue;
var IP=req.query.ip;
console.log("inside /search :"+req.query);
console.log("textvalue:"+textvalue);
console.log("IP: "+IP);
  var MachineIP='172.17.8.'+IP+':2375';
  console.log("MachineIP: "+MachineIP);
  
  
    url1='http://'+MachineIP+'/images/search?term='+textvalue;
   console.log("url1  start : "+url1);
  
request(url1, function (error, response, body) {
  if (!error && response.statusCode == 200  ) {
   // console.log("search result : "+body);
    var body1=JSON.parse(body);
      
      //console.log('body1 ::' + body1.length);
      
  
    
  for (var i = 0; i < body1.length; i++)
  {
      var element=body1[i];
      var rating=element.star_count;
      //console.log('rating ::' + rating);
      if (rating>0)
      {
        console.log('rating ::' + rating);
        var Trusted=element.is_trusted;
        console.log('Trusted ::' + Trusted);
        var Official=element.is_official;
        console.log('Official ::' + Official);
        var Description=element.description;
        console.log('Description ::' + Description);
        var ImagName=element.name;
        console.log('ImagName ::' + ImagName);
      }
  }
  }
  if(response.statusCode == 500)
  {
  console.log("server error") ;
  }

});

});










app.get('/main', function(req,res){

  //res.sendFile(__dirname + '/index.html');

  res.render('gene');

});

app.post('/addfile',function (req, res){

  var p;

  console.dir(req.body);
  var name = req.body.name;
  var pck = req.body.packages.replace(/\r?\n|\r/g, " ").split(',');
  var fold = req.body.folders.replace(/\r?\n|\r/g, " ").split(',');
  var vol = req.body.volumes.replace(/\r?\n|\r/g, " ").split(',');
  var os =req.body.base_os;
  var ports = req.body.ports;

  var info = {base_os: os,
              author: req.body.author,
              packages: pck,
              folders: fold,
              volumes: vol,
              ports: [ports]};


  console.log(info);


  createDockerfile(name,info);


  async.parallel([
    /*
    * First external endpoint
    */
    function(callback) {


      client.scp('./templates/', 'root:1234@172.17.8.101:/opt/', function(err) {
        console.log(err);


      var config = {
              host: '172.17.8.101',
              username: 'root',
              password: '1234'
          },command = 'docker build /opt/'+name+'/.';

      exec(config, command, res, function (error, results, res) {
          if (error) {

              throw error;
          }

          callback(false, results);

      });

    });

    },

  ],
  /*
  * Collate results
  */
  function(err, results) {

    if(err) { console.log(err); res.send(500,"Server Error"); return; }

    var tot = results[0][0];
    var datal = results[0][0];

    //var id = res.split('\n');
    //var iid = id[id.length-2].split(' ')[2];

    console.log(results);

    //res.render('techops', { data:results});
    res.send({data:results});

  }
);





});



app.post('/addimage',function (req, res){

  var p;

  console.dir(req.body);
  var name = req.body.name;
  var repo = req.body.repo;
  var version = req.body.version;
  var id = req.body.namef;


     var config = {
          host: '172.17.8.101',
          username: 'root',
          password: '1234'
      }



    async.parallel([
    /*
    * First external endpoint
    */
    function(callback) {


     
      command = 'docker tag '+id+' '+repo+'/'+name+':'+version;
      console.log(command);
  exec(config, command, res ,function (error, results, res) {
      if (error) {
          throw error;
      }


          callback(false, results);

      });

 

    },


    function(callback) {


      command1 = 'docker push '+repo+'/'+name+':'+version;
  console.log(command1);
  exec(config, command1, res, function (error, results, res) {
      if (error) {
          throw error;
      }

      callback(false, results);


  });


},

  ],
  /*
  * Collate results
  */
  function(err, results) {

    if(err) { console.log(err); res.send(500,"Server Error"); return; }

    var datal = results[0];
    var data2 = results[1];

    //var id = res.split('\n');
    //var iid = id[id.length-2].split(' ')[2];

    console.log(results);

    //res.render('techops', { data:results});
    res.send({data:data2});

  }
);








  });


app.post('/pullimage',function (req, res){

  var p;

  console.dir(req.body);
  var name = req.body.name;
  var host = req.body.host;
  var version = req.body.version;



     var config = {
          host: host,
          username: 'root',
          password: '1234'
      }



    async.parallel([
    /*
    * First external endpoint
    */
    function(callback) {


     
      command = 'docker pull '+'172.17.8.101:5001'+'/'+name+':'+version;
      console.log(command);
  exec(config, command, res ,function (error, results, res) {
      if (error) {
          throw error;
      }


          callback(false, results);

      });

 

    },




  ],
  /*
  * Collate results
  */
  function(err, results) {

    if(err) { console.log(err); res.send(500,"Server Error"); return; }

    var datal = results[0];


    //var id = res.split('\n');
    //var iid = id[id.length-2].split(' ')[2];

    console.log(results);

    //res.render('techops', { data:results});
    res.send({data:results});

  }
);








  });




app.post('/runimage',function (req, res){

  var p;

  console.dir(req.body);
  var name = req.body.name;
   var iname = req.body.iname;
  var ep = req.body.ep;
  var ip = req.body.ip;
   var iip = req.body.iip;



     var config = {
          host: iip,
          username: 'root',
          password: '1234'
      }



    async.parallel([
    /*
    * First external endpoint
    */
    function(callback) {


     
      command = 'docker run -d -it --name '+name+' -p '+ep+':'+ip+' '+iname;
      console.log(command);
  exec(config, command, res ,function (error, results, res) {
      if (error) {
          throw error;
      }


          callback(false, results);

      });

 

    },




  ],
  /*
  * Collate results
  */
  function(err, results) {

    if(err) { console.log(err); res.send(500,"Server Error"); return; }

    var datal = results[0];


    //var id = res.split('\n');
    //var iid = id[id.length-2].split(' ')[2];

    console.log(results);

    //res.render('techops', { data:results});
    res.send({data:results});

  }
);








  });

  

  app.post('/boot',function (req, res){

  var p;


  var name = req.body.host;
   



     var config = {
          host: name,
          username: 'root',
          password: '1234'
      }



    async.parallel([
    /*
    * First external endpoint
    */
    function(callback) {


     
      command = 'journalctl --list-boots';
      console.log(command);
  exec(config, command, res ,function (error, results, res) {
      if (error) {
          throw error;
      }


          callback(false, results);

      });

 

    },




  ],
  /*
  * Collate results
  */
  function(err, results) {

    if(err) { console.log(err); res.send(500,"Server Error"); return; }

    var datal = results[0];


    //var id = res.split('\n');
    //var iid = id[id.length-2].split(' ')[2];

    console.log(results);

    //res.render('techops', { data:results});
    res.send({data:results});

  }
);








  });



    app.post('/bootlog',function (req, res){

  var p;


  var name = req.body.host;
  var boots = req.body.boot;
  var to = req.body.to;
  var from = req.body.from;
  var service = req.body.service;

  var level = req.body.level;
   var lvl = '';
  for( l in level){
      lvl += ' -p '+level[l];
  }

  console.log(lvl);


     var config = {
          host: name,
          username: 'root',
          password: '1234'
      }



    async.parallel([
    /*
    * First external endpoint
    */
    function(callback) {


      if(service != ""){

        command = 'journalctl -b -u '+service+' --since "'+from+'" --until "'+to+'"'+lvl;

      }else{  

        command = 'journalctl -b --since "'+from+'" --until "'+to+'"'+lvl;   
        
        

      
      }

      console.log(command);

  exec(config, command, res ,function (error, results, res) {
      if (error) {
          throw error;
      }


          callback(false, results);

      });

 

    },




  ],
  /*
  * Collate results
  */
  function(err, results) {

    if(err) { console.log(err); res.send(500,"Server Error"); return; }

    var datal = results[0];


    //var id = res.split('\n');
    //var iid = id[id.length-2].split(' ')[2];

   // console.log(results);

    //res.render('techops', { data:results});
    res.send({data:results});

  }
);








  });








app.get('/repo',function (req, res){

  client1.get("http://172.17.8.101:5000/v1/search", function(data, response){
            // parsed response body as js object
            console.log(data);
            // raw response
            res.send(data.results);
            //console.log(response);
        });


});



app.get('/rege',function (req, res){


  res.render('panels');


});





var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

server.timeout = 1000000;

function ensureAuthenticated(req, res, next) {

  if (req.isAuthenticated()) {

    return next();

  }
  res.redirect('/login');
}
