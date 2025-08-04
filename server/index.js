const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/user'));
app.use("/api/blogs", require('./src/routes/blog'));
app.use("/api/trending", require('./src/routes/trending'));
app.use("/uploads", express.static("uploads"));
app.use("/api/comments", require('./src/routes/comment'));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
