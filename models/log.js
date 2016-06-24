var mongoose = require('mongoose');

var LogSchema = new mongoose.Schema({
  referencia: {type: mongoose.Schema.Types.ObjectId},
  decisao: Number,
  usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario'},
  acao: {type: mongoose.Schema.Types.ObjectId, ref: 'Acao'},
  deadline: Date,
  status: Number,
  prioridade: Number,
  itensPriorBaixa: Number,
  itensPriorMedia: Number,
  itensPriorAlta: Number,
  itensPriorUrgente: Number,
  itensSitPendente: Number,
  itensSitDesenvolv: Number,
  itensSitEncerrado: Number,
  itensSitCancelado: Number,
  itensAtrasados: Number,
  itensRisco: Number,
  itensNormais: Number,
  horasUsadasPorItem: Number,
  horasEstimadasPorItem: Number,
  razaoEstimativaPorItem: Number,
  horasUsadasPorMembro: Number,
  horasEstimadasPorMembro: Number,
  razaoEstimativaPorMembro: Number,
  percConcluido: Number,
  horasUsadas: Number,
  horasEstimadas: Number,
  razaoEstimativa: Number,
  diasRestantes: Number,
  situacao: String
});

mongoose.model('Log', LogSchema);
