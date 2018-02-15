#!/bin/bash

export PORT=5120

cd ~/www/memory2
./bin/memory stop || true
./bin/memory start

