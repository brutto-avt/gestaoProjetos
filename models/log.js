var mongoose = require('mongoose');

var LogSchema = new mongoose.Schema({
  referencia: {type: mongoose.Schema.Types.ObjectId},
  decisao: Number,
  usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario'},
  acao: {type: mongoose.Schema.Types.ObjectId, ref: 'Acao'}
});

mongoose.model('Log', LogSchema);
