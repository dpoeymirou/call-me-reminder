from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta
import json
import asyncio
from . import models, schemas, crud, auth
from .database import engine, get_db
from .scheduler import start_scheduler

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Call Me Reminder API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "ws://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Start scheduler on startup
@app.on_event("startup")
def startup_event():
    start_scheduler()

# Health check
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Call Me Reminder API"}

# Login endpoint
@app.post("/auth/login", response_model=schemas.Token)
def login(login_data: schemas.LoginRequest):
    if not auth.authenticate_dev_password(login_data.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": "dev"}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Protected endpoints
@app.post("/reminders", response_model=schemas.ReminderResponse)
def create_reminder(
    reminder: schemas.ReminderCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(auth.get_current_user)
):
    return crud.create_reminder(db, reminder)

# List reminders
@app.get("/reminders", response_model=List[schemas.ReminderResponse])
def list_reminders(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: str = Depends(auth.get_current_user)
):
    return crud.get_reminders(db, status)

# Get single reminder
@app.get("/reminders/{reminder_id}", response_model=schemas.ReminderResponse)
def get_reminder(
    reminder_id: str,
    db: Session = Depends(get_db),
    current_user: str = Depends(auth.get_current_user)
):
    reminder = crud.get_reminder(db, reminder_id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return reminder

# Update reminder
@app.put("/reminders/{reminder_id}", response_model=schemas.ReminderResponse)
def update_reminder(
    reminder_id: str,
    reminder_update: schemas.ReminderUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(auth.get_current_user)
):
    reminder = crud.update_reminder(db, reminder_id, reminder_update)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return reminder

# Delete reminder
@app.delete("/reminders/{reminder_id}")
def delete_reminder(
    reminder_id: str,
    db: Session = Depends(get_db),
    current_user: str = Depends(auth.get_current_user)
):
    success = crud.delete_reminder(db, reminder_id)
    if not success:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"message": "Reminder deleted successfully"}

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                # Remove dead connections
                self.disconnect(connection)

manager = ConnectionManager()

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and listen for ping
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Helper function to broadcast updates
async def broadcast_reminder_update(reminder_id: str, status: str):
    message = {
        "type": "reminder_update",
        "data": {
            "id": reminder_id,
            "status": status
        }
    }
    await manager.broadcast(message)