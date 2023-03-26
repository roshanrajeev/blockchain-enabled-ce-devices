@echo off

start cmd /k "cd D:\Practice\blockchain-enabled-ce-devices\fog-server && set HTTP_PORT_FOG=8001 && set P2P_PORT_FOG=4001 && set HTTP_PORT_CHAIN=3001 && set PEERS=ws://localhost:4002,ws://localhost:4003 && yarn run dev"

start cmd /k "cd D:\Practice\blockchain-enabled-ce-devices\fog-server && set HTTP_PORT_FOG=8002 && set P2P_PORT_FOG=4002 && set HTTP_PORT_CHAIN=3002 && set PEERS=ws://localhost:4001,ws://localhost:4003 && yarn run dev"

start cmd /k "cd D:\Practice\blockchain-enabled-ce-devices\fog-server && set HTTP_PORT_FOG=8003 && set P2P_PORT_FOG=4003 && set HTTP_PORT_CHAIN=3003 && set PEERS=ws://localhost:4001,ws://localhost:4002 && yarn run dev"