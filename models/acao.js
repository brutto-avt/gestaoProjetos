var mongoose = require('mongoose');

var AcaoSchema = new mongoose.Schema({
  descricao: String,
  referencia: String
});

mongoose.model('Acao', AcaoSchema);
