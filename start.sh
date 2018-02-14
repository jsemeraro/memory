#!/bin/bash

export PORT=5120

cd ~/www/memory
./bin/memory stop || true
./bin/memory start

