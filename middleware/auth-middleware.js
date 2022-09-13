const firebase = require("../firebase/index");

function authMiddleware(request, response, next) {
  const headerToken = request.headers.authorization;
  let url = request.url.split("/");
  console.log(request.url);
  if (
    (url[2] === "tickets" &&
      request.method === "POST" &&
      request.body.customerEmail) ||
    (url[2] === "orgs" && request.method === "GET")
  ) {
    next();
  } else {
    if (!headerToken) {
      return response.send({ message: "No token provided" }).status(401);
    }

    if (headerToken && headerToken.split(" ")[0] !== "Bearer") {
      response.send({ message: "Invalid token" }).status(401);
    }

    const token = headerToken.split(" ")[1];

    firebase
      .auth()
      .verifyIdToken(token)
      .then((result) => {
        request.body = {
          ...request.body,
          name: result.name,
          email: result.email,
        };
        next();
      })
      .catch((error) => {
        console.log(error.message);
        response.send({ message: "Could not authorize" }).status(403);
      });
  }
}

module.exports = authMiddleware;
