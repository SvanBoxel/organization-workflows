#!/bin/bash

npm install
cp .env.example .env
node ./.devcontainer/set-env.js 