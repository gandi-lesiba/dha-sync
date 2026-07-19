# This is the main entry point for the flask appllication.
# It creates the app instance and runs the development server.

import os
from dotenv import load_dotenv

# Load ennvironment variables from .env file
load_dotenv()

from app import create_app

# Create the Flask application instance
app = create_app()

if __name__ == "__main__":
    # Get port from environment or default to 5000
    port = int(os.environ.get("PORT", 5000))
    # Run the development server
    # debug=True shows detailed error pages
    app.run(host="0.0.0.0", port=port, debug=True)