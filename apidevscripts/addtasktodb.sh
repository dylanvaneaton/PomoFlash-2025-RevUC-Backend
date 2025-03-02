#!/usr/bin/bash
curl -X POST http://10.1.0.2:59632/api/addtask \
-H "Content-Type: application/json" \
-d "{\"userid\":\"$1\", \"taskname\":\"$2\", \"taskdescription\":\"$3\", \"taskcompletion\":\"$4\"}"

