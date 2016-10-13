var angular = require('angular');

module.exports = function IdTransformerService() {

  this.transformRequest = transformRequest;

  function transformRequest(fields) {
    if (angular.isString(fields)) {
      fields = [fields];
    }

    return function (data) {
      var result;
      if (angular.isString(data)) {
        result = angular.fromJson(data);
      } else {
        result = angular.copy(data);
      }

      fields.forEach(function(field) {
        if (angular.isObject(result[field])) {
          result[field] = result[field].id
        }
      });

      return angular.toJson(result);
    }
  }
};
