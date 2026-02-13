import httpx
import os
from dotenv import load_dotenv

load_dotenv()

VAPI_API_KEY = os.getenv("VAPI_API_KEY")
VAPI_BASE_URL = "https://api.vapi.ai"

async def trigger_call(phone_number: str, message: str) -> bool:
    """
    Trigger a call via Vapi to speak the reminder message
    Returns True if successful, False otherwise
    """
    try:
        headers = {
            "Authorization": f"Bearer {VAPI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "phoneNumberId": None,  # Uses Vapi's default number
            "customer": {
                "number": phone_number
            },
            "assistant": {
                "firstMessage": message,
                "model": {
                    "provider": "openai",
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a reminder assistant. Speak the reminder message clearly and then end the call."
                        }
                    ]
                },
                "voice": {
                    "provider": "11labs",
                    "voiceId": "paula"
                }
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{VAPI_BASE_URL}/call/phone",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            
            return response.status_code in [200, 201]
            
    except Exception as e:
        print(f"Error triggering call: {e}")
        return False