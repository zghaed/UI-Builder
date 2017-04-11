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
        var boxId = '#' + i ;
        var minOrder = 0;
        var maxOrder = 0;

        boxes[i].sort(function (a, b) {
          return a.groupNumber - b.groupNumber;
        });
        for (j in boxes[i]) {
          //Add containers to each box
          var newContainers = "<div style='order:" + boxes[i][j].groupNumber + ";'>" + boxes[i][j].containerContent + "</div>";
          var second = boxId + ">div:eq(0)";
          $(second).after(newContainers);
          if (boxes[i][j].groupNumber <= minOrder)
            minOrder = boxes[i][j].groupNumber - 1;
          if (boxes[i][j].groupNumber >= maxOrder)
            maxOrder = boxes[i][j].groupNumber + 1;
        }
        $(boxId).children(':first').css('order',  minOrder);
        if (boxes[i].length > 0) {
          $(boxId).children(':last').css('order',  maxOrder);
        } else {
          $(boxId).children(':last').css('display',  'none');
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
    title : function() { return $(this).attr('id'); },
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
    $('.add-element').not(this).popover('hide');
  });

  $('body').on('click', '#apply-button', function(event){
    var theTemplateScript = $('textarea#content').val();
    var data = $('textarea#data').val();
    var theTemplate = Handlebars.compile(theTemplateScript);
    var jsonData = (data === "") ? "" : JSON.parse(data);
    var theCompiledHTML = theTemplate(jsonData);
    var addId = $('.popover-title').html();
    var addIdArray = addId.split('-');
    var location = addIdArray.pop();
    var boxName = addIdArray.join('-');
    var boxElement = $('#'+boxName);
    var horizontal = 1;
    var groupNumber;

    if (location === 'start') {
      groupNumber = $('#'+addId).css('order');
    } else {
      groupNumber = $('#'+addId).css('order');
    }
    var params = 'content=' + theCompiledHTML + '&box=' + boxName + '&horizontal=' + horizontal + '&group=' + groupNumber;

    $.ajax({
      type: 'POST',
      url: 'http://localhost:8000/api/container',
      data: params,
      success: function(data) {
        var newDivString = '<div style="order:' + groupNumber + '">' + theCompiledHTML + '</div>';
        var newDiv = $(newDivString);

        if (location === 'start') {
          $('#'+addId).css('order', parseInt(groupNumber)-1);
          var second = '#' + boxName + '>div:eq(0)';
          $(second).after(newDiv);
          if (boxElement.children().length === 4) {
            var boxEnd = '#' + boxName + '-end';
            $(boxEnd).css('order', parseInt(groupNumber)+1);
            $(boxEnd).show();
          }
        } else {
          $('#'+addId).css('order', parseInt(groupNumber)+1);
          newDiv.insertBefore($('#'+addId));
        }
        $('.add-element').popover('hide');
      },
      error: function(data) {
        alert('There was an error submitting the form');
        alert(data);
      }
    });//End of Ajax call
  });
});
