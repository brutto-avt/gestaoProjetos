var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var http = require('http');

var acao = require('./routes/acao');
var usuario = require('./routes/usuario');
var projeto = require('./routes/projeto');
var projetoItem = require('./routes/projetoItem');
var atividade = require('./routes/atividade');
var log = require('./routes/log');
var estatistica = require('./routes/estatistica');
var recomendacao = require('./routes/recomendacaoc45');

mongoose.connect('mongodb://localhost/gestaoProjetos');

var app = express();
var server = http.createServer(app);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/acoes', acao);
app.use('/api/atividades', atividade);
app.use('/api/usuarios', usuario);
app.use('/api/projetos', projeto);
app.use('/api/itens', projetoItem);
app.use('/api/logs', log);
app.use('/api/estatisticas', estatistica);
app.use('/api/recomendacoes', recomendacao);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


server.listen(8080);

console.log('Servidor rodando na porta 8080');

module.exports = app;
