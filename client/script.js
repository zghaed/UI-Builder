$(document).ready(function() {
  // var headerHeight = $('.header').outerHeight();
  // var footerHeight = $('.footer').outerHeight();
  // var totalHeight = $('body').outerHeight();
  // var mainHeight = (totalHeight - (headerHeight + footerHeight + 32 )) / totalHeight * 100;
  // $('.main').outerHeight(mainHeight+'%');
  $.ajax({
    type: 'GET',
    url: 'http://localhost:8000/api/containers',
    dataType: 'json',
    success: function(data) {
      //Group all containers in 4 arrays based on their box name
      var boxes = {'top-left-box':[], 'top-right-box':[], 'middle-box':[], 'bottom-right-box':[]};
      for(var i = 0; i < data.length; i++) {
        var boxName = data[i].boxName;
        console.log(data[i]);
        boxes[boxName].push(data[i]);
      }
      //Sort each box based on their group number
      for (var i in boxes) {
      //  console.log(boxes[i]);
        boxes[i].sort(function (a, b) {
          return a.groupNumber - b.groupNumber;
        });
        for (j in boxes[i]) {
          var boxId = '#' + i ;
          console.log($(boxId).html());
          var newContainers = "<div style='order:" + boxes[i][j].groupNumber + ";'>" + boxes[i][j].containerContent + "</div>";
          var second = boxId + ">div:eq(1)";
          $(second).after(newContainers);
        }
      }

      console.log(boxes);
    },
    error: function(data) {
      alert('There was an error');
      alert(data);
    }
  });

  $('.add-element').popover({
    html: true,
    title : '<button type="button" class="close" onclick="$(&quot;.add-element&quot;).popover(&quot;hide&quot;);">&times;</button>',
    trigger: 'manual',
    container: 'body',
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
    $('.add-element').not(this).popover('hide');
  });
});
