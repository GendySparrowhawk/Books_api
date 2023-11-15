const express = require("express");
const cookieParser = require("cookie-parser");

const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");

const { contextMiddleware } = require('./auth')

const app = express();
const PORT = process.env.PORT || 3001;
const is_prod = process.env.NODE_ENV === "production";
const path = require("path");

require("dotenv").config();

const db = require("./config/connection");

const routes = require("./routes");
const { typeDefs, resolvers } = require("./schema");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: contextMiddleware,
});
async function startServer() {
  await server.start();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // if we're in production, serve client/build as static assets
  if (is_prod) {
    app.use(express.static(path.join(__dirname, "../client/build")));
  }

  app.use(cookieParser());
  app.use("/graphql", expressMiddleware(server));
  app.use(routes);

  if (is_prod) {
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "client/dist/index.html"));
    });
  }

  db.once("open", () => {
    console.log("Db connected");

    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
    });
  });
}

startServer();
