@echo off

start cmd /k "cd D:\Practice\blockchain-enabled-ce-devices\blockchain && set HTTP_PORT=3001 && set P2P_PORT=5001 && set PEERS=ws://localhost:5002,ws://localhost:5003 && npm run dev"

start cmd /k "cd D:\Practice\blockchain-enabled-ce-devices\blockchain && set HTTP_PORT=3002 && set P2P_PORT=5002 && set PEERS=ws://localhost:5001,ws://localhost:5003 && npm run dev"

start cmd /k "cd D:\Practice\blockchain-enabled-ce-devices\blockchain && set HTTP_PORT=3003 && set P2P_PORT=5003 && set PEERS=ws://localhost:5001,ws://localhost:5002 && npm run dev"