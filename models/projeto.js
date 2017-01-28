require('../models/projetoItem');
require('../models/log');

var mongoose = require('mongoose');
var ProjetoItem = mongoose.model('ProjetoItem');
var Log = mongoose.model('Log');

var ProjetoSchema = new mongoose.Schema({
  nome: String,
  prioridade: {type: Number, default: 0},
  deadline: Date,
  status: {type: Number, default: 0},
  responsavel: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario'}
});

ProjetoSchema.pre('remove', function(next) {
    Log.remove({referencia: this._id}).exec();
    ProjetoItem.remove({projeto: this._id}).exec();
    next();
});

mongoose.model('Projeto', ProjetoSchema);
