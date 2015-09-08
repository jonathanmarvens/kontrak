/*
 ****************************************************************************
 * Copyright 2015 Jonathan Barronville <jonathan@belairlabs.com>            *
 *                                                                          *
 * Licensed under the Apache License, Version 2.0 (the "License");          *
 * you may not use this file except in compliance with the License.         *
 * You may obtain a copy of the License at                                  *
 *                                                                          *
 *     http://www.apache.org/licenses/LICENSE-2.0                           *
 *                                                                          *
 * Unless required by applicable law or agreed to in writing, software      *
 * distributed under the License is distributed on an "AS IS" BASIS,        *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *
 * See the License for the specific language governing permissions and      *
 * limitations under the License.                                           *
 ****************************************************************************
 */

'use strict'

var _
var contracts
var flatten
var generateContractFunction
var maybe
var types
var unit

_ = require('lodash')

generateContractFunction = function (typeCheckFunction, errorMessage) {
  return function (value) {
    if (typeCheckFunction(value)) {
      return value
    } else {
      throw new TypeError(errorMessage)
    }
  }
}

types = {
  isArray: _.isArray,
  isBoolean: _.isBoolean,
  isFunction: _.isFunction,
  isNull: _.isNull,
  isNumber: _.isNumber,
  isObject: _.isObject,
  isPlainObject: _.isPlainObject,
  isString: _.isString,
  isUndefined: _.isUndefined
}

// types.isFloat = function (value) {
//   return (
//     types.isNumber(value) &&
//     (! types.isInteger(value))
//   )
// }

// types.isInteger = function (value) {
//   return (Number.isInteger || function (value) {
//     return (
//       types.isNumber(value) &&
//       isFinite(value) &&
//       (Math.floor(value) === value)
//     )
//   })(value)
// }

contracts = {
  any: function (value) {
    return value
  },

  array: generateContractFunction(types.isArray, 'Expected an array!'),
  boolean: generateContractFunction(types.isBoolean, 'Expected a boolean!'),
  // float: generateContractFunction(types.isFloat, 'Expected a float!'),
  function: generateContractFunction(types.isFunction, 'Expected a function!'),
  // integer: generateContractFunction(types.isInteger, 'Expected an integer!'),
  null: generateContractFunction(types.isNull, 'Expected null!'),
  number: generateContractFunction(types.isNumber, 'Expected a number!'),
  object: generateContractFunction(types.isObject, 'Expected an object!'),
  plainObject: generateContractFunction(types.isPlainObject, 'Expected a plain object!'),
  string: generateContractFunction(types.isString, 'Expected a string!'),
  undefined: generateContractFunction(types.isUndefined, 'Expected undefined!'), // NOTE(@jonathanmarvens): I can't believe I just wrote that. Damn it, JavaScript.
}

contracts.arrayOf = function (contract) {
  return function (array) {
    array = contracts.array(array)
    return _(array)
      .map(contract)
      .value()
  }
}

maybe = function (contract) {
  return function (context) {
    if (context instanceof maybe.Nothing) {
      return context
    } else if (context instanceof maybe.Just) {
      return maybe.just(
        contract(context.value))
    } else {
      throw new TypeError('Expected an object derived from Nothing or Just.')
    }
  }
}

maybe.Maybe = (function () {
  var Maybe_

  Maybe_ = function () {}

  Maybe_.prototype.get = function (valueIfNothing) {
    if (types.isUndefined(valueIfNothing)) {
      valueIfNothing = null
    }
    if (this instanceof maybe.Just) {
      return this.value
    } else {
      return valueIfNothing
    }
  }

  return Maybe_
})()

maybe.Just = (function () {
  var Just_

  Just_ = function (value) {
    Object.defineProperty(this, 'value', {
      value: value,
      writable: true
    })
  }

  Just_.prototype = Object.create(maybe.Maybe.prototype)

  Just_.prototype.toString = function () {
    return ('Just(' + this.value + ')')
  }

  return Just_
})()

maybe.Nothing = (function () {
  var Nothing_

  Nothing_ = function () {}

  Nothing_.prototype = Object.create(maybe.Maybe.prototype)

  Nothing_.prototype.toString = function () {
    return 'Nothing'
  }

  return Nothing_
})()

maybe.just = maybe.j = function (value) {
  return new maybe.Just(value)
}

maybe.nothing_ = new maybe.Nothing()

maybe.nothing = maybe.n = function () {
  return maybe.nothing_
}

flatten = function (forMaybe) {
  if (forMaybe === true) {
    return function (contract) {
      return function (context) {
        context = maybe(
          maybe(contract))(context)
        if (context instanceof maybe.Just) {
          context = context.value
        }
        return maybe(contract)(context)
      }
    }
  } else {
    return function (contract) {
      return function (array) {
        var result
        array = contracts.arrayOf(
          contracts.arrayOf(contract))(array)
        result = []
        for (var i = 0, j = array.length; i < j; i++) {
          result = _(result)
            .concat(array[i])
            .value()
        }
        return contracts.arrayOf(contract)(result)
      }
    }
  }
}

unit = function (forMaybe) {
  if (forMaybe === true) {
    return function (contract) {
      return function (value) {
        value = contract(value)
        return maybe(contract)(
          maybe.just(value))
      }
    }
  } else {
    return function (contract) {
      return function (value) {
        value = contract(value)
        return contracts.arrayOf(contract)([value])
      }
    }
  }
}

module.exports = exports = {
  contracts: contracts,

  flatten: {
    arrayOf: flatten(false),
    maybe: flatten(true)
  },

  maybe: maybe,

  unit: {
    arrayOf: unit(false),
    maybe: unit(true)
  }
}

exports.c = exports.contracts
exports.f = exports.flatten
exports.f.a = exports.f.arrayOf
exports.f.m = exports.f.maybe
exports.m = exports.maybe
exports.u = exports.unit
exports.u.a = exports.u.arrayOf
exports.u.m = exports.u.maybe
