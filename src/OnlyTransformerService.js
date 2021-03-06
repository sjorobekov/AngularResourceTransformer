var angular = require('angular');
var _ = require('lodash');

module.exports = function OnlyTransformerService() {

  this.transformRequest = transformRequest;

  function transformRequest(fields) {
    if (!angular.isArray(fields)) {
      fields = [fields];
    }

    return function (data) {
      var result;
      if (angular.isString(data)) {
        result = angular.fromJson(data);
      } else {
        result = angular.copy(data);
      }

      result = _.pick(result, fields);

      return angular.toJson(result);
    }
  }
};
