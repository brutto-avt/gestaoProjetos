var mongoose = require('mongoose');

var UsuarioSchema = new mongoose.Schema({
  nome: String,
  login: String,
  senha: String,
  email: String,
  perfil: {type: Number, default: 0}
});

mongoose.model('Usuario', UsuarioSchema);
