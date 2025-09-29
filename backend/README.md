# Backend Server

This directory contains the Python-based backend server for the Account Manager application. It handles all real interactions with Telegram/WhatsApp APIs, manages the database, and runs the Humanization Engine.

## Local Development Setup

Follow these steps to run the backend server on your local machine. You need to have Python 3 installed.

1.  **Navigate to the Backend Directory:**
    Open your terminal and change the directory to here:
    ```bash
    cd backend
    ```

2.  **Create a Virtual Environment (Recommended):**
    It's a best practice to use a virtual environment to isolate project dependencies.
    ```bash
    # On Windows
    python -m venv venv

    # On macOS/Linux
    python3 -m venv venv
    ```

3.  **Activate the Virtual Environment:**
    You need to activate the environment in each new terminal session.
    ```bash
    # On Windows (Command Prompt)
    .\venv\Scripts\activate

    # On macOS/Linux
    source venv/bin/activate
    ```
    Your terminal prompt should now be prefixed with `(venv)`.

4.  **Install/Update Dependencies:**
    Install all the required Python libraries from the `requirements.txt` file. **Run this command every time `requirements.txt` is updated!**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Run the Server:**
    You can now start the Flask development server.
    ```bash
    flask run
    ```
    The server will automatically reload if you make changes to the code.

6.  **Verify It's Running:**
    The server will start on `http://127.0.0.1:5000`. The frontend application is configured to communicate with this address. You can test it by opening a browser or using a tool like Postman to access the test endpoint: [http://127.0.0.1:5000/api/ping](http://127.0.0.1:5000/api/ping). You should see a JSON response confirming it's working.
