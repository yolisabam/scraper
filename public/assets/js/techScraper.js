$(document).ready(function(){

  $("#scrape-button").click(function(event){
    console.log("clicked");
    $.get( "/scrape", function(data) {
      location.reload();
    });
  });

  $(document).on("click", ".save", function(event){
    var article = $(this).data("id");
    $.ajax({
      url: "/save/" + article,
      method: "PUT"
    }).done(function(response) {
      location.reload();
    });
  });

});