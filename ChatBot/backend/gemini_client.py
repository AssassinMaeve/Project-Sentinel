import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=GEMINI_API_KEY)

def get_gemini_chat_completion(chat_history: list) -> str:
    """
    Generate AI response using Gemini with conversation history
    """
    model = genai.GenerativeModel("gemini-2.0-flash-exp")
    
    # FIX: Use start_chat with history for context-aware responses
    # Format history properly for Gemini API
    formatted_history = []
    system_prompt = None
    
    for item in chat_history:
        if item['role'] == 'model' and system_prompt is None:
            # First model message is system prompt - skip it for history
            system_prompt = item['parts'][0]['text']
            continue
        formatted_history.append(item)
    
    # Start chat with history
    chat = model.start_chat(history=formatted_history)
    
    # Generate response with proper configuration
    response = chat.send_message(
        "Continue the conversation naturally based on the context.",
        generation_config={
            "temperature": 0.7,  # FIX: Increased from 0 for more natural responses
            "max_output_tokens": 2048,
            "top_p": 0.95,
            "top_k": 40
        }
    )
    
    return response.text
