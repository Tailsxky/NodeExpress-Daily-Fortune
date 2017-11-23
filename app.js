var express = require('express');

var app = express();

var fortune = require('./lib/fortune.js');

//handlebar view temp

var handlebars = require('express-handlebars').create({ defaultLayout:'main', helpers: {
            section: function (name, options) {
                if (!this._sections) {
                    this._sections = {};
                }
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    });   

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3300);

app.use(express.static(__dirname + '/public'));

app.use(require('body-parser')());


app.get('/', function(req, res){ 
            res.render('home');
});

app.get('/about', function(req, res){
	 
            res.render('about', { fortune: fortune.getFortune() });
});

app.get('/newsletter', function(req, res){
            res.render('newsletter');    
});

app.get('/thank-you', function(req, res){
            res.render('thank-you');    
});

app.post('/process', function(req, res){
	console.log('Form (from querystring): ' + req.query.form);
console.log('CSRF token (from hidden form field): ' + req.body._csrf);
console.log('Name (from visible form field): ' + req.body.name);
console.log('Email (from visible form field): ' + req.body.email);
res.redirect(303, '/thank-you');
	/*if(req.xhr || req.accepts('json,html')==='json'){
// 如果发生错误，应该发送 { error: 'error description' }
		res.send({ success: true });
		} else {
// 如果发生错误，应该重定向到错误页面
res.redirect(303, '/thank-you');
	}*/
});

//404page

app.use(function(req,res){
	//res.type('text/plain');
	res.status(404);
	res.render('404');
});

//500page

app.use(function(err,req,res,next){
	console.error(err.stack);
	//res.type('text/plain');
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function(){
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl + C to terminate.');
});

