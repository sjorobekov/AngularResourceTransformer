var angular = require('angular');

module.exports = angular.module('sjResourceTransformer', [])
  .service('IdTransformer', require('./IdTransformerService'))
  .service('OnlyTransformer', require('./OnlyTransformerService'))
  .service('DateTransformer', require('./DateTransformerService'))
  .name;
