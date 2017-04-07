$(document).ready(function() {
  var headerHeight = $('.header').outerHeight();
  var footerHeight = $('.footer').outerHeight();
  var totalHeight = $('body').outerHeight();
  var mainHeight = (totalHeight - (headerHeight + footerHeight + 32 )) / totalHeight * 100;
  $('.main').outerHeight(mainHeight+'%');

  var itemHeight = $('#test').height();
  var itemWidth = $('#test').width();
  $('.addElement').height(itemHeight);
  $('.addElement').width(itemWidth);
  $('.addElement').popover({
    html: true,
    title : '<button type="button" class="close" onclick="$(&quot;.addElement&quot;).popover(&quot;hide&quot;);">&times;</button>',
    trigger: 'manual',
    content: function () {
      if (!event)
        var event = window.event;
      event.cancelBubble = true;
      if (event.stopPropagation)
        event.stopPropagation();
      event.preventDefault();
      return $('.popup-content').html();
    }
  }).on('click',function(event) {
    //Stop propagation
    if (!event)
      var event = window.event;
    event.cancelBubble = true;
    if (event.stopPropagation)
      event.stopPropagation();
    event.preventDefault();
    //Toggle popover by clicking on the items (4 main area)
    $(this).popover('toggle');
    $('.addElement').not(this).popover('hide');
  });
});
