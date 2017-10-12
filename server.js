
const http=require('http');
const querystring=require('querystring');
const urlLib=require('url');
const fs=require('fs');
const EventEmitter=require('events').EventEmitter;

var E=new EventEmitter();

var port = 9797;
http.createServer(function(req,res){
    //解析get数据
    E.emit('get-parse',req,res);
}).listen(port);
console.log('http://10.10.1.164:' + port )
E.on('get-parse',function(req,res){
    req.get=urlLib.parse(req.url,true).query;
    req.url=urlLib.parse(req.url,true).pathname;

    //解析post
    E.emit('post-parse',req,res);
});

E.on('post-parse',function(req,res){
    var str='';
    req.on('data',function(s){
        str+=s;
    });
    req.on('end',function(){
        req.post=querystring.parse(str);

        //解析cookie
        E.emit('cookie-parse',req,res);
    });
});

E.on('cookie-parse',function(req,res){
    req.cookie=querystring.parse(req.headers.cookie,'; ');

    //解析session
    E.emit('session-parse',req,res);
});

E.on('session-parse',function(req,res){
    if(!req.cookie.sessid){
        req.cookie.sessid=''+Date.now()+Math.random();
    }

    E.emit('read-session',req,res);
});

E.on('read-session',function(req,res){
    fs.readFile('session/'+req.cookie.sessid,function(err,data){
        if(err){
            req.session={};
        }else{
            req.session=JSON.parse(data.toString());
        }

        E.emit('buss-do',req,res);
    });
});

E.on('buss-do',function(req,res){
    res.setHeader('set-cookie','sessid='+req.cookie.sessid);

    var b=E.emit(req.url,req,res);

    if(b==false){ //文件读取
        E.emit('read-file',req,res);
    }

    //业务
    if(req.session.visite){
        req.session.visite++;
    }else{
        req.session.visite=1;
    }



});

E.on('read-file',function(req,res){
    fs.readFile(req.url.substring(1),function(err,data){
        if(err){
            res.writeHeader(404,null);
            res.write('404');
            res.end();
        }else{
            res.write(data);
            res.end();
        }
    });
});
E.on('/get',function(req,res){
    res.write(JSON.stringify({
        msg:"getget"
    }));
    E.emit('write-session',req,res);
});

E.on('write-session',function(req,res){
    fs.writeFile('session/'+req.cookie.sessid,JSON.stringify(req.session),function(err){
        E.emit('end-over',req,res);
    });
});

E.on('end-over',function(req,res){
    //res.write('解析数据完成');
    res.end();
});








