angular.module('app', [
  'ngCookies',
  'ui.router',
  'ui.router.stateHelper'
]);

angular.module('app').config(function(stateHelperProvider, $urlRouterProvider) {
  stateHelperProvider
    .state({
      name: 'login',
      url: '/login',
      views: {
        'conteudo@': {
          templateUrl: './views/login.html'
        }
      }
    })
    .state({
      name: 'inicio',
      url: '/inicio',
      views: {
        'conteudo@': {
          templateUrl: './views/dashboard.html'
        }
      }
    })
    .state({
      name: 'usuarios',
      url: '/equipe',
      views: {
        'conteudo@': {
          templateUrl: './views/usuarios.html',
          controller: 'UsuariosCtr'
        }
      },
      children: [{
        name: 'detalhe',
        url: '/:usuarioId',
        views: {
          'conteudo@': {
            templateUrl: './views/usuarios.detalhe.html',
            controller: 'UsuariosCtr'
          }
        }
      }]
    })
    .state({
      name: 'atividades',
      url: '/atividades',
      views: {
        'conteudo@': {
          templateUrl: './views/atividades.html',
          controller: 'AtividadesCtr'
        }
      },
      children: [{
        name: 'detalhe',
        url: '/:atividadeId',
        views: {
          'conteudo@': {
            templateUrl: './views/atividades.detalhe.html',
            controller: 'AtividadesCtr'
          }
        }
      }]
    })
    .state({
        name: 'projetos',
        url: '/projetos',
        views: {
          'conteudo@': {
            templateUrl: './views/projetos.html',
            controller: 'ProjetosCtr'
          }
        },
        children: [{
            name: 'detalhe',
            url: '/:projetoId',
            views: {
              'conteudo@': {
                templateUrl: './views/projetos.detalhe.html',
                controller: 'ProjetosCtr'
              }
            },
            children: [{
                name: 'item',
                url: '/:itemId',
                views: {
                  'conteudo@': {
                    templateUrl: './views/projetos.detalhe.item.html',
                    controller: 'ProjetosCtr'
                  }
                },
                children: [{
                  name: 'estimativas',
                  url: '/estimativas',
                  views: {
                    'conteudo@': {
                      templateUrl: './views/estimativas.html',
                      controller: 'EstimativasCtr'
                    }
                  },
                  children: [{
                    name: 'detalhe',
                    url: '/:estimativaId',
                    views: {
                      'conteudo@': {
                        templateUrl: './views/estimativas.detalhe.html',
                        controller: 'EstimativasCtr'
                      }
                    }
                  }]
                }
              ]
            }
          ]
        }
      ]
    });

$urlRouterProvider.otherwise('/inicio');
});
