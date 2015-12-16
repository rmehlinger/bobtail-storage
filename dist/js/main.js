// Generated by CoffeeScript 1.9.2
(function() {
  var _, __boolPrefix, __jsonPrefix, __nullPrefix, __numberPrefix, __prefix, __storageTypeKey, boolPrefix, getType, jsonPrefix, nullPrefix, numberPrefix, prefixFuncs, rx, storageMapObject, types;

  rx = window.rx, _ = window._;

  window.rxStorage = {};

  __prefix = "__4511cb3d-d420-4a8c-8743-f12ef5e45c3e__reactive__storage";

  __storageTypeKey = window.rxStorage.__storageTypeKey = __prefix + "__type";

  __jsonPrefix = __prefix + "__json__";

  __boolPrefix = __prefix + "__bool__";

  __numberPrefix = __prefix + "__number__";

  __nullPrefix = __prefix + "__null__";

  jsonPrefix = window.rxStorage.__jsonPrefix = function(k) {
    return "" + __jsonPrefix + k;
  };

  boolPrefix = window.rxStorage.__boolPrefix = function(k) {
    return "" + __boolPrefix + k;
  };

  numberPrefix = window.rxStorage.__numberPrefix = function(k) {
    return "" + __numberPrefix + k;
  };

  nullPrefix = window.rxStorage.__nullPrefix = function(k) {
    return "" + __nullPrefix + k;
  };

  types = {
    string: {
      prefixFunc: _.identity,
      serialize: _.identity,
      deserialize: _.identity,
      name: 'string'
    },
    number: {
      prefixFunc: numberPrefix,
      serialize: _.identity,
      deserialize: parseFloat,
      name: 'number'
    },
    array: {
      prefixFunc: jsonPrefix,
      serialize: JSON.stringify,
      deserialize: JSON.parse,
      name: 'array'
    },
    object: {
      prefixFunc: jsonPrefix,
      serialize: JSON.stringify,
      deserialize: JSON.parse,
      name: 'object'
    },
    boolean: {
      prefixFunc: boolPrefix,
      serialize: function(v) {
        if (v) {
          return "true";
        } else {
          return "false";
        }
      },
      deserialize: function(v) {
        if (v === 'true') {
          return true;
        } else if (v === 'false') {
          return false;
        } else {
          return void 0;
        }
      },
      name: 'boolean'
    },
    "null": {
      prefixFunc: nullPrefix,
      serialize: _.identity,
      name: 'null',
      deserialize: function() {
        return null;
      }
    }
  };

  prefixFuncs = _.chain(types).values().pluck('prefixFunc').uniq().value();

  getType = function(v) {
    if (v === null) {
      return types["null"];
    } else {
      return types[typeof v];
    }
  };

  storageMapObject = function(storageType) {
    var _getItem, _removeItem, _setItem, defaultState, safeRemove, storageMap, windowStorage, writeGuard;
    windowStorage = window[storageType + "Storage"];
    if (windowStorage[__storageTypeKey] == null) {
      windowStorage[__storageTypeKey] = storageType;
    }
    defaultState = function() {
      var r;
      r = {};
      r[__storageTypeKey] = storageType;
      return r;
    };
    storageMap = rx.map(windowStorage);
    writeGuard = false;
    window.addEventListener('storage', function(arg) {
      var key, newValue, oldValue, storageArea;
      key = arg.key, newValue = arg.newValue, oldValue = arg.oldValue, storageArea = arg.storageArea;
      if (storageArea[__storageTypeKey] === storageType) {
        if (key == null) {
          return storageMap.update(defaultState());
        } else if (newValue !== oldValue) {
          writeGuard = true;
          storageMap.put(key, newValue);
          return writeGuard = false;
        }
      }
    });
    rx.autoSub(storageMap.onAdd, function(arg) {
      var k, n;
      k = arg[0], n = arg[1];
      if (!writeGuard && windowStorage.getItem(k) !== n) {
        return windowStorage.setItem(k, n);
      }
    });
    rx.autoSub(storageMap.onChange, function(arg) {
      var k, n, o;
      k = arg[0], o = arg[1], n = arg[2];
      if (!writeGuard && windowStorage.getItem(k) !== n) {
        return windowStorage.setItem(k, n);
      }
    });
    rx.autoSub(storageMap.onRemove, function(arg) {
      var k, o;
      k = arg[0], o = arg[1];
      return windowStorage.removeItem(k);
    });
    safeRemove = function(k) {
      var map;
      map = rx.snap(function() {
        return storageMap.all();
      });
      if (k in map) {
        return storageMap.remove(k);
      }
    };
    _removeItem = function(k) {
      if (k !== __storageTypeKey) {
        return rx.transaction(function() {
          return prefixFuncs.forEach(function(func) {
            return safeRemove(func(k));
          });
        });
      }
    };
    _getItem = function(k) {
      var t;
      t = _.chain(types).values().find(function(v) {
        return storageMap.get(v.prefixFunc(k));
      }).value();
      return t != null ? t.deserialize(storageMap.get(t.prefixFunc(k))) : void 0;
    };
    _setItem = function(k, v) {
      if (k !== __storageTypeKey) {
        return rx.transaction(function() {
          var o, type;
          o = _getItem(k);
          if (o !== v) {
            if (typeof o !== typeof v) {
              safeRemove(k);
            }
            type = getType(v);
            return storageMap.put(type.prefixFunc(k), type.serialize(v));
          }
        });
      }
    };
    return {
      getItem: function(k) {
        return rx.snap(function() {
          return _getItem(k);
        });
      },
      getItemBind: function(k) {
        return rx.bind(function() {
          return _getItem(k);
        });
      },
      removeItem: function(k) {
        return rx.transaction(function() {
          return _removeItem(k);
        });
      },
      setItem: function(k, v) {
        return _setItem(k, v);
      },
      clear: function() {
        return storageMap.update(defaultState());
      },
      onAdd: storageMap.onAdd,
      onRemove: storageMap.onRemove,
      onChange: storageMap.onChange
    };
  };

  window.rxStorage.local = storageMapObject("local");

  window.rxStorage.session = storageMapObject("session");

}).call(this);

//# sourceMappingURL=main.js.map
