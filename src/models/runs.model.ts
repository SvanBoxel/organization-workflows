import * as mongoose from 'mongoose'

const runExpiry = 60 * 60 * 24 * 90 // 90 days

export interface ICheck {
  run_id: number; // The run in the central workflow
  name?: string; // Name of the status check
  checks_run_id: number; // ID of status check on commit
}

export interface IRun extends mongoose.Document {
  sha: string;
  callback_url: string;
  checks: Array<ICheck>;
  repository: {
    owner: string;
    name: string;
    full_name: string;
  },
  config: {
    workflows_repository: string;
  }
  expire_at?: Date
}

export const RunSchema = new mongoose.Schema({
  sha: String,
  callback_url: String,
  checks: [{
    run_id: Number,
    name: String,
    checks_run_id: Number
  }],
  repository: {
    owner: String,
    name: String,
    full_name: String
  },
  config: {
    workflows_repository: String
  }
})

RunSchema.index(
  { 
    createdAt: 1,
    unique: true,
    sparse: true,
  }, { 
    expireAfterSeconds: runExpiry 
  })
  
const Run = mongoose.model<IRun>('Run', RunSchema)

// Update existing document with config.workflows_repository field
Run.update(
  { 'config.workflows_repository': { $exists:false } },
  { $set: {'config': { workflows_repository: '.github'}} },
  { new: true, multi: true }, 
  function(err, numberAffected) {  
    if (err) return console.error(err);
    if (numberAffected?.ok) {
      console.log('updated', numberAffected.nModified, 'rows')
    }
  }
) 

export default Run
