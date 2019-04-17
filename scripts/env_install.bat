cd /D "%~dp0"

python3 -m pip install virtualenv --user
python3 -m virtualenv --python=python3 venv

call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo Could not activate venv.
    pause >nul
    exit /b
)

python3 -m pip install -r requirements.txt
call venv\Scripts\deactivate.bat
