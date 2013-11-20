define [
    'jquery', 'underscore', 'handlebars'
    './base', './config', './region', './loader', './module', './loaders/simple'
    './helpers'
], ($, _, Handlebars, Base, config, Region, Loader, Module, SimpleLoader, helpers) ->

    getPath = (root, path) ->
        return root if not path
        if path.charAt(0) is '/' then path else Base.joinPath root, path

    class Application extends Base
        constructor: (@options = {}) ->
            @name = 'application'
            @scriptRoot = @options.scriptRoot or config.scriptRoot
            @urlRoot = @options.urlRoot or config.urlRoot
            @urlSuffix = @options.urlSuffix or config.urlSuffix
            @modules = new Module.Container('Default Module Container')
            @global = {}
            @loaders = {}
            @regions = []

            super

        initialize: ->
            @registerLoader new Loader(@), true
            @registerLoader new SimpleLoader(@)
            @registerHelper key, value for key, value of helpers
            @setRegion 'Region Body', $(document.body)

        path: (path) ->
            getPath @scriptRoot, path

        url: (paths..., base) ->
            withSuffix = (p) =>
                p = p.substring 0, p.length - 1 if p.charAt(p.length - 1) is '/'
                if @urlSuffix then p + @urlSuffix else p
            return withSuffix base.substring 1 if base.charAt(0) is '/'
            paths.unshift @urlRoot
            while base.indexOf('../') is 0
                paths.pop()
                base = base.substring 3
            paths.push base
            withSuffix Base.joinPath.apply(Base, paths)

        registerLoader: (loader, isDefault) ->
            @loaders[loader.name] = loader
            @defaultLoader = loader if isDefault

        registerHelper: (name, fn)->
            app = @
            Handlebars.registerHelper name, (args...) ->
                fn.apply @, [app, Handlebars].concat args

        getLoader: (name) ->
            {loader} = Loader.analyse name
            if loader and @loaders[loader] then @loaders[loader] else @defaultLoader

        setRegion: (name, el) ->
            @region = new Region @, null, name, el
            @regions.unshift @region

        startRoutes: ->

        load: (names...) ->
            @chain (@getLoader(name).loadModule name for name in names)

        show: (feature, options) ->
            @region.show feature, options
