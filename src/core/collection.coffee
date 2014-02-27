define [
    'backbone'
    'underscore'
], (Backbone, _) ->

    class Collection extends Backbone.Collection
        constructor: (models, options = {}) ->
            @options = options
            @params = {}
            @url = options.url

            if @options.pageable
                @options.pagination =
                    page: options.page or 1
                    pageSize: options.pageSize or 10
                    pageKey: options.pageKey or '_page'
                    pageSizeKey: options.pageSizeKey or '_pageSize'
                    recordCountKey: options.recordCountKey or 'recordCount'
                @turnPage = (page, options) ->
                    return if page > @options.pagination.pageCount or page < 1

                    @options.pagination.page = page
                    @fetch(options)

                @nextPage = (options) ->
                    page = @options.pagination.page + 1
                    @turnPage page, options

                @prevPage = (options) ->
                    page = @options.pagination.page - 1
                    @turnPage page, options

                @getPageInfo = ->
                    p = @options.pagination
                    return {} if not p
                    d =
                        start: (p.page - 1) * p.pageSize + 1
                        end: p.page * p.pageSize
                        total: p.recordCount
                    d.end = if d.end > d.total then d.total else d.end
                    d

            super

        parse: (resp, options) ->
            if @options.pageable
                p = @options.pagination
                p.recordCount = resp[p.recordCountKey]
                p.pageCount = Math.ceil(p.recordCount / p.pageSize)

            if @options.root then resp[@options.root] else resp

        fetch: (options) ->
            data = _.extend {}, @options.params, @params
            if @options.pageable
                p = @options.pagination
                data[p.pageKey] = p.page
                data[p.pageSizeKey] = p.pageSize

            options or (options = {})
            data = _.extend data, options.data
            options.data = data

            super options
