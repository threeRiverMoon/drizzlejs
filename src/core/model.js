Model = D.Model = function(app, module, options) {
    this.app = app;
    this.module = module;
    options || (options = {});
    this.params = assign({}, options.params);

    parent(Model).call(this, 'D', options);
    this.app.delegateEvent(this);
};

extend(Model, Base, {
    initialize: function() {
        this.data = this.options.data || {};
    },

    url: function() {
        return this.option('url') || '';
    },

    getFullUrl: function() {
        return Request.url(this);
    },

    getParams: function() {
        return assign({}, this.params);
    },

    set: function(data, trigger) {
        var parse = this.options.parse,
            d = D.isFunction(parse) ? parse.call(this, data) : data;

        this.data = this.options.root ? d[this.options.root] : d;
        if (trigger) this.changed();
        return this;
    },

    changed: function() { this.trigger('change'); },

    clear: function(trigger) {
        this.data = D.isArray(this.data) ? [] : {};
        if (trigger) this.changed();
        return this;
    }
});

assign(Model, Factory);