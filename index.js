const express = require('express');
const userRoutes = require('./routes/userRoutes');
const app = express();

// Initialize middleware
app.use(express.json());

// Routes
app.use('/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
