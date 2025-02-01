import { User } from "../models/User";
import { signToken } from "../utils/auth";
export const resolvers = {
    Query: {
        me: async (_parent, _args, context) => {
            if (context.user) {
                return User.findById(context.user._id).populate("savedBooks");
            }
            throw new Error("You need to be logged in!");
        },
    },
    Mutation: {
        login: async (_parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user || !(await user.isCorrectPassword(password))) {
                throw new Error("Incorrect credentials");
            }
            const token = signToken(user);
            return { token, user };
        },
        addUser: async (_parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (_parent, { bookId, title, authors, description, image, link }, context) => {
            if (context.user) {
                return User.findByIdAndUpdate(context.user._id, { $addToSet: { savedBooks: { bookId, title, authors, description, image, link } } }, { new: true }).populate("savedBooks");
            }
            throw new Error("You need to be logged in!");
        },
        removeBook: async (_parent, { bookId }, context) => {
            if (context.user) {
                return User.findByIdAndUpdate(context.user._id, { $pull: { savedBooks: { bookId } } }, { new: true }).populate("savedBooks");
            }
            throw new Error("You need to be logged in!");
        },
    },
};
