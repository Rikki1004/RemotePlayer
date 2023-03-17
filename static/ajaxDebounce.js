(function ($) {
  var count = 0;
  var lastFetchId = 0,
    timeoutActive,
    defaults = {
      delay: 250,
    };
  $.ajaxDebounce = function( options ) {
    var settings = $.extend(defaults, options );

    var doAjax = function(ajaxOptions){
      var currentFetchId = new Date().getTime();
      timeoutActive = null;   // Resets the "non-active" delay count
      var smartAjaxOptions = $.extend({}, ajaxOptions);
      smartAjaxOptions.success = function(data) { 
        if ( isMostRecentCall(currentFetchId) ) { 
          ajaxOptions.success(data);
        } 
      };
      smartAjaxOptions.error = function(xhr, status, error) { 
        if ( !!ajaxOptions.error && isMostRecentCall(currentFetchId) ) { 
          ajaxOptions.error(xhr, status, error); 
        }
      }

      var isMostRecentCall = function(currentId) { 
        // To resolve a race-condition, where a later ajax call comes back before an earlier one.
        if (currentId < lastFetchId) {
          return false;
        }
        lastFetchId = currentId;
        return true;
      }
      $.ajax(smartAjaxOptions);
    };

    if(timeoutActive){ 
      clearTimeout(timeoutActive);
    }
    timeoutActive = setTimeout(function(){ doAjax(options.ajax); }, settings.delay);

  };
}(jQuery));

var $input = $('input');
var getAjaxObject = function(){ 
  return {
    url: '/echo/html/',
    data: {value: $input.val()},
    success: function(data){},
    error: function(xhr, status, error){}
  };
}
$input.keyup(function(){$.ajaxDebounce({delay: 100, ajax: getAjaxObject()});});