import socket
import time
import select
from socket_manager import SocketManager

class SocketServerManager(SocketManager):

    def __init__(self, server_ip, port, *args, **kwargs):
        super(SocketServerManager, self).__init__(server_ip, port, *args, **kwargs)

    def _connect(self):
        server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server_sock.bind((self._server_ip, self._port))
        server_sock.listen(5)
        self._print("Listening on {}:{}".format(self._server_ip, self._port))
        client_sock = None
        while self._running.is_set():
            self._print("Waiting for connection")
            readable, _, _ = select.select([server_sock], [], [], self.CONNECTION_TIMEOUT)
            if readable:
                client_sock, addr = server_sock.accept()
                self._print("Connected to {}".format(addr))
                break
        return client_sock
