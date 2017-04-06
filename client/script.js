$(document).ready(function(){
	$.ajax({
		type: "GET",
		url: "http://localhost:8000/api/containers",
		success: function(data) {
			data: data
		},
		error: function(data) {
			alert('There was an error');
			alert(data);
		}
	});

	$('.flex-item').popover({
    html: true,
    title : '<button type="button" class="close" onclick="$(&quot;.flex-item&quot;).popover(&quot;hide&quot;);">&times;</button>',
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
		//Toggle popover by clicking on the flex items (4 main area)
    $(this).popover('toggle');
	  $('.flex-item').not(this).popover('hide');
	});

  $('#main-div').click( function(event){
		if (event.target == event.currentTarget) {
			//Check if anywhere on the div is clicked and hide the popover
			$('.flex-item').each(function () {
				if (!$(this).is(event.target) && $(this).has(event.target).length === 0 && $('.popover').has(event.target).length === 0) {
					$(this).popover('hide');
				}
			});
			//Another place on the screen is clicked
			$('.flex-container').css("display", "none");
			$('.flex-container').css({"display": "flex", "margin-top": event.pageY-100});

			$.ajax({
				type: "GET",
				url: "http://localhost:8000/api/containers",
				success: function(data) {
					console.log(JSON.stringify(data));
					for(var i = 0; i < data.length; i++)
					{
				    var item = data[i];
						var newDivString = "<div class='flex-inner-item'>"+item.containerContent+"</div>"
						var newDiv = $(newDivString);
						var className = "."+item.regionNumber;
						$(className).append(newDiv);
					}
				},
				error: function(data) {
					alert('There was an error');
					alert(data);
				}
			});
		} else {
			//Somewhere on popover is clicked
			//Stop propagation
			if (!event) var event = window.event;
			event.cancelBubble = true;
			if (event.stopPropagation) event.stopPropagation();
			//If Apply button is clicked -> Ajax call

			if ($('#applyButton').is(event.target)) {
	      var number = $($('.popover')[0].previousSibling).attr('class').split(' ')[1];
	      var horizontal = $('input[name="horizontal"]:checked').val();
	      var content = $('textarea#content').val();
				var data = 'number=' + number + '&horizontal=' + horizontal + '&content=' + content;
	      $.ajax({
	        type: "POST",
	        url: "http://localhost:8000/api/container",
	        data: data,
	        success: function(data) {
						var newDivString = "<div class='flex-inner-item'>"+content+"</div>"
						var newDiv = $(newDivString);
						var className = "."+number;
						$(className).append(newDiv);
						$('.flex-item').popover('hide');
	        },
	        error: function(data) {
	          alert('There was an error submitting the form');
	          alert(data);
	        }
	      });//End of Ajax call
			}//End of applyButton if
    }//End of none-main clicking
  });

  $('.flex-inner-item').click( function(event) {
		console.log("An inner item is clicked!");
    if (!event)
      var event = window.event;
    event.cancelBubble = true;
    if (event.stopPropagation)
      event.stopPropagation();
    event.preventDefault();
  });
});
