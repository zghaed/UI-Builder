$(document).ready(function() {

  var popOverSettings = {
    html: true,
    title : function() { return $(this).attr('id'); },
    trigger: 'manual',
    content: function (event) {
      if (!event)
        event = window.event;
      event.cancelBubble = true;
      if (event.stopPropagation)
        event.stopPropagation();
      event.preventDefault();
      return $('.popup-content').html();
    }
  };

  var popOverUpdateSettings = {
    html: true,
    title : function() { return $(this).attr('id'); },
    trigger: 'manual',
    content: function (event) {
      if (!event)
        event = window.event;
      event.cancelBubble = true;
      if (event.stopPropagation)
        event.stopPropagation();
      event.preventDefault();
      return $('.popup-content').html();
    }
  };

  $.ajax({
    type: 'GET',
    url: 'http://localhost:8000/api/containers',
    dataType: 'json',
    success: function(data) {
      //Group all containers in 4 arrays based on their box name
      var boxes = {'top_left_box':[], 'top_right_box':[], 'middle_box':[], 'bottom_right_box':[]};

      for(var index = 0; index < data.length; index++) {
        var boxName = data[index].boxName;
        boxes[boxName].push(data[index]);
      }
      //Sort each box based on their group number
      for (var i in boxes) {
        var boxId = '#' + i ;
        var minOrder = 0;
        var maxOrder = 0;

        boxes[i].sort(function (a, b) {
          return a.groupNumber - b.groupNumber;
        });
        for (var j in boxes[i]) {
          //Add containers to each box
          var middleAddOrder = parseInt(boxes[i][j].groupNumber) + 1;
          var middleAddId = i + '_' + middleAddOrder + '_middle';
          var middleAddElement = '<div class="add-element" id="' + middleAddId + '" data-placement="bottom" style="order:' + middleAddOrder
            + ';">Add</div>';
          var theTemplateScript = boxes[i][j].containerTemplate;
          var data = boxes[i][j].containerData;
          var theTemplate = Handlebars.compile(theTemplateScript);
          var jsonData = (data === "") ? "" : JSON.parse(data);
          var theCompiledHTML = theTemplate(jsonData);
          var newContainers = '<div class="group" style="order:' + boxes[i][j].groupNumber + ';" id= "'+ boxes[i][j].groupNumber + '" data-placement="bottom">'
          + theCompiledHTML + '</div>';
          if (j < boxes[i].length-1)
            newContainers += middleAddElement;
          var second = boxId + '>div:eq(0)';
          $(second).after(newContainers);
          var $popover = $('#'+middleAddId).popover(popOverSettings)
            .on('click',function(event) {
              //Stop propagation
              if (!event)
                event = window.event;
              event.cancelBubble = true;
              if (event.stopPropagation)
                event.stopPropagation();
              event.preventDefault();
              //Toggle popover by clicking on the items (4 main area)
              $(this).popover('toggle');
              $('.group').not(this).popover('hide');
              $('.add-element').not(this).popover('hide');
            });
          $('#'+boxes[i][j].groupNumber).popover(popOverUpdateSettings)
            .on('click',function(event) {
              console.log('adding');
            //  $('#content').html('contenting');
            //  $('#data').html('data');
              //Stop propagation
              if (!event)
                event = window.event;
              event.cancelBubble = true;
              if (event.stopPropagation)
                event.stopPropagation();
              event.preventDefault();
              //Toggle popover by clicking on the items (4 main area)
             $(this).popover('toggle');
             $('.group').not(this).popover('hide');
             $('.add-element').not(this).popover('hide');
            });
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

  $('.add-element').popover(popOverSettings)
    .on('click',function(event) {
      //Stop propagation
      if (!event)
        event = window.event;
      event.cancelBubble = true;
      if (event.stopPropagation)
        event.stopPropagation();
      event.preventDefault();
      //Toggle popover by clicking on the items (4 main area)
      $(this).popover('toggle');
      $('.group').not(this).popover('hide');
      $('.add-element').not(this).popover('hide');
    });

  $('.box').on('click', '#apply-button', function(){
    var theTemplateScript = $('#content').val();
    var data = $('#data').val();
    var theTemplate = Handlebars.compile(theTemplateScript);
    var jsonData = (data === "") ? "" : JSON.parse(data);
    var theCompiledHTML = theTemplate(jsonData);
    var addId = $('.popover-title').html();
    var addIdArray = addId.split('_');
    var location = addIdArray.pop();
    //For middle box add elements
    if (location === 'middle') {
      addIdArray.pop();
    }
    var boxName = addIdArray.join('_');
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
        var endAdd = '#' + boxName + '_end';
        $(endAdd).css('order', parseInt(addOrder) + 1);
        //TODO: Maybe I shouldn't show before successful
        $(endAdd).show();
      } else {
        //None empty box
        groupNumber = addOrder - parseInt(1);
        $('#'+addId).css('order', parseInt(addOrder) - 2);
        var middleAddId = boxName + '_' + addOrder + '_middle';
        var middleAddElement = '<div class="add-element" id="' + middleAddId + '" data-placement="bottom" style="order:' + addOrder + ';">Add</div>';

        $('#'+addId).after(middleAddElement);
        $('#'+middleAddId).popover(popOverSettings)
          .on('click',function(event) {
            //Stop propagation
            if (!event)
              event = window.event;
            event.cancelBubble = true;
            if (event.stopPropagation)
              event.stopPropagation();
            event.preventDefault();
            //Toggle popover by clicking on the items (4 main area)
            $(this).popover('toggle');
            $('.group').not(this).popover('hide');
            $('.add-element').not(this).popover('hide');
          });
      }
    } else if (location === 'middle') {
      console.log('location is middle');
      console.log(boxName);
      groupNumber = parseInt(addOrder) + 1;
      $('#'+addId).css('order', addOrder);
      var middleAddOrder = parseInt(addOrder) + 2;
      var middleAddId = boxName + '_' + middleAddOrder + '_middle';
      var middleAddElement = '<div class="add-element" id="' + middleAddId + '" data-placement="bottom" style="order:' + middleAddOrder + ';">Add</div>';
      for (var i=0; i<boxElement.children().length; i++) {
        var child = $(boxElement.children()[i]);
        if (parseInt(child.css('order')) > parseInt(addOrder)) {
          var childOrder = child.css('order');
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

          }//end of if for groups
          child.css('order', parseInt(childOrder) + 2);
        }//End of if for orders
      }//End of for
      $('#'+addId).after(middleAddElement);
      $('#'+middleAddId).popover(popOverSettings)
        .on('click',function(event) {
          //Stop propagation
          if (!event)
            event = window.event;
          event.cancelBubble = true;
          if (event.stopPropagation)
            event.stopPropagation();
          event.preventDefault();
          //Toggle popover by clicking on the items (4 main area)
          $(this).popover('toggle');
          $('.group').not(this).popover('hide');
          $('.add-element').not(this).popover('hide');
        });
    } else {
      groupNumber = parseInt(addOrder) + 1;
      $('#'+addId).css('order', parseInt(addOrder) + 2);
      var middleAddId = boxName + '_'+ addOrder + '_middle';
      var middleAddElement = '<div class="add-element" id="' + middleAddId + '" data-placement="bottom" style="order:' + addOrder + ';">Add</div>';

      $('#'+addId).after(middleAddElement);
      $('#'+middleAddId).popover(popOverSettings)
        .on('click',function(event) {
          //Stop propagation
          if (!event)
            event = window.event;
          event.cancelBubble = true;
          if (event.stopPropagation)
            event.stopPropagation();
          event.preventDefault();
          //Toggle popover by clicking on the items (4 main area)
          $(this).popover('toggle');
          $('.group').not(this).popover('hide');
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

  $('.box').on('click', '#cancel', function(){
    $('#content').html('');
    $('#data').html('');
    $('.group').popover('hide');
    $('.add-element').popover('hide');
  });
});
