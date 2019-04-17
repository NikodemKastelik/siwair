cd /D "%~dp0"

call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo Could not activate venv.
    pause >nul
    exit /b
)
call :runFlask
call venv\Scripts\deactivate.bat

:runFlask
set FLASK_APP=siwair.py
set FLASK_ENV=development
set PYTHONUNBUFFERED=1
cd .. && flask run --host=0.0.0.0
cd scripts
exit /b
