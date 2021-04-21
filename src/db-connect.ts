import mongoose from 'mongoose'
import { getEnv } from './utils/env-vars';
const mongoUri = getEnv('DB_HOST') || 'localhost'

interface iStatus {
  connection: string,
  dbState: string
}

let connection: string = 'down';
async function dbConnect(): Promise<{ dbStatus: () => iStatus }> {
  try {
    await mongoose.connect(mongoUri, {
      user: getEnv('DB_USER'),
      pass: getEnv('DB_PASS'),
      dbName: getEnv('DB_NAME'),
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


