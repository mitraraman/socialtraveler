/* ChatBox
*******************************************************************************/
// The global datastore 
var messages = [];

function getParam( name ){
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");  
  var regexS = "[\\?#]"+name+"=([^&#]*)";  
  var regex = new RegExp( regexS );  
  var results = regex.exec( window.location.href); 
  if( results == null )    return "";  
  else    
    return results[1];
}


function message(){
  var user = "none";

  var message = "> " + $("#message-input").val();
  // addMessage(message,user);
  messages.push({message:message, user: user, date: new Date()});
  $("#message-input").val("");

	console.log(message);
	console.log(messages);
	

  refreshDOM();
}

function addMessage(message, user){
	$.ajax({
		type:"post",
		data: {"message": message,
    "user": user},
    url: "/messages",
    success: function (data){}
  });
}


// Implement refreshDOM()
function refreshDOM(){
  if (messages === undefined) return;
  var container = $("#chatroom");
  container.empty();
  $("#message-input").empty();

  for (var i = 0; i < messages.length; i++){
    var message = messages[i].message;
    var li = $("<li>");
    li.addClass("bubble");
    var user = messages[i].user;

    if (user === (getParam('user'))){
      li.addClass("myself");
    }
    else{
      li.addClass("others");
    }
    var post = li.html(message);
    li.append(post);
    container.append(li);
  }
  if (window.location.href.indexOf("game") !== -1){
    container.scrollTop($("#chatroom")[0].scrollHeight);
  }
}





/* Trips & Trip Information
*******************************************************************************/
$(".open").click(function(){
	var info = $(this)
	var tripItem = $(info.parent());
	var tripData = $(tripItem.children()[2]);
	info.html("<p> expand</p>");
			
	if (tripData.is( ":visible" )){
		tripData.slideUp();
		info.addClass("arrowUp");
	}
	else {
		tripData.slideDown();
		info.removeClass("arrowUp");	
	}

});


