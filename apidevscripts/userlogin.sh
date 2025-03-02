#!/usr/bin/bash
curl -X POST http://10.1.0.2:59632/api/login \
-H "Content-Type: application/json" \
-d "{\"userlogin\":\"$1\"}"

