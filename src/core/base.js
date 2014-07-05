// Generated by CoffeeScript 1.7.1
(function() {
  var Base,
    __slice = [].slice;

  Drizzle.Base = Base = (function() {
    Base.include = function() {
      var key, mixin, mixins, value, _i, _len;
      mixins = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = mixins.length; _i < _len; _i++) {
        mixin = mixins[_i];
        for (key in mixin) {
          value = mixin[key];
          this.prototype[key] = value;
        }
      }
      return this;
    };

    Base.include(Drizzle.Deferred);

    function Base(idPrefix) {
      this.id = Drizzle.uniqueId(idPrefix);
      this.initialize();
    }

    Base.prototype.initialize = function() {};

    Base.prototype.getOptionResult = function(value) {
      if (D.isFunction(value)) {
        return value.apply(this);
      } else {
        return value;
      }
    };

    Base.prototype.extend = function(mixins) {
      var doExtend, key, value, _results;
      if (!mixins) {
        return;
      }
      doExtend = (function(_this) {
        return function(key, value) {
          var old;
          if (Drizzle.isFunction(value)) {
            old = _this[key];
            console.log(key, value, 'key', old);
            return _this[key] = function() {
              var args;
              args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
              console.log(old, key, value);
              if (old) {
                args.unshift(old);
              }
              return value.apply(this, args);
            };
          } else {
            if (!_this[key]) {
              return _this[key] = value;
            }
          }
        };
      })(this);
      _results = [];
      for (key in mixins) {
        value = mixins[key];
        _results.push(doExtend(key, value));
      }
      return _results;
    };

    return Base;

  })();

}).call(this);