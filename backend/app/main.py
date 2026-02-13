from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, schemas, crud
from .database import engine, get_db
from .scheduler import start_scheduler

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Call Me Reminder API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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

# Create reminder
@app.post("/reminders", response_model=schemas.ReminderResponse)
def create_reminder(
    reminder: schemas.ReminderCreate,
    db: Session = Depends(get_db)
):
    return crud.create_reminder(db, reminder)

# List reminders
@app.get("/reminders", response_model=List[schemas.ReminderResponse])
def list_reminders(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return crud.get_reminders(db, status)

# Get single reminder
@app.get("/reminders/{reminder_id}", response_model=schemas.ReminderResponse)
def get_reminder(
    reminder_id: str,
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
):
    reminder = crud.update_reminder(db, reminder_id, reminder_update)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return reminder

# Delete reminder
@app.delete("/reminders/{reminder_id}")
def delete_reminder(
    reminder_id: str,
    db: Session = Depends(get_db)
):
    success = crud.delete_reminder(db, reminder_id)
    if not success:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"message": "Reminder deleted successfully"}