var express = require('express');

var app = express();

var fortune = require('./lib/fortune.js');

var nodemailer = require('nodemailer');

var credentials = require('./lib/credentials.js');

var mailTransport = nodemailer. createTransport({
	service:'Gmail',
	auth:{
		user: credentials.gmail.user,
		pass: credentials.gmail.password,
	}
});

var sendmail = function(){
	mailTransport.sendMail({
		from:'"Tails" <tailsxky@gamil.com>',
		to: 'xky900410@163.com',
		subject: 'Email Test!',
		text: 'This is the fucking email test!',
	},function(err){
		if(err) console.error('Error: ' + err);
	});
};

sendmail();

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

/*app.get('/contest/vacation-photo', function(req, res){
            res.render('./contest/vacation-photo');    
});*/

var formidable = require('formidable');

app.get('/contest/vacation-photo',function(req,res){
	var now = new Date();
	res.render('contest/vacation-photo', {
		year: now.getFullYear(),
		month: now.getMonth()
	});
});


app.post('/contest/vacation-photo/:year/:month', function(req, res){
	var form = new formidable.IncomingForm();
		form.parse(req, function(err, fields, files){
		if(err) return res.redirect(303, '/error');
		console.log('received fields:');
		console.log(fields);
		console.log('received files:');
		console.log(files);
		res.redirect(303, '/thank-you');
	});
});

app.get('/thank-you', function(req, res){
            res.render('thank-you');    
});

app.post('/process', function(req, res){
	console.log('Form (from querystring): ' + req.query.form);
console.log('CSRF token (from hidden form field): ' + req.body._csrf);
console.log('Name (from visible form field): ' + req.body.name);
console.log('Email (from visible form field): ' + req.body.email);
//res.redirect(303, '/thank-you');
	if(req.xhr || req.accepts('json,html')==='json'){
// 如果发生错误，应该发送 { error: 'error description' }
		res.send({ success: true });

		} else {
// 如果发生错误，应该重定向到错误页面
res.redirect(303, '/thank-you');
	}
});


app.use(function(req,res,next){
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});

app.post('/newsletter', function(req, res){
	var name = req.body.name || '', email = req.body.email || '';
	// 输入验证
		if(!email.match(VALID_EMAIL_REGEX)) {
			if(req.xhr) return res.json({ error: 'Invalid name email address.' });
		req.session.flash = {
		type: 'danger',
		intro: 'Validation error!',
		message: 'The email address you entered was not valid.',
		};
			return res.redirect(303, '/newsletter/archive');
	}
	new NewsletterSignup({ name: name, email: email }).save(function(err){
		if(err) {
		if(req.xhr) return res.json({ error: 'Database error.' });
			req.session.flash = {
				type: 'danger',
				intro: 'Database error!',
				message: 'There was a database error; please try again later.',
		 };
		return res.redirect(303, '/newsletter/archive');
	}
		if(req.xhr) return res.json({ success: true });
			req.session.flash = {
			type: 'success',
			intro: 'Thank you!',
			message: 'You have now been signed up for the newsletter.',
		};
		return res.redirect(303, '/newsletter/archive');
	});
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


//启动时监听端口

app.listen(app.get('port'), function(){
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl + C to terminate.');
});

