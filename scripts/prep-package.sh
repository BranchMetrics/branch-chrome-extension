#!/usr/bin/env bash

# Package the extension into a distributable zip.
#
# What it does:
# - Creates <repo-name>.zip at the repository root.
# - Zips the repository folder from its parent directory so paths inside the zip
#   include the project directory name (as expected by many distribution flows).
# - Excludes local/dev artifacts (.git, .idea, .DS_Store), any existing output zip,
#   and the scripts/ directory.
#
# When to use it:
# - Before uploading to the Chrome Web Store.
# - When sharing a clean build artifact with someone (without repo metadata).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_NAME="$(basename "$ROOT_DIR")"
ZIP_NAME="${PROJECT_NAME}.zip"
ZIP_PATH="${ROOT_DIR}/${ZIP_NAME}"

rm -f "$ZIP_PATH"

TMP_ZIP="$(mktemp -t "${PROJECT_NAME}.zip.XXXXXX")"
rm -f "$TMP_ZIP"

(
  cd "$(dirname "$ROOT_DIR")"
  zip -r "$TMP_ZIP" "$PROJECT_NAME" \
    -x "${PROJECT_NAME}/.git/*" \
    -x "${PROJECT_NAME}/.idea/*" \
    -x "${PROJECT_NAME}/.DS_Store" \
    -x "${PROJECT_NAME}/${ZIP_NAME}" \
    -x "${PROJECT_NAME}/scripts/*"
)

mv "$TMP_ZIP" "$ZIP_PATH"

echo "Created: $ZIP_PATH"
