require('../models/usuario');
require('../models/usuarioAtividade');
require('../models/atividade');

var express = require('express');
var mongoose = require('mongoose');
var crypto = require('crypto');
var Usuario = mongoose.model('Usuario');
var UsuarioAtividade = mongoose.model('UsuarioAtividade');
var Atividade = mongoose.model('Atividade');
var router = express.Router();

router.get('/', function(req, res, next) {
  Usuario.find(function(err, usuarios) {
    if(err) return next(err);
    res.json(usuarios);
  });
});

router.get('/:id', function(req, res, next) {
  var query = Usuario.findById(req.params.id);

  query.exec(function(err, usuario) {
    if (err) return next(err);
    if (!usuario) return next(new Error('usuário não encontrado'));
    res.json(usuario);
  });
});

router.post('/', function(req, res, next) {
  var usuario = new Usuario(req.body);
  usuario.senha = crypto.createHash('md5').update(usuario.senha).digest('hex');

  usuario.save(function(err, usuario){
    if(err) return next(err);
    res.json(usuario);
  });
});

router.put('/', function(req, res, next) {
  var query = {'_id': req.body._id};

  Usuario.findOne(query, function (err, usuario) {
    if (err) return next(err);
    if (!usuario) return next(new Error('usuário não encontrado'));
    if (req.body.senha !== usuario.senha) {
      req.body.senha = crypto.createHash('md5').update(req.body.senha).digest('hex');
    }
    Usuario.findOneAndUpdate(query, req.body, {new: true}, function(err, usuario) {
      if (err) return next(err);
      res.json(usuario);
    });
  });
});

router.delete('/:id', function(req, res, next) {
  var query = Usuario.findById(req.params.id);

  query.exec(function(err, usuario) {
    if (err) return next(err);
    if (!usuario) return next(new Error('usuário não encontrado'));
    usuario.remove();
    res.json(usuario);
  });
});

// Login
router.post('/autenticar', function(req, res, next) {
  var query = Usuario.findOne({'login': req.body.login});
  var hash = crypto.createHash('md5').update(req.body.senha).digest('hex');

  query.exec(function(err, usuario) {
    if (err) return next(err);
    if (!usuario) return next(new Error('usuário inválido'));
    if (hash !== usuario.senha) return next(Error('senha incorreta'));
    res.cookie('usuario', usuario._id.toString());
    res.cookie('perfil', usuario.perfil);
    res.json(usuario);
  });
});

// Atividades
router.get('/:id/atividades', function(req, res, next) {
  var query = UsuarioAtividade.find({'usuario': req.params.id});

  query.exec(function(err, atividades) {
    if (err) return next(err);
    res.json(atividades);
  });
});

router.get('/:id/atividades/:atividadeId', function(req, res, next) {
  var query = UsuarioAtividade.findById(req.params.atividadeId).populate('usuario atividade');

  query.exec(function(err, atividade) {
    if (err) return next(err);
    if (!atividade) return next(new Error('atividade não encontrada'));
    res.json(atividade);
  });
});

router.post('/:id/atividades', function(req, res, next) {
  var atividade = new UsuarioAtividade(req.body);

  atividade.usuario = req.params.id;

  atividade.save(function(err, atividade){
    if(err) return next(err);
    res.json(atividade);
  });
});

router.put('/:id/atividades', function(req, res, next) {
  var query = {'_id': req.body._id};

  UsuarioAtividade.findOneAndUpdate(query, req.body, {new: true}, function(err, atividade) {
    if (err) return next(err);
    if (!atividade) return next(new Error('atividade não encontrada'));
    res.json(atividade);
  });
});

router.delete('/:id/atividades/:atividadeId', function(req, res, next) {
  var query = UsuarioAtividade.findById(req.params.atividadeId);

  query.exec(function(err, atividade) {
    if (err) return next(err);
    if (!atividade) return next(new Error('atividade não encontrada'));
    atividade.remove();
    res.json(atividade);
  });
});

module.exports = router;
