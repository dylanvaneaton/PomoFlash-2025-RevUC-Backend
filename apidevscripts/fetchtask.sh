#!/usr/bin/bash
curl -X POST http://10.1.0.2:59632/api/fetchtasks \
-H "Content-Type: application/json" \
-d "{\"userid\":$1}"

