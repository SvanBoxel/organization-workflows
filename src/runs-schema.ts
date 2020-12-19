import * as mongoose from 'mongoose';

const runExpiry = 60 * 60 * 24 * 90; // 90 days

export interface IRun extends mongoose.Document {
  sha: string;
  callback_url: string;
  check?: {
    run_id: number; // The run in the central workflow
    name?: string; // Name of the status check
    checks_run_id: number; // ID of status check on commit
  }
  repository: {
    owner: string;
    name: string;
    full_name: string;
  },
  expire_at?: Date
};

export const RunSchema = new mongoose.Schema({
  sha: String,
  callback_url: String,
  check: {
    run_id: Number,
    name: String,
    checks_run_id: Number
  },
  repository: {
    owner: String,
    name: String,
    full_name: String
  },
  expire_at: {
    type: Date, 
    default: Date.now, 
    expires: runExpiry
  } 
});

const Run = mongoose.model<IRun>('Run', RunSchema);

export default Run;
