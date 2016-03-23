var mongoose = require('mongoose');

var UsuarioAtividadeSchema = new mongoose.Schema({
  usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario'},
  atividade: {type: mongoose.Schema.Types.ObjectId, ref: 'Atividade'},
  proficiencia: {type: Number, default: 0}
});

mongoose.model('UsuarioAtividade', UsuarioAtividadeSchema);
