require('../models/log');
require('../models/projetoItemAtividade');
require('../models/projetoItemStatus');

var mongoose = require('mongoose');
var Log = mongoose.model('Log');
var ProjetoItemStatus = mongoose.model('ProjetoItemStatus');
var ProjetoItemAtividade = mongoose.model('ProjetoItemAtividade');

var ProjetoItemSchema = new mongoose.Schema({
  resumo: String,
  descricao: String,
  prioridade: {type: Number, default: 0},
  deadline: Date,
  status: {type: Number, default: 0},
  projeto: {type: mongoose.Schema.Types.ObjectId, ref: 'Projeto'},
  responsavel: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario'}
});

ProjetoItemSchema.pre('remove', function(next) {
    Log.remove({referencia: this._id}).exec();
    ProjetoItemAtividade.remove({item: this._id}).exec();
    ProjetoItemStatus.remove({item: this._id}).exec();
    next();
});

mongoose.model('ProjetoItem', ProjetoItemSchema);
