angular.module('visualization').factory('DocumentModel', function() {

  var DocumentModel = function DocumentModel(config) {
    angular.merge(this, {
      nodeId: null,
      uri: '',
      selected: false,
      enabled: false,
      mimeType: ''
    }, config);
  };

  /**
   * Create a URN from the dokuId
   * @returns {string}
   */
  DocumentModel.prototype.getUri = function() {
      if(this.mimeType === 'model/jt') {
          return 'urn:bmw:prisma:dokuid:' + this.uri;
      } else {
          return this.uri;
      }
  };

  return DocumentModel;

});
