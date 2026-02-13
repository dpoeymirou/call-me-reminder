from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime

def create_reminder(db: Session, reminder: schemas.ReminderCreate):
    db_reminder = models.Reminder(**reminder.model_dump())
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    return db_reminder

def get_reminders(db: Session, status: str = None):
    query = db.query(models.Reminder)
    if status:
        query = query.filter(models.Reminder.status == status)
    return query.order_by(models.Reminder.scheduled_time).all()

def get_reminder(db: Session, reminder_id: str):
    return db.query(models.Reminder).filter(models.Reminder.id == reminder_id).first()

def update_reminder(db: Session, reminder_id: str, reminder_update: schemas.ReminderUpdate):
    db_reminder = get_reminder(db, reminder_id)
    if not db_reminder:
        return None
    
    update_data = reminder_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_reminder, key, value)
    
    db_reminder.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_reminder)
    return db_reminder

def delete_reminder(db: Session, reminder_id: str):
    db_reminder = get_reminder(db, reminder_id)
    if db_reminder:
        db.delete(db_reminder)
        db.commit()
        return True
    return False

def get_due_reminders(db: Session):
    now = datetime.utcnow()
    return db.query(models.Reminder).filter(
        models.Reminder.scheduled_time <= now,
        models.Reminder.status == models.ReminderStatus.scheduled
    ).all()

def update_reminder_status(db: Session, reminder_id: str, status: models.ReminderStatus):
    db_reminder = get_reminder(db, reminder_id)
    if db_reminder:
        db_reminder.status = status
        db_reminder.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_reminder)
        return db_reminder
    return None