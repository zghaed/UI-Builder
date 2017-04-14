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
          var newContainers = "<div class='group' style='order:" + boxes[i][j].groupNumber + ";'>" + boxes[i][j].containerContent + "</div>";
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

  var popOverSettings = {
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
  }

  $('.add-element').popover(popOverSettings)
    .on('click',function(event) {
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

  $('.box').on('click', '#apply-button', function(){
    var theTemplateScript = $('textarea#content').val();
    var data = $('textarea#data').val();
    var theTemplate = Handlebars.compile(theTemplateScript);
    var jsonData = (data === "") ? "" : JSON.parse(data);
    var theCompiledHTML = theTemplate(jsonData);
    var addId = $('.popover-title').html();
    var addIdArray = addId.split('-');
    var location = addIdArray.pop();
    //For middle box add elements
    if (location === 'middle') {
      addIdArray.pop();
    }
    var boxName = addIdArray.join('-');
    var boxElement = $('#'+boxName);
    var horizontal = 1;
    var groupNumber;
    var addOrder = $('#'+addId).css('order');
    if (location === 'start') {
      //two conditions if the first element or not
      if (boxElement.children().length === 3) { //Start add, Popover === 2
        //First group to add
        groupNumber = addOrder;
        $('#'+addId).css('order', parseInt(addOrder) - 1);
        var endAdd = '#' + boxName + '-end';
        $(endAdd).css('order', parseInt(addOrder) + 1);
        //TODO: Maybe I shouldn't show before successful
        $(endAdd).show();
      } else {
        //None empty box
        groupNumber = addOrder - parseInt(1);
        $('#'+addId).css('order', parseInt(addOrder) - 2);
        var middleAddId = boxName + '-' + addOrder + '-middle';
        var middleAddElement = '<div class="add-element" id="' + middleAddId + '" data-placement="bottom" style="order:' + addOrder + ';">Add</div>';

        $('#'+addId).after(middleAddElement);
        $('#'+middleAddId).popover(popOverSettings)
          .on('click',function(event) {
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
      }
    } else if (location === 'middle') {
      //TODO: NEED TO REORDER ALL ELEMENTS AFTER THE NEW MIDDLE ADD --> if ajax request is successful
      groupNumber = parseInt(addOrder) + 1;
      $('#'+addId).css('order', addOrder);
      var middleAddOrder = parseInt(addOrder) + 2;
      var middleAddId = boxName + '-' + middleAddOrder + '-middle';
      var middleAddElement = '<div class="add-element" id="' + middleAddId + '" data-placement="bottom" style="order:' + middleAddOrder + ';">Add</div>';
      for (var i=0; i<boxElement.children().length; i++) {
        var child = $(boxElement.children()[i]);
        if (parseInt(child.css('order')) > parseInt(addOrder)) {
          var childOrder = child.css('order');
          if (child.hasClass('group')) {
            var params = 'box=' + boxName + '&group=' + childOrder;
            var return_first;
            $.ajax({
              type: 'POST',
              url: 'http://localhost:8000/api/container',
              data: params,
              success: function(data) {
                callback(data);
              },
              error: function(data) {
                alert('There was an error submitting the form');
                alert(data);
              }
            });//End of Ajax call
            function callback(response) {
              var id = response.id;
              var newOrder = parseInt(childOrder) + 2;
              var params = 'group=' + newOrder;
              $.ajax({
                type: 'POST',
                url: 'http://localhost:8000/api/container/update/'+id,
                data: params,
                success: function(data) {
                  console.log('successfully update the order');
                  console.log(data);
                },
                error: function(data) {
                  alert('There was an error submitting the form');
                  alert(data);
                }
              });//End of Ajax call
            }//End of callback
          }//end of if for groups
          child.css('order', parseInt(childOrder) + 2);
        }//End of if for orders
      }//End of for
      $('#'+addId).after(middleAddElement);
      $('#'+middleAddId).popover(popOverSettings)
        .on('click',function(event) {
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
    } else {
      groupNumber = parseInt(addOrder) + 1;
      $('#'+addId).css('order', parseInt(addOrder) + 2);
      var middleAddId = boxName + '-'+ addOrder + '-middle';
      var middleAddElement = '<div class="add-element" id="' + middleAddId + '" data-placement="bottom" style="order:' + addOrder + ';">Add</div>';

      $('#'+addId).after(middleAddElement);
      $('#'+middleAddId).popover(popOverSettings)
        .on('click',function(event) {
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
    }

    var params = 'content=' + theCompiledHTML + '&box=' + boxName + '&horizontal=' + horizontal + '&group=' + groupNumber;

    $.ajax({
      type: 'POST',
      url: 'http://localhost:8000/api/container/add',
      data: params,
      success: function(data) {
        var newDivString = '<div class="group" style="order:' + groupNumber + ';">' + theCompiledHTML + '</div>';

        if (location === 'start') {
          $('#'+addId).after(newDivString);
        } else if (location === 'middle') {
          $('#'+addId).after(newDivString);
        } else {
          $(newDivString).insertBefore('#'+addId);
        }
        $('.add-element').popover('hide');
      },
      error: function(data) {
        alert('There was an error submitting the form');
        alert(data);
      }
    });//End of Ajax call
  });//End of apply button
});
