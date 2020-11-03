(function (scope, Messaging, webvis) {

  /**
   * WebvisClient wraps the webvis api for workplace messaging.
   * @constructor
   */
  var WebvisClient = function WebvisClient() {

    if (Messaging.isWorkplaceEnv()) {
      //initialize when webvis is ready
      webvis.waitFor("resourceProcessed").then(function () {
        Messaging.createClient().then(this.init.bind(this));
      }.bind(this));
    }
  };

  /**
   * Initialize the messaging client
   * @param client
   */
  WebvisClient.prototype.init = function init(client) {
    client.onConnect(function (from, connection) {
      var listeners = [];
      for (var fn in webvis) {
        if (typeof webvis[fn] === 'function') {
          switch (fn) {
            case 'registerListener':
              connection.registerApi('registerListener', function (eventTypes) {
                var listenerId = webvis.registerListener(eventTypes, function (event) {
                  connection.callApi('eventListenerCallback', {
                    id: event.id,
                    type: event.type,
                    targetNodeID: event.targetNodeID,
                    changeList: event.changeList
                  });
                }, 0, true);
                listeners.push(listenerId);
                return listenerId;
              });
              break;
            case 'unregisterListener':
              connection.registerApi('unregisterListener', function (listenerId) {
                webvis.unregisterListener(listenerId);
              });
            default:
              connection.registerApi(fn, function (fn) {
                var args = Array.prototype.slice.call(arguments, 1);
                console.log('3dviewer -> called webvis.' + fn + '() from ' + from, args);
                return webvis[fn].apply(webvis, args);
              }.bind(this, fn));
          }
        }
      }
      connection.onClose(function () {
        listeners.forEach(function (listenerId) {
          webvis.unregisterListener(listenerId);
        });
      });
    });
  };

  /**
   * Transforms Webvis types into serializable types to be transferred via workplace messaging
   */
  var WebvisTypeFactory = {

  };


  scope.webvisClient = new WebvisClient();

})(window, Messaging, webvis);
