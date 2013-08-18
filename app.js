
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , data = require('./routes/data')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/clear', data.clear);
app.get('/load', data.load);
app.get('/showBlog', data.list);
app.get('/add', data.addForm);
app.post('/add', data.addRecord);
app.get('/update/:_id', data.updateForm);
app.post('/update/:_id', data.updateRecord);
app.get('/remove/:_id', data.remove);
app.get('/search', data.searchForm);
app.get('/sort', data.sortForm);
app.get('/about', data.about);
app.post('/search', data.doSearch);
app.post('/sort', data.doSort);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
