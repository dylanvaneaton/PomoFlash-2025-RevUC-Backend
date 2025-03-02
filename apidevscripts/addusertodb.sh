#!/usr/bin/bash
curl -X POST http://localhost:3001/api/useradd \
-H "Content-Type: application/json" \
-d '{"firstname":"Dylan", "userlogin":"dman"}'

