from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from .database import SessionLocal
from . import crud, models
from .vapi_client import trigger_call
import asyncio

# Import the broadcast function (circular import handled carefully)
def get_broadcast_func():
    from .main import broadcast_reminder_update
    return broadcast_reminder_update

def check_and_trigger_reminders():
    """
    Check for due reminders and trigger calls
    Runs every 30 seconds
    """
    db: Session = SessionLocal()
    try:
        due_reminders = crud.get_due_reminders(db)
        broadcast_func = get_broadcast_func()
        
        for reminder in due_reminders:
            # Mark as processing (using completed temporarily)
            print(f"Processing reminder: {reminder.id} - {reminder.title}")
            
            # Trigger call (async)
            success = asyncio.run(trigger_call(reminder.phone_number, reminder.message))
            
            # Update status and broadcast
            if success:
                crud.update_reminder_status(db, reminder.id, models.ReminderStatus.completed)
                print(f"✓ Call triggered successfully for: {reminder.title}")
                # Broadcast update to all connected clients
                try:
                    asyncio.run(broadcast_func(reminder.id, "completed"))
                except Exception as e:
                    print(f"Failed to broadcast update: {e}")
            else:
                crud.update_reminder_status(db, reminder.id, models.ReminderStatus.failed)
                print(f"✗ Call failed for: {reminder.title}")
                # Broadcast update to all connected clients
                try:
                    asyncio.run(broadcast_func(reminder.id, "failed"))
                except Exception as e:
                    print(f"Failed to broadcast update: {e}")
                
    except Exception as e:
        print(f"Error in scheduler: {e}")
    finally:
        db.close()

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_and_trigger_reminders, 'interval', seconds=30)
    scheduler.start()
    print("📅 Scheduler started - checking for reminders every 30 seconds")
    return scheduler