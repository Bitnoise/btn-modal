/*!
 * Confirmation modal attachment, require Twitter Bootstrap modal plugin
 */
;(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = 'remoteModalForm',
        defaults = {
            //something default?
            showCancelBtn: false
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
            this.attachFormSubmit();
        }

        //assign confirmation modal
        this.attachModal();
    };

    Plugin.prototype.createModal = function () {
        var element = $('<div id="modalForm" class="modal hide" role="dialog" aria-labelledby="dataConfirmLabel" aria-hidden="true"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button></div><div class="modal-body"></div><div class="modal-footer"></div></div>');

        if (this.options.showCancelBtn) {
            element.find('.modal-footer').append('<button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>');
        };

        $('body').append(element);

        this.modal = $('#modalForm');

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
                    if ($(self.element).data('modal-redirect-success')) {
                        window.location = $(self.element).data('modal-redirect-success');
                    };
                } else {
                    //error - replace the form with populated errors
                    if ($(self.element).data('modal-redirect-error')) {
                        window.location = $(self.element).data('modal-redirect-error');
                    };
                }

                self.modal.find('.modal-body').empty().append(data.content);

                //reattach links
                self.modal.find('a[data-modal]').remoteModalForm();
            }, 'json');

            return false;
        });
    };

    //assign change events
    Plugin.prototype.attachModal = function () {
        this.modal = $('#modalForm');
        var self = this;
        $(this.element).click(function(ev) {
            var href  = $(this).attr('href');
            var title = $(this).attr('data-modal-title');

            if ($(this).data('modal-class')) {
                self.modal.removeClass().addClass('modal ' + $(this).data('modal-class')); //modal
            };
            //update this.element
            self.element = this;

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


                //setup content
                self.modal.find('.modal-body').empty().html(data.content);

                //reattach
                self.modal.find('a[data-modal]').remoteModalForm();

                self.modal.removeData('modal').modal({
                    show:true,
                    backdrop: ($('.modal-backdrop').length) ? false : true
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
