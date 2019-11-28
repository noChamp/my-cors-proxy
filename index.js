/*addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 * /
async function handleRequest(request) {
  let url = new URL(request.url)
  return new Response('query string is ' + url.search, {
    headers: { 'content-type': 'text/plain' },
  })
}
*/
// from template


async function handleRequest(request) {
  console.log("request.url = " + request.url);

  const url = new URL(request.url)
  console.log("query string = " + url.search);

  const apiurl = url.searchParams.get('url')
  console.log("3rd party url = " + apiurl);

  // Rewrite request to point to API url. This also makes the request mutable
  // so we can add the correct Origin header to make the API server think
  // that this request isn't cross-site.
  // in other words - fake it for the destination server
  request = new Request(apiurl, request.headers)
  request.headers.set('Origin', new URL(apiurl).origin)

  let response = await fetch(request)

  /*if(response.status == 403)
  {
    console.log("body = " + response.body);

    if(response.body == "")
    {
      // Recreate the response so we can modify the headers
      response = new Response('server say you are not authorise to access that resource', response)
      response.headers.set('content-type', 'text/plain');
      console.log("status = " + response.status);
    }
    
    return response;
  }*/

  // Recreate the response so we can modify the headers
  response = new Response(response.body, response)
  // Set CORS headers - fake it for the browser that sent the request in the first place
  response.headers.set('Access-Control-Allow-Origin', '*')
  // Append to/Add Vary header so browser will cache response correctly
  response.headers.append('Vary', 'Origin')

  return response
}

addEventListener('fetch', event => {
  console.log("starting");
  const request = event.request
  const url = new URL(request.url)
    if (request.method === 'GET') {
      // Handle requests to the API server
      event.respondWith(handleRequest(request))
    } else {
      event.respondWith(async () => {
        return new Response(null, {
          status: 405,
          statusText: 'Method Not Allowed',
        })
      })
    }
})

//test with:
//https://example.com/?url=https%3A%2F%2Fdrive.google.com%2Fuc%3Fexport%3Ddownload%26id%3D0B6_PjWdR8YYsTVhMZ0RQVkJxUzNKdllYMVVfWjQwQ2FZOHhr

//after publish, test woth:
//https://my-cors-proxy.mycorsproxy.workers.dev/?url=https%3A%2F%2Fdrive.google.com%2Fuc%3Fexport%3Ddownload%26id%3D0B6_PjWdR8YYsTVhMZ0RQVkJxUzNKdllYMVVfWjQwQ2FZOHhr
