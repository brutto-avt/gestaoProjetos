var mongoose = require('mongoose');

var AtividadeSchema = new mongoose.Schema({
  nome: String
});

mongoose.model('Atividade', AtividadeSchema);
