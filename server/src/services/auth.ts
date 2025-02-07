// import deps
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import dotenv from 'dotenv';
dotenv.config();

// authenticate web token
export const authToken = ({ req }: any) => {
  let token = req.body.token || req.query.token || req.headers.authorization;
  if (req.headers.authorization) {
    token = token.split('').pop().trim();
  }
  if (!token) {
    console.log('No token!');
    return req;
  }
  try {
    const { data }: any = jwt.verify(token, process.env.JWT_SECRET_KEY || '', { maxAge: '2h' });
    req.user = data;
  } catch (error: any) {
    console.error('Invalid token:', error.message);
    req.user = null;
  }
  return req;
};

// sign new token and return it
export const signToken = (
  username: string,
  email: string,
  _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey: any = process.env.JWT_SECRET_KEYk;
  return jwt.sign({ data: payload }, secretKey, { expiresIn: '2h' });
};

// send graphql error if auth doesn't pass check
export class AuthError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED'
      }
    });
    Object.defineProperty(this, 'name', { value: 'AuthError' });
  }
};







// import type { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';

// import dotenv from 'dotenv';
// dotenv.config();

// interface JwtPayload {
//   _id: unknown;
//   username: string;
//   email: string,
// }

// export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
//   const authHeader = req.headers.authorization;

//   if (authHeader) {
//     const token = authHeader.split(' ')[1];

//     const secretKey = process.env.JWT_SECRET_KEY || '';

//     jwt.verify(token, secretKey, (err, user) => {
//       if (err) {
//         return res.sendStatus(403); // Forbidden
//       }

//       req.user = user as JwtPayload;
//       return next();
//     });
//   } else {
//     res.sendStatus(401); // Unauthorized
//   }
// };

// export const signToken = (username: string, email: string, _id: unknown) => {
//   const payload = { username, email, _id };
//   const secretKey = process.env.JWT_SECRET_KEY || '';

//   return jwt.sign(payload, secretKey, { expiresIn: '1h' });
// };
