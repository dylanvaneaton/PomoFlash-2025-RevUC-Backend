#!/usr/bin/bash
curl -X POST http://localhost:3001/api/login \
-H "Content-Type: application/json" \
-d "{\"userlogin\":\"$1\"}"

