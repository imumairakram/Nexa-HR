#!/usr/bin/env bash

# Resolve script directory and execute run.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$SCRIPT_DIR/run.sh" "$@"
