$(document).ready(function() {
  var headerHeight = $('.header').outerHeight();
  var footerHeight = $('.footer').outerHeight();
  var totalHeight = $('body').outerHeight();
  var mainHeight = (totalHeight - (headerHeight + footerHeight +32 )) / totalHeight * 100;
  console.log(mainHeight+'%');
  $('.main').outerHeight(mainHeight+'%');

  var itemHeight = $('#test').height();
  var itemWidth = $('#test').width();
  $('.addElement').height(itemHeight);
  $('.addElement').width(itemWidth);
});
