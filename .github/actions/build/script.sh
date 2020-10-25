#!/bin/sh
ls
npm install
npm run electron:build -- --linux deb --win portable nsis -p never
