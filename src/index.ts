import { Probot } from 'probot' // eslint-disable-line @typescript-eslint/no-unused-vars
import { Request, Response } from "express";
import fetch from "node-fetch";
import { getEnv } from './utils/env-vars';
import dbConnect from './db-connect';

import handlePush from './handlers/push'
import handleCompletedRun from './handlers/completed-run'
import handleReRun from './handlers/re-run'
import handleRegister from './handlers/register'
import { app_route } from "./constants";

export default async (app: Probot, { getRouter }: { getRouter: any }) => {
  const { dbStatus } = await dbConnect();
  app.log.info('app started')

  const router = getRouter(app_route)

  app.on('push', handlePush);
  app.on('workflow_run.completed', handleCompletedRun);
  app.on('check_run.rerequested', handleReRun);

  const statsUri = getEnv('STATS_URI')
  if (statsUri) {
    getRouter().get('/probot/stats', async (_: Request, res: Response) => {
      try {
        const response = await fetch(statsUri as string);
        const stats = await response.json();
        res.status(200).json(stats)
      } catch (e) {
        res.status(404)
      }
    });
  }

  router.get('/register', (req: Request, res: Response) => handleRegister(req, res, { app }))
  router.get('/health', (_: Request, res: Response) => {
    const { connection, dbState } = dbStatus();
    const status = connection === 'up' && dbState === 'connected' ? 200 : 503
    res.status(status).json({
      ...dbStatus(),
      sha: getEnv('SHA_REF') || "unknown"
    })
  })
}
