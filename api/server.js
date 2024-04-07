// // See https://github.com/typicode/json-server#module
// const jsonServer = require('json-server')

// const server = jsonServer.create()

// // Uncomment to allow write operations
// // const fs = require('fs')
// // const path = require('path')
// // const filePath = path.join('db.json')
// // const data = fs.readFileSync(filePath, "utf-8");
// // const db = JSON.parse(data);
// // const router = jsonServer.router(db)

// // Comment out to allow write operations
// const router = jsonServer.router('db.json')

// const middlewares = jsonServer.defaults()

// server.use(middlewares)
// // Add this before server.use(router)
// server.use(jsonServer.rewriter({
//     '/api/*': '/$1',
//     '/blog/:resource/:id/show': '/:resource/:id'
// }))
// server.use(router)
// server.listen(3000, () => {
//     console.log('JSON Server is running')
// })

// // Export the Server API
// module.exports = server
const jsonServer = require("json-server");
const queryString = require("query-string");
const auth = require("json-server-auth");

const server = jsonServer.create(); 
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);
// Add custom routes before JSON Server router
server.get("/echo", (req, res) => {
  res.jsonp(req.query);
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  if (req.method === "POST") {
    req.body.createdAt = Date.now();
  }
  // Continue to JSON Server router
  next();
});

router.render = (req, res) => {
  // Check GET with pagination
  // If yes, custom output
  const headers = res.getHeaders();
  const totalCountHeader = headers["x-total-count"];
  if (req.method === "GET" && totalCountHeader) {
    const queryParams = queryString.parse(req._parsedUrl.query);
    const page = Number.parseInt(queryParams._page) || 1;
    const limit = Number.parseInt(queryParams._limit) || 10;
    const totalPage = Math.ceil(totalCountHeader / limit);
    const result = {
      data: res.locals.data,
      pagination: {
        _page: page,
        _limit: limit,
        _totalElements: Number.parseInt(totalCountHeader),
        _totalPage: totalPage,
      },
    };

    return res.jsonp(result);
  }

  // Otherwise, keep default behavior
  res.jsonp(res.locals.data);
};

// /!\ Bind the router db to the app
server.db = router.db;
// You must apply the auth middleware before the router
server.use(auth);
server.use(router);

const port = process.env.PORT || 5000;
server.listen(port, (err) => {
  if (err) {
    console.log(`There was a problem with app.listen: ${err}`);
  }
  console.log(`Listening on port http://localhost:${port}/`);
});
