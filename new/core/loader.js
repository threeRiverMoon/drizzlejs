D.Loader = class Loader {

    static CACHE = {};
    static SCRIPT_ROOT = 'app';

    static analyse (name) {
        const args = name.split(':');
        const loader = args.length > 0 ? args.shift() : '';
        return { loader, name: args.shift(), args };
    };

    static register (name, loader) {
        Loader.CACHE[name] = loader;
    };

    static get (parent, loadString) {
        const { loader, name, args } = Loader.analyse(loadString);

        if (!loader && parent && parent._loader) {
            return { name, args, loader: parent._loader };
        }

        return { name, args, loader: Loader.CACHE[loader] };
    };

    constructor (fn) {
        this._fn = fn;
    }

    _load (name, args) {
        const obj = this._doLoad(`${Loader.SCRIPT_ROOT}/${name}`, args);
        if (!obj || !obj.then) {
            return Promise.resolve(obj);
        }
        return obj;
    }

    _doLoad (name, args) {
        return this._fn(name, args);
    }

    _createModuleBuilder () {
        return new Module.Builder();
    }

    createModule (parent, name) {
        const { name: moduleName, args, loader } = Loader.get(parent, name);
        return loader.load(moduleName, args).then(obj => {
            let mod = obj;
            if (isFunction(obj)) {
                const builder = this._createModuleBuilder();
                obj(builder);
                mod = builder._get();
            }

            if (!(mod instanceof D.Module)) throw new Error('Incorrect module definition: ${name}');

            mod.name = moduleName;
            mod._loadString = name;
            return mod;
        });
    }
};