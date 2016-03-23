var mongoose = require('mongoose');

var ProjetoItemSchema = new mongoose.Schema({
  resumo: String,
  descricao: String,
  prioridade: {type: Number, default: 0},
  deadline: Date,
  status: {type: Number, default: 0},
  projeto: {type: mongoose.Schema.Types.ObjectId, ref: 'Projeto'},
  responsavel: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario'}
});

mongoose.model('ProjetoItem', ProjetoItemSchema);
