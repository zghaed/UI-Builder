$(document).ready(function() {
  $.ajax({
    type: 'GET',
    url: 'http://localhost:8000/api/containers',
    dataType: 'json',
    success: function(data) {
      //Group all containers in 4 arrays based on their box name
      var boxes = {'top-left-box':[], 'top-right-box':[], 'middle-box':[], 'bottom-right-box':[]};
      for(var i = 0; i < data.length; i++) {
        var boxName = data[i].boxName;
        boxes[boxName].push(data[i]);
      }
      //Sort each box based on their group number
      for (var i in boxes) {
        boxes[i].sort(function (a, b) {
          return a.groupNumber - b.groupNumber;
        });
        var boxId = '#' + i ;
        var minOrder = 0;
        var maxOrder = 0;
        for (j in boxes[i]) {
          //Add containers to each box
          var newContainers = "<div style='order:" + boxes[i][j].groupNumber + ";'>" + boxes[i][j].containerContent + "</div>";
          var second = boxId + ">div:eq(0)";
          $(second).after(newContainers);
          if (boxes[i][j].groupNumber < minOrder)
            minOrder = boxes[i][j].groupNumber;
          if (boxes[i][j].groupNumber > maxOrder)
            maxOrder = boxes[i][j].groupNumber;
        }
        $(boxId).children(":first").css("order",  minOrder);
        if (boxes[i].length > 0) {
          $(boxId).children(":last").css("order",  maxOrder);
        } else {
          $(boxId).children(":last").css("display",  "none");
        }
      }
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
