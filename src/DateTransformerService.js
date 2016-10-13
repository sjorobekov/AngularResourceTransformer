var angular = require('angular');
var moment = require('moment');

module.exports = function DateTransformerService() {
  'use strict';

  this.toDate = toDate;
  this.toString = toString;

  /**
   *
   * @param {String|Array} fields
   * @returns {Function}
   */
  function toDate(fields) {
    return function (data) {
      if (angular.isString(data)) {
        data = angular.fromJson(data);
      }

      if (angular.isArray(data)) {
        data.forEach(function (item) {
          itemToDate(item, fields);
        });
      } else {
        itemToDate(data, fields);
      }

      return data;
    }
  }

  /**
   *
   * @param {String|Array} fields
   * @param {String|null} format
   * @returns {Function}
   */
  function toString(fields, format) {
    return function (data) {
      if (angular.isString(data)) {
        data = angular.fromJson(data);
      }

      if (angular.isArray(data)) {
        data.forEach(function (item) {
          itemToString(item, fields, format);
        });
      } else {
        itemToString(data, fields, format);
      }

      return angular.toJson(data);
    }
  }

  /**
   *
   * @param {Object} item
   * @param {Array} fields
   * @return {Date}
   */
  function itemToDate(item, fields) {
    fields = angular.isString(fields) ? [fields] : fields;

    fields.forEach(function (field) {
      if (!angular.isDate(item[field])) {
        item[field] = moment(item[field]).toDate();
      }
    });
  }



  /**
   *
   * @param {Object} item
   * @param {Array} fields
   * @param {String} format
   * @returns {String}
   */
  function itemToString(item, fields, format) {
    fields = angular.isString(fields) ? [fields] : fields;

    fields.forEach(function (field) {
      item[field] = moment(item[field]).format(format);
    });
  }
};
