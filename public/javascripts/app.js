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
    children: [
      {
        name: 'detalhe',
        url: '/:usuarioId',
        views: {
          'conteudo@': {
            templateUrl: './views/usuarios.detalhe.html',
            controller: 'UsuariosCtr'
          }
        }
      }
    ]
  });

  $urlRouterProvider.otherwise('/inicio');
});
