const User = require("../models/User");
const Book = require("../models/Book");
const { createToken } = require("./helpers");

const resolvers = {
  Query: {
    async getOneUser() {
      try {
        const user = await User.find().populate("books");

        return user;
      } catch (error) {
        throw new Error("unable to get user");
      }
    },
  },
  Mutation: {
    async addUser(_, args, context) {
      try {
        const user = await User.create(args);

        const token = await createToken(user._id);

        context.res.cookie("token", token, {
          maxAge: 60 * 60 * 1000,
          httpOnly: true,
        });

        return user;
      } catch (error) {
        let message;

        if (err.code === 11000) {
          message = err.message;
        }
        throw new Error(message);
      }
    },
    async login(_, args, context) {
      const { email, password } = args;

      const user = await User.findOne({ email });

      if (!user) throw new Error("No user with that email found");

      const is_valid = await user.validatePass(password);

      if (!is_valid) throw new Error("password is invalid");

      const token = await createToken(user._id);

      context.res.cookie("token", token, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.PORT ? true : false,
      });

      return user;
    },
    async saveBook(_, args, context) {
      try {
        const { user } = context;
        if (!user) throw new Error("User loggedout");

        const newBook = await Book.create(args.book);

        const currentUser = await User.findById(user._id);

        if (!currentUser) throw new Error("No user found");

        currentUser.savedBooks.push(newBook);

        await currentUser.save();

        return currentUser;
      } catch (error) {
        throw new Error("Failed to add book" + error.message);
      }
    },
    async removeBook(_, args, context) {
      try {
        const { user } = context;
        if (!user) throw new Error("No user logged in");

        const currentUser = await User.findById(user._id);
        if (!currentUser) throw new Error("no user found");

        const bookIndex = currentUser.savedBooks.findIndex(
          (book) => book._id.toString() === args.bookId
        );

        if (bookIndex === -1)
          throw new Error("that book is not attached to this user");
        currentUser.saveBooks.splice(bookIndex, 1);

        await currentUser.save();

        return currentUser;
      } catch (error) {
        throw new Error("unable to delete book" + error.message);
      }
    },
  },
};

module.exports = resolvers;
