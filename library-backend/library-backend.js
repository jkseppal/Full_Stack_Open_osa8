const { v4: uuidv4 } = require ('uuid');
const config = require('./utils/config')
const { ApolloServer, UserInputError, gql, AuthenticationError } = require('apollo-server')
const { UniqueDirectiveNamesRule } = require('graphql')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

mongoose.set('useFindAndModify', false)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Author {
    name: String!
    born: Int
    id: ID!
    bookCount: Int
  }
  
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String]
    id: ID!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String]
    ): Book

    addAuthor(
      name: String!
      born: Int
    ): Author

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author

    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    /*allBooks: (root, args) => {
      let booksToReturn = books
      if (args.author) {
        booksToReturn = booksToReturn.filter(b => b.author === args.author)
      }
      if (args.genre) {
        booksToReturn = booksToReturn.filter(b => b.genres.includes(args.genre))
      }
      return booksToReturn
    },*/
    allBooks: async (root, args) => {
      const books = await Book.find({}).populate('author', { name: 1 })
      return books
    },
    allAuthors: (root,args) => {
      return Author.find({})
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  //ei toimi vielä!
  /*Author: {
    bookCount: (author) => {
      const booksByAuthor = books.filter(book => book.author === author.name)
      const numberOfBooks = booksByAuthor.length
      return numberOfBooks
    }
  },*/
  Author: {
    bookCount: (root, args) => {
      const books = Book.countDocuments({ author: { $in: root._id }})
      return books
    }
  },
  Mutation: {
    /*addBook: (root, args) => {
      const book = { ...args, id: uuidv4() }
      const author = authors.find(a => a.name === args.author)
      if (!author) {
        const newAuthor = ({ name: args.author, id: uuidv4() })
        //addAuthor({ name: args.author })
        authors = authors.concat(newAuthor)
      }
      books = books.concat(book)
      return book
    },*/
    addBook: async (root, args, context) => {
      const currentUser = await context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      const author = await Author.findOne({ name: args.author })
      if (author === null) {
        const newAuthor = new Author({ name: args.author })
        const book = new Book({ ...args, author: newAuthor }).populate('author')
        try {
          book.save()
          newAuthor.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      } else {
        const book = new Book({ ...args, author: author }).populate('author')
        try {
          book.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      }
    },
    /*addAuthor: (root, args) => {
      const author = { ...args, id: uuidv4() }
      authors = authors.concat(author)
      return author
    },*/
    addAuthor: (root, args) => {
      const author = new Author({ ...args })
      return author.save
    },
    //ei toimi vielä!
    /*editAuthor: (root, args) => {
      let author = authors.find(a => a.name === args.name)
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      return author
    }*/
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      let author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      author.save()
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET)}
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User
        .findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})