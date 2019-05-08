from socket_client_manager import SocketClientManager
from order_list import OrderList
from order_list import Order
import time
import threading

class PlcMasterManager:

    STATUS_PINGER_TIMEOUT = 1.0

    CMD_CODE_GET_STATUS = (0xAA).to_bytes(1, byteorder = 'big')
    CMD_CODE_SET_ORDER  = (0xDD).to_bytes(1, byteorder = 'big')

    CMD_RX_FRAME_LEN = 20 # 6 + 6 + 6 + 1 + 1
    CMD_TX_FRAME_LEN = 14 # 1 + 1 + 6x2

    STATIONS_NAMES = ["ST10", "ST20", "ST30", "ST40", "ST50", "ST60", "ST70", "ST80"]

    EMPTY_CURRENT_ORDER = {}

    def __init__(self, plc_ip, port_send, port_recv):
        self._sock_mngr_tx = SocketClientManager(plc_ip, port_send, name = "SocketTX")
        self._sock_mngr_rx = SocketClientManager(plc_ip, port_recv, recv_per_access=self.CMD_RX_FRAME_LEN, name = "SocketRX")
        self._response_thread = None
        self._pinger_thread = None
        self._running = threading.Event()
        self._order_list = OrderList()
        self._current_order = self.EMPTY_CURRENT_ORDER
        self._order_progress = 0

        self._stations_statuses = {}
        for station_name in self.STATIONS_NAMES:
            self._stations_statuses[station_name] = "Offline"

    def _print(self, string):
        print("PlcMasterManager: {}".format(string))

    def _getSleeveConfig(self, product):
        part = product['recipe'].split("_")[1]
        if part[2] == "S":
            return 1
        else:
            return 0

    def _getScrewConfig(self, product):
        part = product['recipe'].split("_")[1]
        return int(part[3:])

    def _createOrderCommand(self, order):
        """
        Order command is a following serialized structure:
        command         [1 Byte] - command code, can be CMD_CODE_GET_STATUS or CMD_CODE_SET_ORDER
        ileZamowionych  [1 Byte] - amount of products in this order
        product1 sleeve [1 Byte] - is sleeve present for product number 1
        product1 screw  [1 Byte] - screw configuration for product number 1
        .
        .
        product6 sleeve [1 Byte] - is sleeve present for product number 6
        product6 screw  [1 Byte] - screw configuration for product number 6
        """
        cmd = self.CMD_CODE_SET_ORDER

        amount = 0
        for product in order:
            amount += int(product['quantity'])
        cmd += amount.to_bytes(1, 'big')

        idx = 0
        for product in order:
            for _ in range(int(product['quantity'])):
                cmd += (self._getSleeveConfig(product)).to_bytes(1, 'big')
                cmd += (self._getScrewConfig(product)).to_bytes(1, 'big')
                idx +=1
        while idx < Order.MAX_PRODUCTS_PER_ORDER:
            cmd += (0).to_bytes(2, 'big')
            idx += 1

        return cmd

    def _setStationStatuses(self, status):
        for station_name in self.STATIONS_NAMES:
            self._stations_statuses[station_name] = status

    def _updateStationsStatuses(self, status_bytes):
        self._setStationStatuses("Empty")

        for byte in status_bytes:
            station_idx = int(byte / 10) - 1
            if station_idx >= 0:
                station_name = self.STATIONS_NAMES[station_idx]
                self._stations_statuses[station_name] = "Ongoing"

    def _getProductCountInCurrentOrder(self):
        count = 0
        for product in self._current_order['contents']:
            count += int(product['quantity'])

    def _parseResponse(self, data):
        if len(data) == self.CMD_RX_FRAME_LEN:
            """
            Status is a following serialized structure:
            produktStatus    [6 Byte] - each product position presented as station number
            stanowiskoStatus [6 Byte] - each station status
            magazyn          [6 Byte] - if there is an semi-finished product on specified position
            tasma            [1 Byte] - is belt running
            progress         [1 Byte] - current order progress in percent
            """
            self._updateStationsStatuses(data[:6])
            self._order_progress = int(data[-1])
            print("Progress: {} %".format(self._order_progress))
        else:
            self._print("Cannot parse response: {}".format(data))

    def _isPlcBusy(self):
        if self._current_order == self.EMPTY_CURRENT_ORDER or self._order_progress == 100:
            return False
        else:
            return True

    def _sendNextOrder(self):
        if not self._order_list.isEmpty():
            order = self._order_list.pop()
            self._current_order = order
            self._order_progress = 0
            cmd = self._createOrderCommand(order['contents'])
            self._sock_mngr_tx.send(cmd)

    def _responseReaderLoop(self):
        while self._running.is_set():
            data = self._sock_mngr_rx.recv()
            if data:
                self._parseResponse(data)
                if not self._isPlcBusy():
                    self._sendNextOrder()
            time.sleep(0.05)

    def _statusPingerLoop(self):
        while self._running.is_set():
            if self.isPlcConnected():
                self._sock_mngr_tx.send(self.CMD_CODE_GET_STATUS + (0).to_bytes(self.CMD_TX_FRAME_LEN - 1, 'big'))
            else:
                self._setStationStatuses("Offline")
            time.sleep(self.STATUS_PINGER_TIMEOUT)

    def addOrder(self, order):
            self._order_list.append(order)

    def getStatuses(self):
        return self._stations_statuses

    def getOrderBracket(self):
        return self._order_list.get()

    def getCurrentOrder(self):
        if self._current_order == self.EMPTY_CURRENT_ORDER:
            return self.EMPTY_CURRENT_ORDER
        else:
            self._current_order['progress'] = str(self._order_progress)
            return self._current_order

    def isPlcConnected(self):
        return self._sock_mngr_rx.isConnected() and self._sock_mngr_tx.isConnected()

    def start(self):
        self._print("Started")
        self._sock_mngr_tx.start()
        self._sock_mngr_rx.start()
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
        self._sock_mngr_tx.stop()
        self._sock_mngr_rx.stop()
        self._print("Stopped")
