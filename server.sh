#!/bin/bash

# Server management script for marketplace project

case "$1" in
    start)
        echo "Starting marketplace server..."
        npm start
        ;;
    dev)
        echo "Starting marketplace server in development mode..."
        npm run dev
        ;;
    stop)
        echo "Stopping marketplace server..."
        pkill -f "node server.js"
        pkill -f "nodemon server.js"
        echo "Server stopped"
        ;;
    restart)
        echo "Restarting marketplace server..."
        pkill -f "node server.js"
        pkill -f "nodemon server.js"
        sleep 2
        npm start
        ;;
    status)
        echo "Checking server status..."
        if pgrep -f "node server.js" > /dev/null; then
            echo "✅ Server is running"
            pgrep -f "node server.js" | xargs ps -o pid,cmd -p
        else
            echo "❌ Server is not running"
        fi
        ;;
    port)
        echo "Checking what's using port 3000..."
        lsof -ti:3000 | xargs -I {} ps -o pid,cmd -p {} 2>/dev/null
        ;;
    *)
        echo "Usage: $0 {start|dev|stop|restart|status|port}"
        echo "  start   - Start the server with npm start"
        echo "  dev     - Start the server in development mode with nodemon"
        echo "  stop    - Stop all marketplace server processes"
        echo "  restart - Stop and restart the server"
        echo "  status  - Check if server is running"
        echo "  port    - Check what's using port 3000"
        exit 1
        ;;
esac
