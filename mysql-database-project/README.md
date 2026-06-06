# MySQL Database Project

This project is designed to manage a MySQL database with a structured approach, including schema definition, migrations, and seed data for testing purposes.

## Project Structure

```
mysql-database-project
├── db
│   ├── schema.sql               # SQL statements to create the database schema
│   ├── migrations                # Directory for migration files
│   │   ├── 001_create_tables.sql # Initial table creation SQL commands
│   │   └── 002_add_indexes.sql   # SQL commands to add indexes for optimization
│   └── seeds                     # Directory for seed data
│       └── seed_data.sql         # SQL statements to insert initial data
├── src
│   ├── db
│   │   └── index.js              # Database connection setup
│   └── app.js                    # Main application entry point
├── .env.example                  # Template for environment variables
├── package.json                  # npm configuration file
└── README.md                     # Project documentation
```

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd mysql-database-project
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Configure environment variables**:
   - Copy `.env.example` to `.env` and fill in the required database connection details.

4. **Create the database schema**:
   - Run the SQL commands in `db/schema.sql` to set up the database structure.

5. **Run migrations**:
   - Execute the migration files in the `db/migrations` directory to create tables and add indexes.

6. **Seed the database**:
   - Use the `db/seeds/seed_data.sql` file to insert initial data for testing.

## Usage

- Start the application by running:
  ```
  node src/app.js
  ```

- The application will connect to the MySQL database and execute the defined logic.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.