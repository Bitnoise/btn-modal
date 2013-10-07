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

        this._defaults    = defaults;
        this._name        = pluginName;

        this.modal        = null;
        this.redirect     = true;

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
        var element = $('<div id="modalForm" class="modal hide" role="dialog" aria-labelledby="dataConfirmLabel" aria-hidden="true"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button><h3 id="dataConfirmLabel">Edit</h3></div><div class="modal-body"></div><div class="modal-footer"><button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button></div></div>');

        $('body').append(element);

    };

    Plugin.prototype.isModalExists = function () {

        return $('#modalForm').length;
    };

    Plugin.prototype.attachFormSubmit = function () {
        self = this;
        this.modal.find('.modal-body').find('form').submit(function() {
            var form = $(this);
            var querystring = form.serialize();
            console.log(querystring);
            $.post(form.attr('action'), querystring, function(data) {
                if (data.verdict == 'success') {
                    // console.log('OK');
                    //refresh list or reload window
                    // self.modal.modal('hide');
                    if (self.redirect) {
                        window.location.reload();
                    } else {
                        form.parent().empty().append(data.content);
                    }
                } else {
                    // console.log('FAIL');
                    //error - replace the form with populated errors
                    form.parent().empty().append(data.content);
                    //re-assign submit event
                    self.attachFormSubmit();
                }
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

            if ($(this).attr('data-modal-redirect')) {
                self.redirect = ($(this).attr('data-modal-redirect') == 'false' ? false : true);
            };
            //call ajax
            $.get(href, function(data) {

                //add modal title if any
                if (title) {
                    self.modal.find('#dataConfirmLabel').html(title);
                };

                self.modal.find('.modal-body').html(data.content);

                self.attachFormSubmit();

                //
                self.modal.removeData('modal').modal({
                    show:true
                })
            }, 'json');
            // $('#modalForm').find('.modal-body').text(href);
            // $('#dataConfirmOK').attr('href', href);

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
