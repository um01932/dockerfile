angular.module('visualization', [])
  .constant('EventTypes', {
    NODE_CHANGED: 0,
    NODE_ADDED: 1,
    NODE_REMOVED: 2
  })
  .factory('ClientFactory', function () {
    var clientPromise = new Promise(function() {});
    if (Messaging.isWorkplaceEnv()) {
      clientPromise = Messaging.createClient();
    }
    return function () {
      return clientPromise;
    }
  });
