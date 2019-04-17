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

1. Run ```scripts/env_install.sh``` (for Linux) or ```scripts/env_install.bat``` (for Windows) to setup development environment. This has to be done once, after creating obtaining fresh copy of the repository.

1. Run ```scripts/server_start.sh``` or ```scripts/server_start.bat``` to start the server.

1. Page is now accessible via ```localhost:5000``` address in the browser.
