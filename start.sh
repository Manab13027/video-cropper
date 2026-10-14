#!/bin/bash
cd "$(dirname "$0")"

npm run dev &
SERVER_PID=$!

until curl -s http://localhost:5173 > /dev/null 2>&1; do
  sleep 0.3
done

open http://localhost:5173

wait $SERVER_PID
