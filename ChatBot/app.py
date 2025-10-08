from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import warnings
import traceback
import logging
from dotenv import load_dotenv

# Load environment variables before importing backend modules
load_dotenv()

print(f"DEBUG: GEMINI_API_KEY loaded: {bool(os.getenv('GEMINI_API_KEY'))}")
print(f"DEBUG: MURF_API_KEY loaded: {bool(os.getenv('MURF_API_KEY'))}")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

warnings.filterwarnings('ignore')

app = Flask(__name__, template_folder="templates", static_folder="assets")
CORS(app)

# --- Serve index.html at the root URL ---
@app.route("/", methods=["GET"])
def serve_index():
    return render_template("index.html")

# --- Serve static assets if you have ./assets/main.css, etc. ---
@app.route('/assets/<path:filename>')
def custom_static(filename):
    return send_from_directory('assets', filename)
# ----------------------------------------------------

# Global variables for clients
orch = None
sst_client = None
murf_client = None

def initialize_clients():
    global orch, sst_client, murf_client
    try:
        logger.info("Initializing Orchestrator...")
        from backend.orchastrator import Orchestrator
        orch = Orchestrator()
        logger.info("✓ Orchestrator initialized successfully")
    except Exception as e:
        logger.error(f"✗ Orchestrator initialization failed: {e}")
        orch = None

    try:
        logger.info("Initializing SpeechToText...")
        from backend.speech_to_text import SpeechToText
        sst_client = SpeechToText()
        logger.info("✓ SpeechToText initialized successfully")
    except Exception as e:
        logger.error(f"✗ SpeechToText initialization failed: {e}")
        sst_client = None

    try:
        logger.info("Initializing MurfTTSClient...")
        from backend.text_to_speech import MurfTTSClient
        murf_client = MurfTTSClient()
        logger.info("✓ MurfTTSClient initialized successfully")
    except Exception as e:
        logger.error(f"✗ MurfTTSClient initialization failed: {e}")
        murf_client = None

def generate_ai_response(message, conversation_history=None) -> str:
    if orch is None:
        raise RuntimeError("Orchestrator not initialized. Check backend configuration.")
    try:
        if conversation_history and len(conversation_history) > 0:
            messages_list = [msg['content'] for msg in conversation_history if msg['role'] == 'user']
            if isinstance(message, str) and (not messages_list or messages_list[-1] != message):
                messages_list.append(message)
            result = orch.start_session(messages_list)
        elif isinstance(message, str):
            result = orch.start_session([message])
        elif isinstance(message, list):
            result = orch.start_session(message)
        else:
            raise ValueError("generate_ai_response: message must be str or list[str]")
        if not result or 'solution' not in result:
            raise RuntimeError("Invalid response from Orchestrator")
        return result['solution']
    except Exception as e:
        logger.error(f"AI response generation error: {e}")
        raise

def transcribe_audio(filepath: str) -> str:
    if sst_client is None:
        raise RuntimeError("SpeechToText client not initialized. Check backend configuration.")
    if not os.path.isfile(filepath):
        raise FileNotFoundError(f"Audio file not found: {filepath}")
    try:
        return sst_client.transcribe(audio_path=filepath)
    except Exception as e:
        logger.error(f"Audio transcription error: {e}")
        raise

def generate_audio_response(ai_message: str) -> str:
    if murf_client is None:
        raise RuntimeError("MurfTTSClient not initialized. Check backend configuration.")
    try:
        os.makedirs("audios", exist_ok=True)
        resp = murf_client.generate_speech(
            text=ai_message,
            voice_id="en-US-natalie",
            style="empathetic",
            encode_as_base64=True,
            format="MP3",
            sample_rate=44100,
            channel_type="MONO",
            rate=-6.0,
            pitch=-5.0,
            variation=4
        )
        if resp["success"] and resp.get("encoded_audio"):
            return murf_client.save_audio(resp["encoded_audio"], folder="audios", filename="ai_response.mp3")
        else:
            raise RuntimeError("Speech generation failed or no audio returned.")
    except Exception as e:
        logger.error(f"Audio generation error: {e}")
        raise

# Keep your backend API and error handlers as before:

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "timestamp": "2025-09-20 09:53:16",
        "services": {
            "orchestrator": "available" if orch is not None else "unavailable",
            "speech_to_text": "available" if sst_client is not None else "unavailable", 
            "text_to_speech": "available" if murf_client is not None else "unavailable"
        }
    }), 200

@app.route("/test", methods=["POST"])
def test_endpoint():
    try:
        logger.info("Test endpoint called")
        data = request.json
        logger.info(f"Received data: {data}")
        return jsonify({
            "received": data,
            "message": "Test endpoint working perfectly",
            "type": "test",
            "status": "success"
        }), 200
    except Exception as e:
        logger.error(f"Test endpoint error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/chat", methods=["POST"])
