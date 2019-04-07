from socket_client_manager import SocketClientManager
import time
import threading

class PlcMasterManager:

    STATUS_PINGER_TIMEOUT = 1.0

    CMD_CODE_GET_STATUS  = (137).to_bytes(1, byteorder = 'big')
    CMD_STATUS_FRAME_LEN = 9 # STATUS code + byte per station

    CMD_CODE_SET_ORDER  = (189).to_bytes(1, byteorder = 'big')

    STATIONS_NAMES = ["ST10", "ST20", "ST30", "ST40", "ST50", "ST60", "ST70", "ST80"]
    STATIONS_STATUSES_NAMES = ["Empty", "Ongoing", "Error"]

    def __init__(self, plc_ip, port):
        self._sock_mngr = SocketClientManager(plc_ip, port)
        self._response_thread = None
        self._pinger_thread = None
        self._running = threading.Event()

        self._stations_statuses = {}
        for station_name in self.STATIONS_NAMES:
            self._stations_statuses[station_name] = {}
            for status_name in self.STATIONS_STATUSES_NAMES:
                self._stations_statuses[station_name][station_name] = False

    def _print(self, string):
        print("PlcMasterManager: {}".format(string))

    def _createOrderCommand(self, parts):
        parts_byte = 0
        if parts["body"]:        parts_byte |= (1 << 0)
        if parts["lid"]:         parts_byte |= (1 << 1)
        if parts["sleeve"]:      parts_byte |= (1 << 2)
        if parts["screw_north"]: parts_byte |= (1 << 3)
        if parts["screw_east"]:  parts_byte |= (1 << 4)
        if parts["screw_south"]: parts_byte |= (1 << 5)
        if parts["screw_west"]:  parts_byte |= (1 << 6)
        return self.CMD_CODE_SET_ORDER + parts_byte.to_bytes(1, 'big')

    def _modifyStationsStatuses(self, status_bytes):
        for station, byte in zip(self.STATIONS_NAMES, status_bytes):
            for idx, status in enumerate(self.STATIONS_STATUSES_NAMES):
                val = bool(byte & (1 << idx))
                self._stations_statuses[station][status] = val

    def _parseResponse(self, data):
        if len(data) == self.CMD_STATUS_FRAME_LEN and data[0] == self.CMD_CODE_GET_STATUS[0]:
            self._modifyStationsStatuses(data[1:])
        else:
            self._print("Cannot parse response: {}".format(data))

    def _responseReaderLoop(self):
        while self._running.is_set():
            data = self._sock_mngr.recv()
            if data:
                self._parseResponse(data)
            time.sleep(0.05)

    def _statusPingerLoop(self):
        while self._running.is_set():
            if self.isPlcConnected:
                self._sock_mngr.send(self.CMD_CODE_GET_STATUS)
            time.sleep(self.STATUS_PINGER_TIMEOUT)

    def getStatuses(self):
        return self._stations_statuses

    def isPlcConnected(self):
        return self._sock_mngr.isConnected()

    def startOrder(self, parts):
        assert(parts["body"])
        cmd = self._createOrderCommand(parts)
        self._sock_mngr.send(cmd)

    def start(self):
        self._print("Started")
        self._sock_mngr.start()
        self._running.set()
        self._response_thread = threading.Thread(target=self._responseReaderLoop)
        self._response_thread.start()
        self._pinger_thread = threading.Thread(target=self._statusPingerLoop)
        self._pinger_thread.start()

    def stop(self):
        self._running.clear()
        if self._response_thread is not None and self._response_thread.isAlive():
            self._response_thread.join()
        if self._pinger_thread is not None and self._pinger_thread.isAlive():
            self._pinger_thread.join()
        self._sock_mngr.stop()
        self._print("Stopped")
