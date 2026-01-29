# Dying Shop

Dying Shop is a full-stack e-commerce web application that I built for my ADES module that required me to integrate multiple third-party integrations. It features a complete customer-facing storefront for browsing products, managing a shopping cart, and making purchases, alongside a comprehensive admin dashboard for managing products, categories, customers, and orders. This was meant to be a group project but due to certain reasons, I was tasked with the project myself.


### Disclaimer 
**Note:** This project was created for educational purposes only. It is not intended for production use.

> If you require admin dashboard access feel free to contact me via Email: hohweide@gmail.com
> Side note: Previous closed issues are unavailable as this repo is cloned from a private one


## Features

### Customer Features
- **Product Catalog:** Browse products, filter by category.
- **Product Details:** View detailed information for each product.
- **Shopping Cart:** Add/remove items and adjust quantities using `sessionStorage`.
- **User Authentication:** Secure sign-up, sign-in, and password reset functionality.
- **Email Verification:** New accounts receive a verification link via email.
- **Secure Checkout:** Integrated with Stripe for secure payment processing.
- **Order History:** Authenticated users can view their past orders.
- **User Profile:** Users can update their account details and change their password.
- **Guest Checkout:** Supports placing orders without creating an account.

### Admin Dashboard
- **Secure Access:** Separate login for administrators.
- **Sales Analytics:** Dashboard with statistics on net sales volume, number of sales, top-selling products/categories, and a monthly sales graph.
- **Product Management:** Full CRUD (Create, Read, Update, Delete) functionality for products, including image uploads to Cloudinary.
- **Category Management:** Full CRUD functionality for product categories.
- **Customer Management:** View a list of all registered customers.
- **Order Management:** View all customer orders and process refunds directly through the Stripe API.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** JSON Web Tokens (JWT), bcrypt
- **Payments:** Stripe API
- **Image Storage:** Cloudinary
- **Email Service:** Nodemailer, SendGrid
- **Frontend:** HTML, CSS, Bootstrap, Vanilla JavaScript
- **DevOps:** GitHub Actions for ESLint checks

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm
- A MySQL database
- A Stripe account for payment processing
- A Cloudinary account for image storage
- A SendGrid account for sending emails

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/ael22/dyingshop.git
    cd dyingshop
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the following variables.

    ```
    # Database Configuration
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_HOST=your_db_host
    DB_DATABASE=your_db_name
    DB_CONNECTION_LIMIT=10

    # Server Configuration
    PORT=3000
    DOMAIN=http://localhost:3000

    # JWT Secret
    JWT_SECRET=your_jwt_secret

    # Stripe API Keys
    STRIPE_KEY=your_stripe_secret_key
    STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

    # Cloudinary API Secret
    CLOUDINARY_SECRET=your_cloudinary_api_secret

    # SendGrid API Key & Sender Email
    SENDGRID_API_KEY=your_sendgrid_api_key
    EMAIL_SENDER=your_sender_email@example.com
    ```

4.  **Set up the database:**
    Connect to your MySQL instance and create the necessary tables based on the queries in the `/models` directory.

5.  **Run the application:**
    -   To start the server:
        ```sh
        npm start
        ```
    -   To run in development mode with `nodemon`:
        ```sh
        npm run dev
        ```
    The application will be available at `http://localhost:3000`.

## Project Structure

The repository is organized as follows:

```
├── auth/                 # Authentication helpers (bcrypt, JWT verification)
├── config/               # Configuration files (e.g., Cloudinary)
├── models/               # Database logic and queries for each resource
├── public/               # All frontend static files (HTML, CSS, client-side JS)
│   ├── admin/            # Admin dashboard frontend
│   └── ...               # Customer-facing pages (login, products, etc.)
├── routes/               # API route definitions
│   ├── admin/            # Admin-specific API endpoints
│   ├── api.js            # Main API router
│   └── ...
├── .github/              # GitHub-specific files (e.g., workflows)
├── app.js                # Express application setup, middleware, and webhook handling
├── database.js           # MySQL connection pool setup
└── server.js             # Server entry point
```

## API Endpoints

The application exposes a RESTful API for managing resources.

### Admin API (`/api/admin`)

| Method | Endpoint                    | Description                                  |
| :----- | :-------------------------- | :------------------------------------------- |
| `POST` | `/login`                    | Authenticates an admin and returns a JWT.    |
| `POST` | `/logout`                   | Clears the admin's authentication cookie.    |
| `GET`  | `/customer`                 | Retrieves all customer accounts.             |
| `POST` | `/category`                 | Creates a new product category.              |
| `PUT`  | `/category`                 | Updates an existing category.                |
| `DELETE` | `/category`                 | Deletes a category.                          |
| `POST` | `/product`                  | Creates a new product.                       |
| `PUT`  | `/product`                  | Updates product details.                     |
| `DELETE`| `/product`                  | Deletes a product.                           |
| `PUT`  | `/product/:id/upload`       | Uploads an image for a product.              |
| `GET`  | `/order`                    | Retrieves all orders.                        |
| `POST` | `/order/refund`             | Issues a refund for a specific order.        |
| `GET`  | `/statistic/totalsale`      | Gets total net sales volume and sale count.  |
| `GET`  | `/statistic/popular`        | Gets the most popular product and category.  |
| `GET`  | `/statistic/graph`          | Gets monthly sales data for a line graph.    |

### Public & Customer API

| Method   | Endpoint                  | Description                                            |
| :------- | :------------------------ | :----------------------------------------------------- |
| `GET`    | `/api/category`           | Gets all categories.                                   |
| `GET`    | `/api/category/:id`       | Gets a single category by ID.                          |
| `GET`    | `/api/product`            | Gets products (all or by category).                    |
| `GET`    | `/api/product/:id`        | Gets a single product by ID.                           |
| `POST`   | `/api/signup`             | Registers a new customer account.                      |
| `POST`   | `/api/login`              | Authenticates a customer and returns a JWT.            |
| `POST`   | `/api/checkout`           | Creates a Stripe checkout session for the shopping cart. |
| `GET`    | `/api/verifyemail/:token` | Verifies a user's email via a token link.              |
| `POST`   | `/api/resetpassword/request`| Sends a password reset email.                        |
| `POST`   | `/api/resetpassword`      | Resets the password using a token from the email.      |
| `GET`    | `/api/user`               | Gets the logged-in customer's profile details.         |
| `PUT`    | `/api/user`               | Updates the logged-in customer's profile.              |
| `DELETE` | `/api/user`               | Deletes the logged-in customer's account.              |
| `GET`    | `/api/user/orders`        | Gets the order history for the logged-in customer.     |
| `POST`   | `/api/user/verifyemail`   | Sends a new email verification link.                   |

### Webhooks

| Method | Endpoint   | Description                                       |
| :----- | :--------- | :------------------------------------------------ |
| `POST` | `/webhook` | Handles Stripe events (e.g., `checkout.session.completed`). |