def chat_endpoint():
    logger.info("=== CHAT ENDPOINT CALLED ===")
    try:
        data = request.json
        logger.info(f"Request data: {data}")
        if not data:
            logger.error("Missing JSON body")
            return jsonify({"error": "Missing JSON body"}), 400

        user_message = data.get("user_message")
        dtype = data.get("dtype")
        conversation_history = data.get("messages", [])

        logger.info(f"User message: {user_message}")
        logger.info(f"Data type: {dtype}")
        logger.info(f"Conversation history length: {len(conversation_history)}")

        if dtype not in ("audio", "message"):
            logger.error(f"Invalid dtype: {dtype}")
            return jsonify({"error": "Invalid dtype, must be 'audio' or 'message'"}), 400
        if not user_message or not isinstance(user_message, str) or not user_message.strip():
            logger.error("Missing or empty user_message")
            return jsonify({"error": "Missing or empty user_message"}), 400

        if dtype == "audio":
            logger.info("Processing audio message...")
            try:
                logger.info(f"Transcribing audio file: {user_message}")
                transcribed_text = transcribe_audio(user_message)
                logger.info(f"Transcribed text: {transcribed_text}")
            except FileNotFoundError as e:
                logger.error(f"Audio file not found: {e}")
                return jsonify({"error": str(e)}), 400
            except Exception as e:
                logger.error(f"Audio transcription failed: {e}")
                return jsonify({"error": "Audio transcription failed: " + str(e)}), 500

            try:
                logger.info("Generating AI response for transcribed text...")
                ai_response = generate_ai_response(transcribed_text, conversation_history)
                logger.info(f"AI response: {ai_response}")
            except Exception as e:
                logger.error(f"AI response generation failed: {e}")
                return jsonify({"error": "AI response generation failed: " + str(e)}), 500

            try:
                logger.info("Generating audio response...")
                audio_filepath = generate_audio_response(ai_response)
                logger.info(f"Audio file saved: {audio_filepath}")
            except Exception as e:
                logger.error(f"Audio generation failed: {e}")
                return jsonify({"error": "Audio generation failed: " + str(e)}), 500

            response = {
                "content": ai_response,
                "audio_filepath": audio_filepath,
                "transcribed_text": transcribed_text,
                "type": "audio"
            }
            logger.info(f"Returning audio response: {response}")
            return jsonify(response)

        elif dtype == "message":
            logger.info("Processing text message...")
            try:
                logger.info("Generating AI response for text message...")
                ai_response = generate_ai_response(user_message, conversation_history)
                logger.info(f"AI response generated: {ai_response}")
                response = {
                    "content": ai_response,
                    "type": "message"
                }
                logger.info(f"Returning text response: {response}")
                return jsonify(response)
            except Exception as e:
                logger.error(f"AI response generation failed: {e}")
                logger.error(f"Full traceback: {traceback.format_exc()}")
                return jsonify({
                    "error": "AI response generation failed",
                    "details": str(e)
                }), 500

    except Exception as e:
        logger.error(f"Server error: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": "Server error: " + str(e)}), 500

@app.route('/upload-audio', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    audio_file = request.files['audio']
    filename = 'user_audio.mp3'
    save_path = os.path.join('audios', filename)
    os.makedirs('audios', exist_ok=True)
    audio_file.save(save_path)
    return jsonify({'audio_filepath': save_path})

@app.route('/audios/<filename>', methods=['GET'])
def serve_audio(filename):
    return send_from_directory('audios', filename)

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({"error": "Method not allowed"}), 405

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    logger.info("Starting AI Therapist Flask Server...")
    logger.info("Initializing backend clients...")
    initialize_clients()
    if orch is None:
        logger.warning("⚠️  Orchestrator not available - text responses may fail")
    if sst_client is None:
        logger.warning("⚠️  SpeechToText not available - audio transcription will fail")
    if murf_client is None:
        logger.warning("⚠️  MurfTTSClient not available - audio generation will fail")
    logger.info("Starting Flask server on http://localhost:5001")
    logger.info("Available endpoints:")
    logger.info("  GET  /        - MindSpace UI (index.html)")
    logger.info("  GET  /health  - Detailed health check")
    logger.info("  POST /test    - Test endpoint")
    logger.info("  POST /chat    - Main chat endpoint")
    logger.info("  POST /upload-audio - Audio upload endpoint")
    logger.info("  GET  /audios/<filename> - Serve audio files")
    app.run(host='0.0.0.0', port=5001, debug=True)
