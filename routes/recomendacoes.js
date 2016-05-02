var express = require('express');
var json2csv = require('json2csv');
var request = require('request');
var csv = require('csv');
var C45 = require('c4.5');
var router = express.Router();

var gerarRecomendacoes = function(json, resposavel) {
  csv.parse(data, function(err, data) {
    if (err) console.trace(err);

    var headers = data[0];
    var feats = headers.slice(1, -1);
    var tipos = ['cateogry', 'number', 'category'];
    var treino = data.slice(1).map(function(d) {
      return d.slice(1);
    });
    var alvo = headers[headers.length-1];
    var c45 = C45();

    c45.train({
      data: treino,
      target: alvo,
      features: feats,
      featureTypes: tipos
    }, function(err, modelo) {
      if (err) console.trace(err);
      console.log(modelo);
    });
  });
};

var converterJSON = function(json, responsavel) {
  var dados;
  var campos;

  request('http://localhost:8080/api/logs/usuario/' + responsavel, function(err, res, body) {
    if (!err && res.statusCode == 200) {
      dados = JSON.parse(body);
      campos = Object.keys(dados);

      json2csv({data: dados, fields: campos}, function(err, csv) {
        if (err) console.trace(err);
        return csv;
      });
    }
  });
};

module.exports = router;
