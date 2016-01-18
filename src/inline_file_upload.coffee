(($, window) ->

  class InlineFileUpload
    defaults:
      name: 'file'
      action: undefined
      method: undefined
      additionalParams: {}
      ajaxOpts: {}
      # start: (data) ->
      # progress: (data) ->
      # complete: (data) ->
      # error: (data) ->
      # success: (data) ->

    constructor: ($input, options) ->
      @$input = $input
      @options = $.extend {}, @defaults, options, @$input.data('ifu-options')
      $form = @$input.closest('form')
      @options.action ||= $form.attr('action')
      @options.method ||= ($form.find('[name=_method]').val() ||
                           $form.attr('method'))
      @_bindInputChange()

    _baseParams: ->
      $.extend { inline_file_upload: true }, @options.additionalParams

    _ajaxUpload: ->
      $tmpForm = @_createTemporaryForm()

      $tmpForm.ajaxSubmit($.extend({
        dataType: 'json'
        data: @_baseParams()
        uploadProgress: (_, __, ___, percentComplete) =>
          cbData = { percent: percentComplete }
          @options.progress?(cbData)
          @$input.trigger('inline_file_upload:progress', cbData)
        success: (data) =>
          cbData = { data: data }
          @options.success?(cbData)
          @$input.trigger('inline_file_upload:success', cbData)
        error: (xhr) =>
          cbData = { xhr: xhr }
          @options.error?(cbData)
          @$input.trigger('inline_file_upload:error', cbData)
        complete: (xhr) =>
          $tmpForm.remove()
          cbData = { xhr: xhr }
          @options.complete?(cbData)
          @$input.trigger('inline_file_upload:complete', cbData)
      }, @options.ajaxOpts))

    _createTemporaryForm: ->
      form = $("""
        <form action='#{@options.action}' method='post' style='position:fixed;left:-9999px;'>
          <input type='hidden' name='_method' value='#{@options.method}' />
        </form>
      """)

      $oldInput = @$input
      @$input = $oldInput.clone().val('').insertBefore($oldInput)
      @_bindInputChange()
      $oldInput.appendTo(form)

      # We only add the name immediately before uploading because we
      # don't want to send the input value during submission of an
      # outer form.
      $oldInput.attr('name', @options.name)

      form.insertBefore(@$input)

      form

    _eventToFilename: (e) ->
      if e.target.files?
        e.target.files[0].name
      else if e.target.value
        e.target.value.replace(/^.+\\/, '')

    _onChange: (e) ->
      return unless @$input.val()
      cbData = { filename: @_eventToFilename(e) }
      @options.start?(cbData)
      @$input.trigger('inline_file_upload:start', cbData)
      @_ajaxUpload()

    # FF6 doesn't bubble the 'change' event, so we need to bind
    # directly to the @$input. Since we need to re-bind later,
    # we break this out into a separate method.
    _bindInputChange: ->
      @$input.on 'change', $.proxy(@_onChange, @)

  $.fn.extend inlineFileUpload: (option, args...) ->
    @each ->
      data = $(@).data('inline-file-upload')

      if !data
        $(@).data(
          'inline-file-upload',
          (data = new InlineFileUpload($(@), option))
        )
      if typeof option == 'string'
        data[option].apply(data, args)

) window.jQuery, window
