// import user model, auth functions
// import { saveBook } from '../dist/controllers/user-controller';
import { User } from '../models/index.js';
import { signToken, AuthError } from '../services/auth.js';


// need interfaces for user, input, login
interface User {
  _id: string,
  username: string,
  email: string;
  savedBooks?: any[];
}
interface AddNewUser {
  input: {
    username: string;
    email: string;
    password: string;
  };
}
interface UserLogin {
  email: string,
  password: string;
}

// resolvers
// me query
// returns data of the user held in the auth token, or throws error that says "Please log in!"
const resolvers = {
  Query: {
    Me: async (_parent: any, _args: any, context: any) => {

      if (context.user) {
        const userData = await User.findById(context.user._id).select('-__v -password');
        return userData;
      }
      throw new AuthError('Error! Please log in.');
    },
  },
  
  // mutations
    // sign up
    // login
    // save new book
    // remove saved book
  
  Mutation: {
    //adds user to db using AddNewUser args
    addUser: async (_parent: any, { input }:  AddNewUser) => {
      const user = await User.create({ ...input });
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    // checks for the user in db, matches pw, returns token if data is correct; else, throws error "User not found" OR "Username/Pw incorrect"

    login: async (_parent: any, { email, password }: UserLogin) => {
      const user = await User.findOne({ email });
      if (!user) {
        //FIXME - make it harder for brute-force attacks by throwing the same error for both username and pass
        throw new AuthError('Oops! Username or password incorrect. (TESTuser)');
      }
      const passwordAuth = await user.isCorrectPassword(password);
      if (!passwordAuth) {
        //FIXME make it harder for brute-force attacks by throwing the same error for both username and pass
        throw new AuthError('Oops! Username or password incorrect. (TESTpass)');
      }
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
// save new book to the user obj that matdches the current user (as indicated by the token)
  saveBook: async (_parent: any, { input }: any, context: any) => {
    if (!context.user) throw new AuthError('Please log in first.')
    try {
      console.log(`Saving new book ${input.bookId} for ${context.user._id}`);
      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: input } },
        { new: true, runValidators: true }
      );
      console.log('Book saved for ${context.user._id}.')
      return updatedUser;
    } catch (err) {
        console.error(err);
        throw new Error('Error; did not save book.');
      }
    },
//remove saved book
    removeBook: async (_parent: any, { bookId }: any, context: any) => {
      if (!context.user) throw new Error('You must be logged in');
      try {
          console.log(`Removing book ${bookId} for user ${context.user._id}`)
          const updatedUser = await User.findByIdAndUpdate(
              context.user._id,
              { $pull: { savedBooks: { bookId } } },
              { new: true }
          );
          console.log('Book successfully removed.')
          return updatedUser;
      } catch (err) {
          console.error(err);
          throw new Error('Error; did not remove book.');
      }
    },
  },
};
// export resolvers
export default resolvers;
    
    
    
    // then: upgrade front end to use graphql
    // then: update front-end components
    // then: update api.ts to reflect graphql
    // test
    // deploy







// const resolvers = {
//   Query: {
//     me: async (parent, args, context) => {
//       if (context.user) {
//         return await User.findById(context.user._id).populate('savedBooks');
//       }
//       throw new AuthenticationError('You need to be logged in!');
//     }
//   },
//   Mutation: {
//     login: async (parent, { email, password }) => {
//       const user = await User.findOne({ email });
//       if (!user) {
//         throw new AuthenticationError('No user found with this email address');
//       }

//       const correctPw = await user.isCorrectPassword(password);
//       if (!correctPw) {
//         throw new AuthenticationError('Incorrect credentials');
//       }

//       const token = signToken(user);
//       return { token, user };
//     },
//     addUser: async (parent, { username, email, password }) => {
//       const user = await User.create({ username, email, password });
//       const token = signToken(user);
//       return { token, user };
//     },
//     saveBook: async (parent, { bookData }, context) => {
//       if (context.user) {
//         return await User.findOneAndUpdate(
//           { _id: context.user._id },
//           { $addToSet: { savedBooks: bookData } },
//           { new: true, runValidators: true }
//         ).populate('savedBooks');
//       }
//       throw new AuthenticationError('You need to be logged in!');
//     },
//     removeBook: async (parent, { bookId }, context) => {
//       if (context.user) {
//         return await User.findOneAndUpdate(
//           { _id: context.user._id },
//           { $pull: { savedBooks: { bookId } } },
//           { new: true }
//         ).populate('savedBooks');
//       }
//       throw new AuthenticationError('You need to be logged in!');
//     }
//   }
// };
