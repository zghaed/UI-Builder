$(document).ready(function() {

  var popOverSettings = {
    html: true,
    title : function() { return $(this).attr('id'); },
    trigger: 'manual',
    content: function () {
      var $html = $('.popup-content');
      $html.find('[id^=content]').attr('id', 'content_' + $(this).attr('id'));
      $html.find('[id^=data]').attr('id', 'data_' + $(this).attr('id'));
      $html.find('[id^=delete]').attr('id', 'delete_' + $(this).attr('id'));
      return $html.html();
    }
  };

  function fillContainers(data) {
    if(!$('#content_' + data.id).data('cache'))
      $('#content_' + data.id).data('cache', {id: data.id, ts: new Date()});
    $('#content_' + data.id).on('change', function(e){
      e.stopPropagation();
    }).val(data.containerTemplate).trigger('change');
    $('#data_' + data.id).val(data.containerData);
    $('#delete_' + data.id).removeClass('hide');
  }

  function getDataById(id) {
    $.ajax({
      type: 'GET',
      url: 'http://localhost:8000/api/container/'+id,
      dataType: 'json',
      success: fillContainers,
      error: function(data) {
        alert('Cannot get the data.');
      }
    }).done(function(){
    });
  }

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
        var minOrder, axOrder;
        if (boxes[i][0]) {
          minOrder = boxes[i][0].groupNumber;
          maxOrder = boxes[i][0].groupNumber;
        }
        boxes[i].sort(function (a, b) {
          return a.groupNumber - b.groupNumber;
        });
        for (var j in boxes[i]) {
          //Add containers to each box
          var middleAddOrder = parseInt(boxes[i][j].groupNumber) + 1;
          var middleAddId = i + '_' + middleAddOrder + '_middle';
          var middleAddElement = '<div class="add-element" id="' + middleAddId + '" data-placement="bottom" style="order:' +
           middleAddOrder + ';">Add</div>';
          var theTemplateScript = boxes[i][j].containerTemplate;
          var inputData = boxes[i][j].containerData;
          var jsonData = (inputData === "") ? "" : JSON.parse(inputData);
          var preCompiledTemplateScript;
          if (Array.isArray(jsonData)) {
            preCompiledTemplateScript = '{{#each .}}' + theTemplateScript + '{{/each}}';
          } else {
            preCompiledTemplateScript = theTemplateScript;
          }
          var theTemplate = Handlebars.compile(preCompiledTemplateScript);
          var theCompiledHTML = theTemplate(jsonData);
          var newContainers = '<div class="group" style="order:' + boxes[i][j].groupNumber + ';" id= "'+ boxes[i][j].id +
           '" data-placement="bottom">' + theCompiledHTML + '</div>';
          if (j < boxes[i].length - 1)
            newContainers += middleAddElement;
          var second = boxId + '>div:eq(1)';
          $(second).after(newContainers);
          $('#' + middleAddId).popover(popOverSettings)
            .on('click',function() {
              $(this).popover('toggle');
              $('.group').not(this).popover('hide');
              $('.add-element').not(this).popover('hide');
            });
          $('#' + boxes[i][j].id).popover(popOverSettings)
            .on('click',function(event) {

              $('.group').not(this).popover('hide');
              $('.add-element').not(this).popover('hide');

              setTimeout(function(){
                $(event.currentTarget).popover('toggle');
                getDataById(event.currentTarget.id);
              }, 0);
            });

          if (boxes[i][j].groupNumber <= minOrder)
            minOrder = boxes[i][j].groupNumber - 1;
          if (boxes[i][j].groupNumber >= maxOrder)
            maxOrder = boxes[i][j].groupNumber + 1;
        }
        $(boxId).children(':first').css('order',  parseInt(minOrder) - 1);
        $(boxId).children().eq(1).css('order', minOrder);
        if (boxes[i].length > 0) {
          $(boxId).children(':last').css('order', maxOrder);
        } else {
          $(boxId).children(':last').css('display', 'none');
        }
      }
    },
    error: function(data) {
      alert('There was an error');
      alert(data);
    }
  });

  $('.add-element').popover(popOverSettings)
    .on('click',function() {
      $(this).popover('toggle');
      $('.group').not(this).popover('hide');
      $('.add-element').not(this).popover('hide');
    });

  function getId(response) {
    return response.data.id;
  }

  $('.box').on('click', '#apply-button', function(){
    var popOverId = $('.popover-title').html();
    var theTemplateScript = $('#content_' + popOverId).val();
    var inputData = $('#data_' + popOverId).val();
    var jsonData = (inputData === "") ? "" : JSON.parse(inputData);
    var preCompiledTemplateScript;
    if (Array.isArray(jsonData)) {
      preCompiledTemplateScript = '{{#each .}}' + theTemplateScript + '{{/each}}';
    } else {
      preCompiledTemplateScript = theTemplateScript;
    }
    var theTemplate = Handlebars.compile(preCompiledTemplateScript);
    var theCompiledHTML = theTemplate(jsonData);
    var addId = $('.popover-title').html();
    var addIdArray = addId.split('_');
    if (addIdArray.length > 1) {//Ading a group
      var location = addIdArray.pop();
      //For middle box add elements
      if (location === 'middle') {
        addIdArray.pop();
      }
      var boxName = addIdArray.join('_');
      var boxElement = $('#' + boxName);
      var horizontal = 1;
      var groupNumber;
      var addOrder = $('#' + addId).css('order');
      if (location === 'start') {
        //None empty box
        groupNumber = parseInt(addOrder) - 1;
        $('#' + addId).css('order', parseInt(addOrder) - 2);
        var middleAddId = boxName + '_' + addOrder + '_middle';
        var middleAddElement = '<div class="add-element" id="' + middleAddId + '" data-placement="bottom" style="order:' +
         addOrder + ';">Add</div>';
        $('#' + addId).after(middleAddElement);
        $('#' + boxName).children(':first').css('order',  parseInt(addOrder) - 3);
        $('#' + middleAddId).popover(popOverSettings)
          .on('click',function() {
            $(this).popover('toggle');
            $('.group').not(this).popover('hide');
            $('.add-element').not(this).popover('hide');
          });
      } else if (location === 'middle') {
        groupNumber = parseInt(addOrder) + 1;
        $('#' + addId).css('order', addOrder);
        var middleAddOrder = parseInt(addOrder) + 2;
        var middleAddId = boxName + '_' + middleAddOrder + '_middle';
        var middleAddElement = '<div class="add-element" id="' + middleAddId + '" data-placement="bottom" style="order:' +
         middleAddOrder + ';">Add</div>';
        for (var i=0; i<boxElement.children().length; i++) {
          var child = $(boxElement.children()[i]);
          if (parseInt(child.css('order')) > parseInt(addOrder)) {
            if (child.hasClass('group')) {
              var newOrder = parseInt(child.css('order')) + 2;
              function updateOrder(response) {
                var newGroup = parseInt(response.groupNumber) + 2;
                var id = response.id;
                var params = 'group=' + newGroup;
                $.ajax({
                  type: 'POST',
                  url: 'http://localhost:8000/api/container/update/'+id,
                  data: params,
                  success: function(data) {
                    //console.log('successfully update the order');
                  },
                  error: function(data) {
                    alert('Error in updating the order');
                  }
                });//End of Ajax call
              }//End of updateOrder
              var params = 'box=' + boxName + '&group=' + child.css('order');
              $.ajax({
                type: 'POST',
                url: 'http://localhost:8000/api/container',
                data: params,
                success: updateOrder,
                error: function(data) {
                  alert('Error in getting the container');
                }
              });//End of Ajax call
              //end of if for groups
            } else {
              var oldId = child.attr('id');
              var oldIdArray = oldId.split('_');
              var middleLocation = oldIdArray.pop();
              var newId;
              if (middleLocation === 'middle') {
                oldIdArray.pop();
                var prefixId = oldIdArray.join('_');
                newId = prefixId + '_' + (parseInt(child.css('order')) + 2) + '_middle';
              } else {
                newId = oldId;
              }
              child.attr('id', newId);
            }
            child.css('order', parseInt(child.css('order')) + 2);
          }//End of if for orders
        }//End of for
        $('#' + addId).after(middleAddElement);
        $('#' + middleAddId).popover(popOverSettings)
          .on('click',function() {
            $(this).popover('toggle');
            $('.group').not(this).popover('hide');
            $('.add-element').not(this).popover('hide');
          });
      } else {
        groupNumber = parseInt(addOrder) + 1;
        $('#' + addId).css('order', parseInt(addOrder) + 2);
        var middleAddId = boxName + '_'+ addOrder + '_middle';
        var middleAddElement = '<div class="add-element" id="' + middleAddId + '" data-placement="bottom" style="order:' +
         addOrder + ';">Add</div>';
        $('#' + addId).after(middleAddElement);
        $('#' + middleAddId).popover(popOverSettings)
          .on('click',function() {
            $(this).popover('toggle');
            $('.group').not(this).popover('hide');
            $('.add-element').not(this).popover('hide');
          });
      }

      var addParams = 'template=' + theTemplateScript + '&data=' + inputData + '&box=' + boxName + '&horizontal=' + horizontal +
       '&group=' + groupNumber;

      $.ajax({
        type: 'POST',
        url: 'http://localhost:8000/api/container/add',
        data: addParams,
        success: function(data) {
          var id = getId(data);
          var newDivString = '<div class="group" id="' + id + '" style="order:' + groupNumber + ';" data-placement="bottom" >' +
           theCompiledHTML + '</div>';
          if (location === 'start') {
            $('#' + addId).after(newDivString);
          } else if (location === 'middle') {
            $('#' + addId).after(newDivString);
          } else {
            $(newDivString).insertBefore('#' + addId);
          }
          $('#' + id).popover(popOverSettings)
            .on('click',function(event) {
              $('.group').not(this).popover('hide');
              $('.add-element').not(this).popover('hide');

              setTimeout(function(){
                $(event.currentTarget).popover('toggle');
                getDataById(event.currentTarget.id);
              }, 0);
            });
          $('.add-element').popover('hide');
        },
        error: function(data) {
          alert('There was an error in adding a container');
          alert(data);
        }
      });//End of Ajax call for adding element to the database
    } else {//Editing a group
      var updateParams = 'template=' + theTemplateScript + '&data=' + inputData;
      var id = $('.popover-title').html();
      $.ajax({
        type: 'POST',
        url: 'http://localhost:8000/api/container/update/'+id,
        data: updateParams,
        success: function(data) {
          var theTemplateScript = data.containerTemplate;
          var inputData = data.containerData;
          //TODO: error handling for JSON.parse
          var jsonData = (inputData === "") ? "" : JSON.parse(inputData);
          var preCompiledTemplateScript;
          if (Array.isArray(jsonData)) {
            preCompiledTemplateScript = '{{#each .}}' + theTemplateScript + '{{/each}}';
          } else {
            preCompiledTemplateScript = theTemplateScript;
          }
          var theTemplate = Handlebars.compile(preCompiledTemplateScript);
          var theCompiledHTML = theTemplate(jsonData);
          $('#' + $('.popover-title').html()).html(theCompiledHTML);
          $('.group').popover('hide');
        },
        error: function(data) {
          alert('There was an error updating the container!');
          alert(data);
        }
      });//End of Ajax call
    }
  });//End of apply button

  $('.custom-radio').on('click', function(event) {
    var boxId = event.target.parentNode.parentNode.parentNode.id;
    var checkedValue;
    if (event.target.checked) {
      checkedValue = event.target.value;
    }
    //TODO: Maybe I should update the UI in the success of AJAX request
    if (checkedValue === "true") {
      $('#' + boxId).css('flex-direction', 'row');
    } else if (checkedValue === "false") {
      $('#' + boxId).css('flex-direction', 'column');
    }
    var updateParams = 'horizontal=' + checkedValue;
    $.ajax({
      type: 'POST',
      url: 'http://localhost:8000/api/container/updatebox/'+boxId,
      data: updateParams,
      success: function(data) {
        console.log('successfully update the server');
      },
      error: function(data) {
        alert('There was an error updating the container!');
        alert(data);
      }
    });
  });

  $('.box').on('click', '#delete', function(event) {
    var id = $('.popover-title').html();
    var addOrder = parseInt($('#' + id).css('order')) - 1;
    var parentId = $('#' + id).parent().attr('id');
    var addElement = parentId + '_' + addOrder + '_middle';
    if ($('#' + addElement).length) {
     $('#' + addElement).remove();
    } else {
      addElement = parentId + '_start';
      $('#' + addElement).remove();
      //$('#' + parentId).children().eq(1).attr('id', addElement);
    }
    $.ajax({
      type: 'POST',
      url: 'http://localhost:8000/api/container/delete/'+id,
      success: function(data) {
        $('#' + id).remove();
      },
      error: function(data) {
        alert('There was an error deleting the container!');
        alert(data);
      }
    });
    $('.group').popover('hide');
    $('.add-element').popover('hide');
  });

  $('.box').on('click', '#cancel', function() {
    $('.group').popover('hide');
    $('.add-element').popover('hide');
  });

  $('.btn-toggle').click(function(event) {
    $(this).find('.btn').toggleClass('active');
    if ($(this).find('.btn-primary').length>0) {
    	$(this).find('.btn').toggleClass('btn-primary');
      if ($(event.target).children(':first').attr('value')==='preview') {
        $('.add-element').hide();
        $('.direction').hide();
        $('.box').removeClass('display-borders');
      } else {
        $('.add-element').show();
        $('.direction').show();
        $('.box').addClass('display-borders');
      }
    }

    $(this).find('.btn').toggleClass('btn-default');
  });

  $('#preview').on('click', function(event) {
    $('.add-element').remove();
    $('.direction').remove();
    $('.box').css('border-style','none');
  });
});
