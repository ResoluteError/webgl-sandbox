#!/bin/bash

(cd ./server; npm run server) &
(cd ./client; npm run client)