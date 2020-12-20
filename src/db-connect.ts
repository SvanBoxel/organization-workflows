import mongoose from 'mongoose'
const mongoUri = process.env.DB_HOST || 'localhost'

interface iStatus {
  connection: string,
  dbState: string
}

let connection: string = 'down';
async function dbConnect(): Promise<{ dbStatus: () => iStatus }> {
  try {
    await mongoose.connect(mongoUri, {
      user: process.env.DB_USER,
      pass: process.env.DB_PASS,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    connection = 'up'
    console.log("DB connection established");
  } catch (e) {
    connection = 'down';
    throw e;
  }

  return { dbStatus }
}

function dbStatus(): iStatus  {
  return { 
    connection, 
    dbState: mongoose.STATES[mongoose.connection.readyState] 
  }
};

export { dbStatus }
export default dbConnect;


