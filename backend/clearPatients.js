const mongoose = require('mongoose');
const Patient = require('./models/patient'); // Make sure the path is correct based on your directory structure

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/medicalApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  // Delete all documents in the 'patients' collection
  Patient.deleteMany({}, (err) => {
    if (err) {
      console.error('Error deleting documents:', err);
    } else {
      console.log('All documents deleted successfully');
    }
    mongoose.connection.close(); // Close the connection after the operation
  });
})
.catch(err => console.error('Error connecting to MongoDB:', err));
