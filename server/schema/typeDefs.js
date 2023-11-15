const gql = String.raw;

const typeDefs = gql`
  type Book {
    bookId: String
    authors: String
    description: String
    title: String
    image: String
    link: String
  }
  type User {
    _id: String
    username: String
    email: String
    bookCount: Int
    savedBooks: [Book]
  }
  type Auth {
    token: String
    user: [User]
  }

  input BookInput {
    bookId: String
    authors: String
    description: String
    title: String
    image: String
    link: String
  }

  type Query {
    getOneUser: [User]
  }

  type Mutation {
    addUser(email: String!, password: String!): User
    login(email: String!, password: String!): User
    saveBook:(book: BookInput!): User
    removeBook:(bookId: String!): User
  }
`;
