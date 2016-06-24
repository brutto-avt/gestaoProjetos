var mongoose = require('mongoose');

var RecomendacaoSchema = new mongoose.Schema({
  referencia: {type: mongoose.Schema.Types.ObjectId},
  usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario'},
  decisao: String,
  visualizada: Boolean
});

mongoose.model('Recomendacao', RecomendacaoSchema);
