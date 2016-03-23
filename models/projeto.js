var mongoose = require('mongoose');

var ProjetoSchema = new mongoose.Schema({
  nome: String,
  prioridade: {type: Number, default: 0},
  deadline: Date,
  status: {type: Number, default: 0},
  responsavel: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario'}
});

mongoose.model('Projeto', ProjetoSchema);
