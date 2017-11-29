module.exports = function(app){
	app.get('/', function(req, res){ 
            res.render('home');
});

	app.get('/about', function(req, res){
	 
            res.render('about', { fortune: fortune.getFortune() });
});

	app.get('/newsletter', function(req, res){
            res.render('newsletter');    
});

};