#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASKDEF_SRC="$SCRIPT_DIR/../taskdef.json"
TASKDEF_OUT="$SCRIPT_DIR/../taskdef.rendered.json"

image="832613171139.dkr.ecr.ap-southeast-1.amazonaws.com/klaro-api-develop:latest"
env_file="arn:aws:s3:::klaro-env-files-develop/.env"
log_group="/ecs/klaro-api-develop"
region="ap-southeast-1"

sed \
  -e "s|\${image}|${image}|g" \
  -e "s|\${env_file}|${env_file}|g" \
  -e "s|\${log_group}|${log_group}|g" \
  -e "s|\${region}|${region}|g" \
  "$TASKDEF_SRC" > "$TASKDEF_OUT"

echo "Rendered task definition written to $TASKDEF_OUT"
