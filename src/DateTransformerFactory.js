var angular = require('angular');
var _ = require('lodash');
var moment = require('moment');

/**
 * @ngdoc service
 * @name components.factory:dateTransformer
 *
 * @description A helper service for use in ng-resource transform methods.
 * Example of usage:
 * <code>
 *    var Session = $resource('/api/sessions/:id', {id: '@id'}, {
   *      query: {
   *        method: 'GET',
   *        isArray: true,
   *        transformResponse: dateTransformer.transformResponse.toDate(['start', 'end'])
   *      },
   *      update: {
   *        method: 'PUT',
   *        transformRequest: dateTransformer.transformRequest.toLocalIsoString(['start', 'end'])
   *      }
   *    });
 * </code>
 *
 * Call Session.query() and fields 'start' and 'end' will be instances of JS Date object in each returned
 * Session object.
 * Call session.$update() and server will receive JSON with 'start' and 'end' fields as strings in
 * ISO format without timezone.
 *
 * Supported transformers: toDate, toLocalIsoString, toZonedIsoString.
 *
 * If you need to transofrm Date objects in request to ISO strings in UTC timezone (2016-01-12T13:48:05.476Z)
 * then just do nothing. All instances of Date and moment objects supports toJSON() method which will
 * be called automatically when serializing objects to JSON.
 *
 * This service uses moment.js for date parsing and format because native JS Date doesn't support
 * dates without timezone (they always parsed as UTC+0).
 *
 * Also Lodash is used for object manipulations.
 *
 */
