var express = require("express");
var app = express();
app.use(express.logger());

// The global datastore 
var messages;

app.get('/', function(request, response) {
	response.send('Hellow World!');
});


// get all messages
app.get("/messages", function(request, response){
  response.send({
    messages: messages,
    success: true
  });
});

// create new message
app.post("/messages", function(request, response) {
  var item = {"message": request.body.message,
              "user": request.body.user,
              "date": new Date()};

  var successful = (item.message !== undefined);

  if (successful) {
    messages.push(item);
    writeFile("data/data.txt", JSON.stringify(messages));
  } else {
    item = undefined;
  }

  response.send({ 
    item: item,
    success: successful
  });
});


var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
    });