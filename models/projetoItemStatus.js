var mongoose = require('mongoose');

var ProjetoItemStatusSchema = new mongoose.Schema({
  item: {type: mongoose.Schema.Types.ObjectId, ref: 'ProjetoItem'},
  usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario'},
  anotacao: String,
  percConcluido: {type: Number, default: 0},
  horasUsadas: {type: Number, default: 0}
});

mongoose.model('ProjetoItemStatus', ProjetoItemStatusSchema);
