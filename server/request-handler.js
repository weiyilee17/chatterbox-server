/*eslint indent: ["error", 2, { "SwitchCase": 1 }]*/
/**************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* 
Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

// Imports 
const qs = require('qs');

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.

// Your chat client is running from a url like 
// file://your/chat/client/index.html,
// which is considered a different domain.

// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var messages = [];

var messageMaker = function(str) {
  let newMessage = {};
  // username=matt&text=te=st&roomname=lobby
  if (str.startsWith('{')) {
    // if str is object
    newMessage = JSON.parse(str);
  } else {
    let parameters = str.split('&'); // array of strings [username=matt, text=test...]
    parameters = parameters.map(p => p.split('=')); // array of arrays of strings [[username, matt], [text, te, st]...]
    parameters.forEach(p => {
      // only add paramenter to message if user doesn't type = in text, username...
      if (p.length === 2) {
        newMessage[p[0] === 'text' ? 'message' : p[0]] = p[1];
      }
    }); 
  }
  newMessage.objectId = messages.length;
  messages.push(newMessage);
};

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
 
  // Documentation for both request and response can be found in the HTTP 
  // section at http://nodejs.org/documentation/api/

  // Do some basic logging.
   
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  // require('url').parse(...)
   
  let path = request.url.split('?')[0]; 
  let options = request.url.split('?')[1];
  console.log(`Serving request type ${request.method} for rel-url ${path}`);
    
  switch (request.method) {
    case 'GET':
      var headers = defaultCorsHeaders;
      if (path === '/classes/messages' || path === '/' || path === '') {
        headers['Content-Type'] = 'application/json';
        response.writeHead(200, headers);
        response.end(JSON.stringify({'results': messages}));
      } else {
        // TODO write 404
        response.writeHead(404, headers);
        response.end();
      }
      break;
    case 'POST':
      if (path === '/classes/messages' || path === '/') {
        // TODO detect incorrect messages   
        var requestBody = '';
        request.on('data', (data) => {
          requestBody += data;
          if (requestBody.length > 1e7) {
            response.writeHead(413, 'RequestEntity Too Large', {});
            response.end();
          }
        });
        request.on('end', () => {
          messageMaker(requestBody); // try catch 
          console.log('saved messages', messages);
          var headers = defaultCorsHeaders;
          headers['Content-Type'] = 'application/json';
          response.writeHead(201, headers); // on success
          response.end(
            JSON.stringify({'_data': {'results': messages} })
          );
        });
      } else {
        response.writeHead(404, defaultCorsHeaders);
        response.end();
        break;
      }  
      break;
    case 'PUT':
      break;
    case 'OPTIONS':
      response.writeHead(200, defaultCorsHeaders);
      response.end();
      break;
    case 'DELETE':
      break;
    default: 
      response.writeHead(404, defaultCorsHeaders);
      response.end();
      break;
  }
  
  // The outgoing status.
  // var statusCode = 200;

  // See the note below about CORS headers.
  //var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  //headers['Content-Type'] = 'text/plain';

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  //response.writeHead(statusCode, headers);
  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  //response.end('Hello, World!');

};

module.exports.requestHandler = requestHandler;
