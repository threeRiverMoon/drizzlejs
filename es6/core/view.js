D.View = class View extends ActionCreator {
    _initialize () {
        this.bindings = {};

        super._initialize();
        this._initializeDataBinding();
    }

    _initializeDataBinding () {
        this._dataBinding = {};
        mapObj(this._option('bindings'), (value, key) => {
            let model = this.bindings[key] = this.module.store[key];
            if (!model) this._error('No model:', key);

            if (!value) return;
            this._dataBinding[key] = {model, value, fn: () => {
                if (value === true && this._region) this.render(this.renderOptions);
                if (D.isString(value)) this._option(value);
            }};
        });
    }

    _bindData () {
        mapObj(this._dataBinding, (value, key) => this.listenTo(value.model, 'change', value.fn));
    }

    _unbindData () {
        this.stopListening();
        this.bindings = {};
    }

    _setRegion (...args) {
        super._setRegion(...args);
        this._bindData();
    }

    _close (...args) {
        this.chain(super._close(...args), this._unbindData, this);
    }

    _serializeData () {
        let data = super._serializeData();
        mapObj(this.bindings, (value, key) => data[key] = value.get(true));
        mapObj(this._option('dataForTemplate'), (value, key) => data[key] = value.call(this, data));
        return data;
    }

};