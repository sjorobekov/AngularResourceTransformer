var angular = require('angular');

module.exports = angular.module('sjResourceTransformer', [])
  .factory('OnlyTransformer', require('./OnlyTransformerFactory'))
  .factory('DateTransformer', require('./DateTransformerFactory'))
  .name;
