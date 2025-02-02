// import all dependencies

import express from 'express';
import db from './config/connection';
import path from 'path';
import { ApolloServer } from '@apollo/server';
import { authToken } from './utils/auth';
import { expressMiddleware } from '@apollo/server/express4';
import { fileURLToPath } from 'node:url';
import { typeDefs, resolvers, } from './schemas/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3001;

// set up servers
// apollo server
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// define apollo server
const startApolloServer = async () => {
  await server.start();

  // use express middleware
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());



  // test queries (apollo)
  app.use('/graphql', expressMiddleware(server as any, {
    context: authToken as any
  }));



  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    const address = path.join(__dirname, '../../client/dist');
    app.use(express.static(address));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
    });
  }

  // set up error message for mongoDB
  db.on("error", console.error.bind(console, "MongoDB had a bad time. Error:"));

  // listen for server requests from either port
  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}!`);
    console.log(`GraphQL @ http://localhost:${PORT}/graphql.`);
  });
};

startApolloServer();