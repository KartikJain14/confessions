# 🎉 Confession App Documentation

## 🌟 Overview

Welcome to the **Confession App**! This web application, built with **Express.js** and **Sequelize**, allows users to anonymously submit, view, and vote on confessions. It features an admin panel for managing confessions, along with rate limiting to prevent abuse.

## 🚀 Features

- **🤫 Anonymous Submissions**: Users can submit confessions within a character limit.
- **👍 Upvote & 👎 Downvote**: Users can vote on confessions, influencing their visibility.
- **🛠 Admin Panel**: View, edit, and delete confessions with ease.
- **🚦 Rate Limiting**: Protects against abuse with configurable voting and posting limits.
- **🕒 Automatic Archiving**: Low-scoring confessions are automatically archived.
- **📱 Responsive Design**: Enjoy a smooth experience across devices.

## 🛠 Technologies Used

- **Node.js**: JavaScript runtime for building server-side applications.
- **Express**: A fast, unopinionated web framework for Node.js.
- **Sequelize**: ORM for easy database interactions.
- **EJS**: Templating engine for rendering dynamic views.
- **CORS**: Middleware for enabling Cross-Origin Resource Sharing.
- **dotenv**: Loads environment variables from a `.env` file.
- **express-rate-limit**: Middleware for rate limiting requests.

## 📥 Installation

Follow these steps to host your own Confession App:

1. **Clone the Repository**:

   git clone https://github.com/KartikJain14/confessions.git
   cd confessions

2. **Install Dependencies**:

   npm install

3. **Create a `.env` File**:

   Add the following environment variables in a `.env` file:

   PORT=3000
   
   ADMIN_PATH=admin
   
   VOTE_WINDOW=3 # hours
   
   VOTE_LIMIT=10 # votes per IP per hour
   
   POST_WINDOW=3 # hours
   
   POST_LIMIT=3 # posts per IP per hour
   
   LOWEST_SCORE=-5

5. **Set Up Your Database**: Configure your database and update the Sequelize settings as necessary.

## 🏃 Usage

1. **Start the Server**:

   npm start

2. **Access the App**: Open your browser and navigate to http://localhost:3000.

3. **Explore the Features**: Submit confessions, vote on them, and manage them through the admin panel.

## 📋 Routes

| Method | Route                | Description                           |
|--------|----------------------|---------------------------------------|
| GET    | `/`                  | Render the homepage                   |
| GET    | `/confessions`       | View all confessions                  |
| GET    | `/confession/:id`    | View a specific confession            |
| POST   | `/confess`           | Submit a new confession               |
| POST   | `/confess/vote/:id/:vote` | Vote on a confession             |
| GET    | `/${ADMIN_PATH}`     | View the admin panel                  |
| GET    | `/${ADMIN_PATH}/edit/:id` | Edit a specific confession        |
| POST   | `/${ADMIN_PATH}/update` | Update a confession                 |
| POST   | `/${ADMIN_PATH}/delete/:id` | Delete a confession             |

## ⚙️ Configuration

Make sure to set the following environment variables in your `.env` file:

- **`PORT`**: Port on which the server will run (default: 3000).
- **`ADMIN_PATH`**: Path for admin routes (default: `admin`).
- **`VOTE_WINDOW`**: Time window for vote limiting in hours (default: 1).
- **`VOTE_LIMIT`**: Maximum votes per IP per time window (default: 15).
- **`POST_WINDOW`**: Time window for post limiting in hours (default: 1).
- **`POST_LIMIT`**: Maximum posts per IP per time window (default: 2).
- **`LOWEST_SCORE`**: Score threshold for automatic archiving of confessions (default: -10).

## 🤝 Contributing

Contributions are welcome! If you'd like to help improve the Confession App:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Submit a pull request with a clear description of your changes.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## ✅ To Do

- **🔧 Improve UI/UX**: Enhance the user interface for a better user experience on all devices.
- **📊 Analytics Dashboard**: Create an admin analytics dashboard to visualize confession trends.
- **💬 Comment System**: Allow users to comment on confessions for deeper engagement.
- **🛡 Security Enhancements**: Add measures to further secure the application against potential threats.
- **📜 Documentation Updates**: Regularly update documentation as features are added or changed.

## 🌐 Contact

For any questions or suggestions, feel free to reach out:

- **GitHub**: [KartikJain14](https://github.com/KartikJain14)

Thank you for checking out the Confession App! We hope you enjoy using it and contributing to its growth. Happy coding! 🎉
