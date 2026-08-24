#!/bin/bash
# Start the PlayBeat dev server in a fully detached, persistent way.
cd /home/z/my-project

# Kill any existing dev servers
pkill -9 -f "tsx server" 2>/dev/null
pkill -9 -f "bun run dev" 2>/dev/null
sleep 2

# Start with setsid + nohup — completely detaches from the shell
# so it survives the bash session ending.
setsid nohup bun run dev > /home/z/my-project/dev.log 2>&1 < /dev/null &
DEV_PID=$!

# Wait for server to boot
for i in {1..20}; do
  if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null | grep -q "200"; then
    echo "Server is up (PID: $DEV_PID)"
    echo "$DEV_PID" > /home/z/my-project/.dev.pid
    exit 0
  fi
  sleep 1
done

echo "Server failed to start in 20s"
echo "--- LOG ---"
cat /home/z/my-project/dev.log
exit 1
