#!/bin/sh

# method for showing error alert via AppleScript
function error() {
  osascript <<EOT
    tell app "System Events"
      display dialog "$1" buttons {"OK"} default button 1 with icon caution with title "$(basename $0)"
      return  -- Suppress result
    end tell
EOT
}

# check for node
command -v node >/dev/null 2>&1 || { error >&2 "requires nodejs to be installed"; exit 1; }

# safely switch to the directory the script is in
here="`dirname \"$0\"`"
echo "cd-ing to $here"
cd "$here" || exit 1

# we fire up the browser first because the next line halts the script
open https://localhost:8017/index.html

node server.js