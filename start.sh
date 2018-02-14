#!/bin/bash

export PORT=5120

cd ~/www/memory2
./bin/memory2 stop || true
./bin/memory2 start

