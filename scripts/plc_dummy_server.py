import socket
from plc_master_manager import PlcMasterManager
from collections import OrderedDict

statuses = OrderedDict()
statuses["ST10"] = {"Empty":   False,
                    "Ongoing": False,
                    "Error":   False}

statuses["ST20"] = {"Empty":   False,
                    "Ongoing": False,
                    "Error":   False}

statuses["ST30"] = {"Empty":   False,
                    "Ongoing": False,
                    "Error":   False}

statuses["ST40"] = {"Empty":   False,
                    "Ongoing": False,
                    "Error":   False}

statuses["ST50"] = {"Empty":   False,
                    "Ongoing": False,
                    "Error":   False}

statuses["ST60"] = {"Empty":   False,
                    "Ongoing": False,
                    "Error":   False}

statuses["ST70"] = {"Empty":   False,
                    "Ongoing": False,
                    "Error":   False}

statuses["ST80"] = {"Empty":   False,
                    "Ongoing": False,
                    "Error":   True}

def parseInput(data):
    response = b''
    if data[0] == PlcMasterManager.CMD_CODE_GET_STATUS[0]:
        response = PlcMasterManager.CMD_CODE_GET_STATUS
        for key in statuses:
            val = 0
            if statuses[key]["Empty"]:   val |= (1 << 0)
            if statuses[key]["Ongoing"]: val |= (1 << 1)
            if statuses[key]["Error"]:   val |= (1 << 2)
            response += val.to_bytes(1, byteorder='big')
    return response

if __name__ == "__main__":
    server = "localhost"
    port = 4000

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind((server, port))
    sock.listen()

    try:
        while True:
            print("Wait for connection")
            conn, client_address = sock.accept()
            print("Got connection from {}".format(client_address))
            while True:
                data = conn.recv(1024)
                if data: 
                    print("Got: {}".format(data))
                    response = parseInput(data)
                    if response:
                        conn.sendall(response)
    except KeyboardInterrupt:
        sock.close()

