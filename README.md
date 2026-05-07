# Blog Backend API 🚀

Blog Backend is a high-performance, scalable GraphQL API built with NestJS, designed to power modern blogging platforms. This project implements secure authentication, CRUD operations for blogs and comments, and follows best practices for enterprise-grade applications.

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the App](#-running-the-app)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Development](#-development)

---

## 🌟 Key Features

- **Authentication**: Secure user registration and login using JSON Web Tokens (JWT).
- **GraphQL API**: Type-safe, efficient data fetching with GraphQL.
- **MongoDB Integration**: Robust data modeling using Mongoose ODM.
- **Validation**: Automatic request validation using NestJS Pipes.
- **Swagger Documentation**: Interactive API documentation.

---

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) - Progressive Node.js framework for building efficient, scalable, and maintainable server-side applications.
- **GraphQL**: [Apollo Server](https://www.apollographql.com/docs/apollo-server) - High-performance GraphQL server for Node.js.
- **Database**: [MongoDB](https://www.mongodb.com/) - NoSQL document database.
- **ODM**: [Mongoose](https://mongoosejs.com/) - MongoDB object modeling tool for Node.js.
- **Validation**: [class-validator](https://github.com/typestack/class-validator) & [class-transformer](https://github.com/typestack/class-transformer).
- **Validation**: [Husky](https://typicode.github.io/husky/) & [lint-staged](https://github.com/lint-staged/lint-staged) for Git hooks.
- **Build Tool**: [TypeScript](https://www.typescriptlang.org/) - Superset of JavaScript that adds static type definitions.

---

## 📥 Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/sanyalkingshuk/blog-be.git
   cd blog-be
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```
   _Note: This project uses [pnpm](https://pnpm.io/) as the package manager._

---

## ⚙️ Configuration

1. Create a `.env` file in the root directory based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

2. Configure the following environment variables:

   | Variable              | Description               | Example                            |
   | --------------------- | ------------------------- | ---------------------------------- |
   | `NODE_ENV`            | Application environment   | `development`                      |
   | `PORT`                | Port number               | `3000`                             |
   | `MONGODB_URI`         | MongoDB connection string | `mongodb://localhost:27017/blogdb` |
   | `JWT_SECRET`          | JWT signing secret        | `your-secret-key`                  |
   | `JWT_EXPIRATION_TIME` | Token expiration time     | `3600s`                            |

---

## 🏃 Running the App

### Development Mode

Start the server with hot-reload enabled:

```bash
pnpm run start:dev
```

The server will start at `http://localhost:3000`.

### Production Mode

Build and run the application:

```bash
pnpm run build
pnpm run start:prod
```

---

## 🧪 Testing

### Unit Tests

Run unit tests:

```bash
pnpm run test
```

Run tests with coverage:

```bash
pnpm run test:cov
```

### E2E Tests

Run end-to-end tests:

```bash
pnpm run test:e2e
```

---

## 📦 Build

Build the production bundle:

```bash
pnpm run build
```

---

## 📁 Project Structure

```
blog-be/
├── src/
│   ├── modules/              # Feature modules
│   │   ├── auth/             # Authentication module
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.resolver.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.schema.ts
│   │   ├── blog/             # Blog module
│   │   ├── comment/          # Comment module
│   │   └── user/             # User module
│   ├── common/               # Shared utilities
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── guards/           # Guards
│   │   ├── interceptors/     # Interceptors
│   │   └── providers/        # Providers
│   ├── config/               # Configuration module
│   ├── filters/              # Exception filters
│   ├── guards/               # Global guards
│   ├── interceptors/         # Global interceptors
│   ├── main.ts               # Application entry point
│   ├── middleware/           # Middleware
│   ├── pipes/                # Global pipes
│   └── types/                # TypeScript types
├── .husky/                  # Git hooks
├── test/                    # Test files
│   └── e2e/                  # E2E test suite
├── .env.example             # Environment variables template
├── package.json             # Project dependencies
└── tsconfig.json            # TypeScript configuration
```

---

## 🤝 Development

### Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality:

- **pre-commit**: Runs [lint-staged](https://github.com/lint-staged/lint-staged) to format code and run lint checks before committing.
- **commit-msg**: Validates commit messages using [commitlint](https://commitlint.js.org/).
- **post-merge**: Automatically installs dependencies after merging.

### Code Quality

- **ESLint**: Linting for JavaScript/TypeScript.
- **Prettier**: Code formatting.
- **TypeScript**: Static type checking.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact

- **Author**: Kingshuk Sanyal
- **Email**: [EMAIL_ADDRESS]
- **GitHub**: [https://github.com/sanyalkingshuk](https://github.com/sanyalkingshuk)

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [GraphQL](https://graphql.org/) - Query language for APIs
- [MongoDB](https://www.mongodb.com/) - NoSQL database

---

## 📝 Notes

- This project is built with NestJS and follows the official documentation and best practices.
- All GraphQL resolvers, schemas, and services are implemented according to the NestJS GraphQL module documentation.
