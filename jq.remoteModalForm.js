/*!
 * Confirmation modal attachment, require Twitter Bootstrap modal plugin
 */
;(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = 'remoteModalForm',
        defaults = {
            //something default?
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;

        this.options = $.extend( {}, defaults, options) ;

        this._defaults  = defaults;
        this._name      = pluginName;

        this.modal           = null;
        this.redirectSuccess = null;
        this.redirectError   = null;

        this.init();              //initialize
    }

    // Plugin constructor
    Plugin.prototype.init = function () {

        // console.log($(this.element));
        if (!this.isModalExists()) {
            this.createModal();
        };

        //assign confirmation modal
        this.attachModal();
    };

    Plugin.prototype.createModal = function () {
        var element = $('<div id="modalForm" class="modal hide" role="dialog" aria-labelledby="dataConfirmLabel" aria-hidden="true"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button></div><div class="modal-body"></div><div class="modal-footer"><button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button></div></div>');

        $('body').append(element);

    };

    Plugin.prototype.isModalExists = function () {

        return $('#modalForm').length;
    };

    Plugin.prototype.attachFormSubmit = function () {
        self = this;
        this.modal.find('.modal-body').on('submit', 'form', function() {
            var form = $(this);
            var querystring = form.serialize();
            $.post(form.attr('action'), querystring, function(data) {

                if (data.verdict == 'success') {
                    //refresh list or reload window
                    if (self.redirectSuccess) {
                        window.location = self.redirectSuccess;
                    };
                } else {
                    //error - replace the form with populated errors
                    if (self.redirectError) {
                        window.location = self.redirectError;
                    };
                }

                form.parent().empty().append(data.content);
            }, 'json');

            return false;
        });
    };

    //assign change events
    Plugin.prototype.attachModal = function () {
        var self = this;
        this.modal = $('#modalForm');
        $(this.element).click(function(ev) {
            var href  = $(this).attr('href');
            var title = $(this).attr('data-modal-title');

            if ($(this).data('modal-redirect-success')) {
                self.redirectSuccess = $(this).data('modal-redirect-success');
            };

            if ($(this).data('modal-redirect-error')) {
                self.redirectError = $(this).data('modal-redirect-error');
            };
            //call ajax
            $.get(href, function(data) {

                //add modal title if any
                if (title) {
                    if (self.modal.find('#dataConfirmLabel').length) {
                        self.modal.find('#dataConfirmLabel').html(title);
                    } else {
                        self.modal.find('.modal-header').append('<h3 id="dataConfirmLabel">' + title + '</h3>');
                    }
                };

                self.modal.find('.modal-body').html(data.content);

                self.attachFormSubmit();

                self.modal.removeData('modal').modal({
                    show:true
                })
            }, 'json');

            return false;
        });
    };

    // A plugin wrapper around the constructor,
    $.fn[pluginName] = function ( options ) {
        //check dependency
        if (typeof $.fn['modal'] === 'function') {
            return this.each(function () {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName,
                    new Plugin( this, options ));
                }
            });
        } else {
            throw 'Modal extension is undefined';
        }
    };

})( jQuery, window, document );
