const mongoose = require('mongoose');
const Patient = require('./models/patient'); // Ensure the path is correct based on your directory structure

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/medicalApp')
  .then(async () => {
    console.log('MongoDB connected');
    
    try {
      // Delete all documents in the 'patients' collection
      const result = await Patient.deleteMany({});
      console.log('All documents deleted successfully', result);
    } catch (err) {
      console.error('Error deleting documents:', err);
    } finally {
      // Close the connection after the operation
      mongoose.connection.close();
    }
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));
