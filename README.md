# siwair
Supervisory application for Industry 4.0 Laboratory

## How to start

1. Make sure that Python 3 is accessible from the shell via the ```python3``` symbol. If not, folder containing ```python3``` has to be added to the ```PATH```.

    * Windows

        The ```python3``` installator should automatically add directory containing the executable to PATH, however it is named ```python.exe``` and not ```python3.exe```.
        Simply copy ```python.exe``` and rename it to ```python3.exe```, or create symlink using command ```mklink python3.exe python.exe``` (administrator priviledges are needed for the latter)

    * Linux

        Call ```sudo apt-get install python3.6```. This will automatically create the needed ```python3``` symbol.

1. Get the most recent version of the ```SiWAiR``` application either by:

    * cloning the repository:

        ```git clone https://github.com/NikodemKastelik/siwair.git```

        and then downloading the ```startbootstrap-freelancer``` template by calling:

        ```git submodule update --recursive```

    * downloading the ZIP and unpacking it. Then, the ```startbootstrap-freelancer``` template has to be downloaded manually and its contents inserted into ```/static/startbootstrap-freelancer/```

1. Run ```scripts/env_install.sh``` (for Linux) or ```scripts/env_install.bat``` (for Windows) to setup development environment. This has to be done once, after obtaining fresh copy of the repository.

1. Run ```scripts/server_start.sh``` or ```scripts/server_start.bat``` to start the webserver.

1. Page is now accessible via ```localhost:5000``` address in the browser.

## How to use PLC Master simulator

1. First of all, make sure that ```tkinter``` module is installed by typing:

    ```python3 -m tkinter```

    If small example window appears that means the ```tkinter``` is installed. Otherwise, do the following:

    * Linux

        Call ```sudo apt-get install python3-tk```

    * Windows

        The ```tkinter``` should be installed together with ```python3```, unless it was explicitly ticked off during installation. If this is the case, the best way would be to reinstall ```python3``` making sure that it is ticked on. Do not forget to run steps from ```How to start``` section once again.

1. Make sure that server is disabled.

1. Run ```python3 scripts/plc_dummy_server.py```.

1. Run ```scripts/server_start.sh``` or ```scripts/server_start.bat``` to start the webserver.

1. Simulator will respond with station statuses and current order progress. Click buttons on the bottom of the window to simulate production steps. This can be used to check correct interactions between PLC master and webserver.
