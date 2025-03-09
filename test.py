import asyncio
import websockets
import json

async def test_online_status():
    uri = "ws://localhost:8000/ws/online-status/"
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps({
            "type": "authenticate",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQxMzA1Nzg4LCJpYXQiOjE3NDEyOTk3ODgsImp0aSI6IjczNzVmN2Y1MTZiZTQxMzdiOTM3YjUwMDhiMzUxMjliIiwidXNlcl9pZCI6MTMwMTc0fQ.8S_OQwhQflXg7Tf9kLv3Zs_7hMoVvS5NnNu3BRlFR8c",  # Replace with a valid JWT token
        }))

        while True:
            response = await websocket.recv()
            data = json.loads(response)
            print("Received:", data)

asyncio.run(test_online_status())