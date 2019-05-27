import json
from pathlib import Path

def parseConfig(filename):
    master_plc_ip = "10.10.135.80"
    tx_port = 2099
    rx_port = 2098

    filepath = Path(filename)
    if not filepath.is_file():
        print("Specified file \"{}\" does not exist.\n"
              "Creating dummy configuration file.".format(filename))
        fd = open(filename, "w+")
        fd.write("{}")
        fd.close()

    with open(filename, encoding='utf-8') as fd:
        try:
            contents = json.load(fd)
        except ValueError:
            print("Configuration file is not a valid JSON.")
            contents = {}

        try:
            tx_port = int(contents["TX_PORT"])
        except KeyError:
            print("\"TX_PORT\" key not found in configuration file.\n"
                  "Using default value: {}".format(tx_port))

        try:
            rx_port = int(contents["RX_PORT"])
        except KeyError:
            print("\"RX_PORT\" key not found in configuration file.\n"
                  "Using default value: {}".format(rx_port))

        try:
            master_plc_ip = contents["MASTER_PLC_IP"]
        except KeyError:
            print("\"MASTER_PLC_IP\" key not found in configuration file.\n"
                  "Using default value: {}".format(master_plc_ip))

    return master_plc_ip, tx_port, rx_port
