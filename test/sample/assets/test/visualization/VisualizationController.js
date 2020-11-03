angular.module('visualization').controller('VisualizationController',
  ['$scope', 'DocumentModel', 'ClientFactory', 'EventTypes', function ($scope, DocumentModel, ClientFactory, EventTypes) {

    var VisualizationController = function VisualizationController() {

      this.documents = [];
      this.input = new DocumentModel({uri: ''});

      this._tabId = null;

    };

    /**
     * Visualize a document. This will call the webvis function "add" over the message channel.
     */
    VisualizationController.prototype.visualize = function visualize() {
      if (this.input.uri) {
        var me = this;
        me.getWebvisConnection().then(function (webvisConnection) {
          ClientFactory().then(function (client) {
            client.callApi('selectTab', this._tabId);
          });
          webvisConnection.callApi('add', {
            dataURI: me.input.getUri(),
            contentType: me.input.mimeType ? me.input.mimeType : null
          }).then(function (nodeId) {
            $scope.$apply(function () {
              me.input.nodeId = nodeId;
              var doc = me.addDocument(me.input);
              me.enableDocument(doc, true);
              me.input = new DocumentModel();
            });
          });
        });
      }
    };

    /**
     * Remove a document. This will call the webvis function "remove" over the message channel.
     * @param doc
     */
    VisualizationController.prototype.remove = function remove(doc) {
      var me = this;
      if (this._webvisConnection) {
        this.getWebvisConnection().then(function (webvisConnection) {

          // remove a node from webvis
          webvisConnection.callApi('remove', doc.nodeId);

        });
      }
      me.removeDocument(doc);
    };

    /**
     * Event listener for webvis node events.
     * @param event
     * @param event.type
     * @param event.targetNodeID
     */
    VisualizationController.prototype.webvisEventListenerCallback = function webvisEventListenerCallback(event) {
      var me = this;
      var doc = _.find(this.documents, function (d) {
        return event.targetNodeID === d.nodeId;
      });
      $scope.$apply(function () {
        switch (event.type) {
          case EventTypes.NODE_CHANGED:
            if (doc) {
              me.webvisNodeChanged(doc, event);
            }
            break;
          case EventTypes.NODE_REMOVED:
            if (doc) {
              me.removeDocument(doc);
            }
            break;
          default:
            break;
        }
      });
    };

    /**
     * Handle the NODE_CHANGED event from webvis
     * @param event
     * @param event.changeList
     */
    VisualizationController.prototype.webvisNodeChanged = function webvisNodeChanged(doc, event) {
      if (typeof event.changeList.selected !== 'undefined') {
        doc.selected = event.changeList.selected;
      }
      if (typeof event.changeList.enabled !== 'undefined') {
        doc.enabled = event.changeList.enabled;
      }
    };

    /**
     * Select a node in the webvis
     * @param {DocumentModel} doc
     * @param {boolean} [selected]
     */
    VisualizationController.prototype.selectDocument = function selectDocument(doc, selected) {
      if (typeof selected !== 'undefined') {
        doc.selected = selected;
      }
      this.getWebvisConnection().then(function (webvisConnection) {
        if (doc.selected) {
          webvisConnection.callApi('addToSelection', doc.nodeId, true);
        } else {
          webvisConnection.callApi('removeFromSelection', doc.nodeId, true);
        }
      });

    };

    /**
     * Enable (show) a node in the webvis
     * @param {DocumentModel} doc
     * @param {boolean} [enabled]
     */
    VisualizationController.prototype.enableDocument = function enableDocument(doc, enabled) {
      if (typeof enabled !== 'undefined') {
        doc.enabled = enabled;
      }
      this.getWebvisConnection().then(function (webvisConnection) {
        webvisConnection.callApi('setProperty', doc.nodeId, 'enabled', doc.enabled, true);
      });

    };

    /**
     * Returns a promise to the webvis connection.
     * The connection is cached. When the connection has been closed, it will be created again.
     * @returns {Promise}
     */
    VisualizationController.prototype.getWebvisConnection = function getWebvisConnection() {
      var me = this;
      return new Promise(function (resolve, reject) {
        if (this._webvisConnection) {
          resolve(this._webvisConnection);
        } else {
          ClientFactory().then(function (client) {
            client.callApi('openApp', 'vaas').then(function (id) {
              client.callApi('connect', {id: id}).then(function (connection) {
                me._tabId = id;
                connection.registerApi('eventListenerCallback', me.webvisEventListenerCallback.bind(me));
                connection.callApi('registerListener', [EventTypes.NODE_CHANGED, EventTypes.NODE_REMOVED]);
                connection.onClose(function () {
                  me._webvisConnection = null;
                  me._tabId = null;
                });
                me._webvisConnection = connection;
                resolve(connection);
              });
            });
          }).catch(function (reason) {
            reject(reason);
          });
        }
      });
    };

    /**
     * Adds a single document
     * @param input
     */
    VisualizationController.prototype.addDocument = function addDocument(input) {
      var document = new DocumentModel(input);
      this.documents.push(document);
      return document;
    };

    /**
     * Removes a single document
     * @param nodeId
     */
    VisualizationController.prototype.removeDocument = function removeDocument(doc) {
      var index = this.documents.indexOf(doc);
      if (index > -1) {
        this.documents.splice(index, 1);
      }
    };


    $scope.vm = new VisualizationController();

  }]);
