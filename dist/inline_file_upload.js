var slice = [].slice;

(function($, window) {
  var InlineFileUpload;
  InlineFileUpload = (function() {
    InlineFileUpload.prototype.defaults = {
      name: 'file',
      action: void 0,
      method: void 0,
      additionalParams: {},
      ajaxOpts: {}
    };

    function InlineFileUpload($input, options) {
      var $form, base, base1;
      this.$input = $input;
      this.options = $.extend({}, this.defaults, options, this.$input.data('ifu-options'));
      $form = this.$input.closest('form');
      (base = this.options).action || (base.action = $form.attr('action'));
      (base1 = this.options).method || (base1.method = $form.find('[name=_method]').val() || $form.attr('method'));
      this._bindInputChange();
    }

    InlineFileUpload.prototype._baseParams = function() {
      return $.extend({
        inline_file_upload: true
      }, this.options.additionalParams);
    };

    InlineFileUpload.prototype._ajaxUpload = function() {
      var $tmpForm;
      $tmpForm = this._createTemporaryForm();
      return $tmpForm.ajaxSubmit($.extend({
        dataType: 'json',
        data: this._baseParams(),
        uploadProgress: (function(_this) {
          return function(_, __, ___, percentComplete) {
            var base, cbData;
            cbData = {
              percent: percentComplete
            };
            if (typeof (base = _this.options).progress === "function") {
              base.progress(cbData);
            }
            return _this.$input.trigger('inline_file_upload:progress', cbData);
          };
        })(this),
        success: (function(_this) {
          return function(data) {
            var base, cbData;
            cbData = {
              data: data
            };
            if (typeof (base = _this.options).success === "function") {
              base.success(cbData);
            }
            return _this.$input.trigger('inline_file_upload:success', cbData);
          };
        })(this),
        error: (function(_this) {
          return function(xhr) {
            var base, cbData;
            cbData = {
              xhr: xhr
            };
            if (typeof (base = _this.options).error === "function") {
              base.error(cbData);
            }
            return _this.$input.trigger('inline_file_upload:error', cbData);
          };
        })(this),
        complete: (function(_this) {
          return function(xhr) {
            var base, cbData;
            $tmpForm.remove();
            cbData = {
              xhr: xhr
            };
            if (typeof (base = _this.options).complete === "function") {
              base.complete(cbData);
            }
            return _this.$input.trigger('inline_file_upload:complete', cbData);
          };
        })(this)
      }, this.options.ajaxOpts));
    };

    InlineFileUpload.prototype._createTemporaryForm = function() {
      var $oldInput, form;
      form = $("<form action='" + this.options.action + "' method='post' style='position:fixed;left:-9999px;'>\n  <input type='hidden' name='_method' value='" + this.options.method + "' />\n</form>");
      $oldInput = this.$input;
      this.$input = $oldInput.clone().val('').insertBefore($oldInput);
      this._bindInputChange();
      $oldInput.appendTo(form);
      $oldInput.attr('name', this.options.name);
      form.insertBefore(this.$input);
      return form;
    };

    InlineFileUpload.prototype._eventToFilename = function(e) {
      if (e.target.files != null) {
        return e.target.files[0].name;
      } else if (e.target.value) {
        return e.target.value.replace(/^.+\\/, '');
      }
    };

    InlineFileUpload.prototype._onChange = function(e) {
      var base, cbData;
      if (!this.$input.val()) {
        return;
      }
      cbData = {
        filename: this._eventToFilename(e)
      };
      if (typeof (base = this.options).start === "function") {
        base.start(cbData);
      }
      this.$input.trigger('inline_file_upload:start', cbData);
      return this._ajaxUpload();
    };

    InlineFileUpload.prototype._bindInputChange = function() {
      return this.$input.on('change', $.proxy(this._onChange, this));
    };

    return InlineFileUpload;

  })();
  return $.fn.extend({
    inlineFileUpload: function() {
      var args, option;
      option = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return this.each(function() {
        var data;
        data = $(this).data('inline-file-upload');
        if (!data) {
          $(this).data('inline-file-upload', (data = new InlineFileUpload($(this), option)));
        }
        if (typeof option === 'string') {
          return data[option].apply(data, args);
        }
      });
    }
  });
})(window.jQuery, window);
