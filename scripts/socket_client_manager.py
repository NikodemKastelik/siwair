import socket
import time
from socket_manager import SocketManager

class SocketClientManager(SocketManager):

    def __init__(self, server_ip, port):
        super(SocketClientManager, self).__init__(server_ip, port)

    def _print(self, string):
        print("SocketClientManager: {}".format(string))

    def _connect(self):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1.0)
        while self._running.is_set():
            self._print("Trying to connect")
            try:
                sock.connect((self._server_ip, self._port))
                self._print("Connected")
                break
            except:
                self._print("Connection refused")
            time.sleep(self.CONNECTION_TIMEOUT)
        sock.settimeout(None)
        return sock
