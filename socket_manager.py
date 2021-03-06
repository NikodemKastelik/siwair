import socket
import time
import threading
import queue
import select

class SocketManager:

    CONNECTION_TIMEOUT = 1.0

    def __init__(self, server_ip, port, recv_per_access=1024, name="SocketManager"):
        self._server_ip = server_ip
        self._port = port
        self._connected = False
        self._sock_thread = None
        self._running = threading.Event()
        self._read_queue = queue.Queue()
        self._write_queue = queue.Queue()
        self._recv_per_access = recv_per_access
        self._name = name

    def _print(self, string):
        print("{}: {}".format(self._name, string))

    def _connect(self):
        raise NotImplementedError

    def _socketLoop(self):
        while self._running.is_set():
            sock = self._connect()
            self._connected = True
            while self._running.is_set():
                readable, writable, _ = select.select([sock], [sock], [], 0.1)
                if readable:
                    try:
                        readout = sock.recv(self._recv_per_access)
                    except:
                        self._print("Connection lost")
                        break
                    if readout:
                        self._print("Got data: {}".format(readout))
                        self._read_queue.put(readout)
                    else:
                        self._print("Connection lost")
                        break
                if writable and not self._write_queue.empty():
                    data_to_write = self._write_queue.get()
                    try:
                        sock.send(data_to_write)
                    except:
                        self._print("Connection lost")
                        break
                    self._print("Sending data: {}".format(data_to_write))
            self._connected = False
            if sock is not None:
                sock.close()

    def isConnected(self):
        return self._connected

    def start(self):
        self._print("Started")
        self._running.set()
        self._sock_thread = threading.Thread(target=self._socketLoop)
        self._sock_thread.start()

    def stop(self):
        if self._sock_thread is not None and self._sock_thread.isAlive():
            self._running.clear()
            self._sock_thread.join()
        self._print("Stopped")

    def recv(self):
        try:
            retval = self._read_queue.get(block=False)
        except:
            retval = b''
        return retval

    def send(self, data):
        self._write_queue.put(data)
