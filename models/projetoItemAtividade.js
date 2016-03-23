var mongoose = require('mongoose');

var ProjetoItemAtividadeSchema = new mongoose.Schema({
  projeto: {type: mongoose.Schema.Types.ObjectId, ref: 'Projeto'},
  item: {type: mongoose.Schema.Types.ObjectId, ref: 'ProjetoItem'},
  avaliacao: {type: Number, default: 0}
});

mongoose.model('ProjetoItemAtividade', ProjetoItemAtividadeSchema);
