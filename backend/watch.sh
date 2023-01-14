#!/bin/bash

# Install nodemon with npm:
# npm i -g nodemon

nodemon --watch './**/*.go' --signal SIGINT --exec 'go' run main.go