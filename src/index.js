import angular from 'angular';

export default angular.module('sjResourceTransformer', [])
  .factory('OnlyTransformer', require('./OnlyTransformerFactory'))
  .factory('DateTransformer', require('./DateTransformerFactory'))
  .name;