function DateTransformerFactory($http) {

  var dateTransformer = {

    // params (paths). See transformFn description.
    // returns transform function to use manually in code
    toDate: toDate,
    toLocalIsoString: toLocalIsoString,
    toZonedIsoString: toZonedIsoString,

    // params (paths). See transformFn description.
    // returns $http.defaults.transformResponse.concat(<given transformer>)
    transformResponse: {
      toDate: transformResponseToDate,
      toLocalIsoString: transformResponseToLocalIsoString,
      toZonedIsoString: transformResponseToZonedIsoString
    },

    // params (paths). See transformFn description.
    // returns [<given transformer>].concat($http.defaults.transformRequest)
    transformRequest: {
      toDate: transformRequestToDate,
      toLocalIsoString: transformRequestToLocalIsoString,
      toZonedIsoString: transformRequestToZonedIsoString
    }

  };

  return dateTransformer;

  /**
   * Returns transform function for corresponding paths using given transformDate function to
   * tranform between Date <=> String.
   *
   * @param paths String/Array<String>/Function(clonedObject, transformDate)
   *
   * - Can be String with path to the field to transform. If the field is nested you can use DOT
   *   to split fields in path.
   *
   *   <pre>
   *     Examples:
   *     'createdAt'
   *     'status.closedAt'
   *     'some.deeply.nested.field'
   *   </pre>
   *
   * - Can be array of strings where each string is path.
   *
   *   <pre>
   *     Example:
   *     ['createdAt', 'status.closedAt', 'some.deeply.nested.field']
   *   </pre>
   *
   * - Can be function which receives two values:
   *   - Object clonedObject - copy of original object to transform fields of it.
   *   - Function(Date/String) transformDate - the last parameter of transformFn function will
   *     be passed here.
   *
   *   <pre>
   *     Example:
   *     function (clonedObject, transformDate) {
     *       clonedObject.status.closedAt = transformDate(clonedObject.status.closedAt);
     *     }
   *   </pre>
   *
   * @param transformDate Function(Date/String val) function to tranform between Date <=> String
   * <pre>
   * Example:
   * function (val) { // val is string
     *   return moment(val).toDate();
     * })
   * function (val) { // val is Date
     *   return moment(val).format();
     * })
   * </pre>
   *
   * @returns Function (Array/Object data) - function which will transform fields of data Object. Or if
   * data is Array then it will transform fields of each object in this array.
   * <pre>
   * Example:
   * var data = {
     *   id: 123,
     *   createdAt: '2016-01-12T13:48:05.476Z',
     *   status: {
     *     closedAt: '2016-02-10T12:14:15.123Z'
     *   },
     *   anotherField: 'blabla'
     * }
   * var transform = transformFn(['createdAt', 'status.closedAt'], function (val) {
     *   return moment(val).toDate();
     * });
   * var transformedData = transform(data);
   * // transformedData will be new cloned object
   * // {
     * //   id: 123,
     * //   createdAt: instanse of Date with value of '2016-01-12T13:48:05.476Z',
     * //   status: {
     * //     closedAt: instanse of Date with value of '2016-02-10T12:14:15.123Z'
     * //   },
     * //   anotherField: 'blabla'
     * // }
   * </pre>
   */
  function transformFn(paths, transformDate) {
    return function (data) {
      if (_.isArray(data)) {
        var result = data.map(function (object) {
          return transformObject(object, paths, transformDate);
        });
        _.difference(_.keys(data), _.keys(result)).forEach(function (key) {
          result[key] = data[key];
        });
        return result;
      } else if (_.isObject(data)) {
        return transformObject(data, paths, transformDate);
      }
    };
  }

  function transformObject(object, paths, transformDate) {
    var clonedObject = angular.copy(object),
      val;
    if (_.isFunction(paths)) {
      paths(clonedObject, transformDate);
    } else {
      if (_.isString(paths)) {
        paths = [paths];
      }
      if (_.isArray(paths)) {
        _.forEach(paths, function (path) {
          val = _.get(clonedObject, path);
          if (_.isDate(val) || _.isString(val)) {
            _.set(clonedObject, path, transformDate(val));
          }
        });
      }
    }
    return clonedObject;
  }

  function transformResponseWith(transformer) {
    return $http.defaults.transformResponse.concat(transformer);
  }

  function transformRequestWith(transformer) {
    return [transformer].concat($http.defaults.transformRequest);
  }

  function transformResponseToDate(paths) {
    return transformResponseWith(toDate(paths));
  }

  function transformResponseToLocalIsoString(paths) {
    return transformResponseWith(toLocalIsoString(paths));
  }

  function transformResponseToZonedIsoString(paths) {
    return transformResponseWith(toZonedIsoString(paths));
  }

  function transformRequestToDate(paths) {
    return transformRequestWith(toDate(paths));
  }

  function transformRequestToLocalIsoString(paths) {
    return transformRequestWith(toLocalIsoString(paths));
  }

  function transformRequestToZonedIsoString(paths) {
    return transformRequestWith(toZonedIsoString(paths));
  }

  /**
   * Returns transform function for corresponding paths which will transform
   * fields from string to Date.
   *
   * @param paths String/Array<String>/Function(clonedObject, transformDate)
   * @returns Function (Array/Object data) - function which will transform fields of data Object
   * determined by paths to Date.
   */
  function toDate(paths) {
    return transformFn(paths, function (val) {
      return moment(val).toDate();
    });
  }

  /**
   * Returns transform function for corresponding paths which will transform
   * fields from Date/moment instances to string without timezone (2016-01-12T13:48:05.476).
   *
   * @param paths String/Array<String>/Function(clonedObject, transformDate)
   * @returns Function (Array/Object data) - function which will transform fields of data Object
   * determined by paths to string without timezone.
   */
  function toLocalIsoString(paths) {
    return transformFn(paths, function (val) {
      return moment(val).format('YYYY-MM-DDTHH:mm:ss.SSS');
    });
  }

  /**
   * Returns transform function for corresponding paths which will transform
   * fields from Date/moment instances to string with timezone (2014-09-08T08:02:17+02:00).
   *
   * @param paths String/Array<String>/Function(clonedObject, transformDate)
   * @returns Function (Array/Object data) - function which will transform fields of data Object
   * determined by paths to string with timezone.
   */
  function toZonedIsoString(paths) {
    return transformFn(paths, function (val) {
      return moment(val).format();
    });
  }
}

DateTransformerFactory.$inject = ['$http'];

module.exports = DateTransformerFactory;
