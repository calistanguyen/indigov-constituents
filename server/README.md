# Constituent Data CSV Server

A TypeScript Express server that reads user data from a CSV file and provides a REST API.

## Features

- Built with TypeScript for type safety
- Reads and writes constituent data from/to a CSV file
- Provides REST API endpoints for CRUD operations

## API Endpoints

| Method | Endpoint             | Description                                          |
| ------ | -------------------- | ---------------------------------------------------- |
| GET    | /constituents        | Get all constituents                                 |
| GET    | /constituents/export | Export constituents as a csv filtered by signup date |
| POST   | /constituents        | Create a new constituent                             |
| PUT    | /constituents/:email | Update an existing constituent                       |
| DELETE | /constituents/:email | Delete a constituent                                 |
| POST   | /constituents/submit | Submit a csv of constituents into existing list      |

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server with TypeScript:

   ```bash
   npm run dev
   ```

   For development with auto-restart:

   ```bash
   npm run dev:watch
   ```

3. Build for production:

   ```bash
   npm run build
   ```

4. Start production server:

   ```bash
   npm start
   ```

5. The server will run on http://localhost:3000

## In src

```
src/
├── server.ts         # Main server code
├── constituents.csv  # Constituent data in csv format
└── types.ts          # Defines types for data and request bodies/params
```

## CSV Format

The constituents.csv file should have the following format:

```
email,firstName,lastName,city,state,zip,phone,signUpDate
john@example.com,John,Doe,New York,NY,10001,555-123-4567,01/01/2023
jane@example.com,Jane,Smith,Los Angeles,CA,90001,555-987-6543,02/15/2023
```
