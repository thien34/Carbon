Users Table
user_id (Primary Key, UUID)
wallet_address (Text, Unique)
registration_timestamp (Timestamp)
CarbonCredits Table
credit_id (Primary Key, UUID)
user_id (Foreign Key, UUID, References Users)
off_chain_certificate_id (Text)
on_chain_token_address (Text)
token_amount (Decimal)
token_type (Text)
emission_type (Text)
project_id (Foreign Key, UUID, References Projects)
timestamp (Timestamp)
Projects Table
project_id (Primary Key, UUID)
project_name (Text)
project_location (Text)
project_description (Text)
project_certification (Text)
project_status (Text)
Transactions Table
transaction_id (Primary Key, UUID)
user_id (Foreign Key, UUID, References Users)
from_address (Text)
to_address (Text)
token_amount (Decimal)
token_type (Text)
transaction_type (Text) ['buy', 'sell', 'stake', 'unstake', 'claim']
transaction_timestamp (Timestamp)
Now let's provide an explanation of database design in general and the specific design we have provided.

Database design is the process of creating a structured and organized way of storing, managing, and retrieving data in a database. The goal is to ensure that data is stored efficiently, accurately, and securely while allowing for easy access and manipulation. The key components of a database design are the tables, columns, relationships, and constraints.

In our design, we have four tables: Users, CarbonCredits, Projects, and Transactions.

Users Table: This table stores information about each user, such as their unique identifier (user_id), wallet address, and registration timestamp. The user_id is the primary key, which ensures each user has a unique identifier.

CarbonCredits Table: This table stores information about carbon credits, including the unique identifier (credit_id), the user who owns the credit (user_id), and other relevant details such as the off-chain certificate ID, on-chain token address, token amount, token type, emission type, and the project it is associated with (project_id).

Projects Table: This table stores information about projects that generate carbon credits, including a unique identifier (project_id), project name, location, description, certification, and status.

Transactions Table: This table stores information about various transactions made by users, such as buying, selling, staking, unstaking, and claiming carbon credits. Each transaction has a unique identifier (transaction_id), user who made the transaction (user_id), from and to addresses, token amount, token type, and transaction type.

In our design, we have established relationships between tables using foreign keys, which link records in one table to records in another table. For example, the CarbonCredits table has a foreign key (user_id) that references the Users table, indicating the ownership of carbon credits by a user. Similarly, the Transactions table has a foreign key (user_id) that references the Users table, linking each transaction to a specific user.

Constraints, such as primary keys and unique constraints, are used to ensure data integrity and prevent duplicate entries. For example, the wallet_address in the Users table has a unique constraint, ensuring that each wallet address can only be associated with one user.

This database design aims to store and manage data related to users, carbon credits, projects, and transactions efficiently and accurately, while providing easy access to the data when needed.



