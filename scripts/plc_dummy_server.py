import socket
import time
import tkinter as tk
import threading
from tkinter import font
from plc_master_manager import PlcMasterManager
from socket_server_manager import SocketServerManager

class DummyMasterPlc:
    def __init__(self, server_ip, port):
        self._sockmngr = SocketServerManager(server_ip, port)
        self._input_thread = None
        self._running = threading.Event()

        self._root = tk.Tk()
        self._root.title("DummyMasterPLC")
        self._root.protocol("WM_DELETE_WINDOW", self.stop)
        self._root.geometry("500x500")

        self._small_font = tk.font.Font(family = 'Consolas', size = 12)
        self._title_font = tk.font.Font(family = 'Consolas', size = 18, weight = 'bold')

        mainframe = tk.Frame(self._root, borderwidth=3, relief='ridge')
        mainframe.pack(fill=tk.BOTH, expand=True)

        titleframe = tk.Frame(mainframe, height=100, borderwidth=3, relief='raised')
        contentframe = tk.Frame(mainframe, borderwidth=3, relief='sunken')
        titleframe.pack(fill=tk.X)
        contentframe.pack(fill=tk.BOTH, expand=True)

        titlelabel = tk.Label(titleframe, text="DummyMasterPLC", font=self._title_font)
        titlelabel.pack(fill=tk.BOTH)

        self._stations_checkboxes = {}
        for idx, station in enumerate(PlcMasterManager.STATIONS_NAMES):
            stationframe = tk.Frame(contentframe, borderwidth = 3, relief = 'ridge')
            stationlabel = tk.Label(stationframe, text = "Stacja " + station, font = self._title_font)

            stationframe.grid(row = idx % 4, column = int(idx / 4), padx = 10, pady = 10, sticky = 'nsew')
            contentframe.rowconfigure(index = idx % 4, weight = 1)
            contentframe.columnconfigure(index = int(idx / 4), weight = 1)
            stationlabel.pack(side = tk.TOP, fill = tk.X, pady = 10)

            v = tk.StringVar(value = "Empty")
            for idx, status in enumerate(PlcMasterManager.STATIONS_STATUSES_NAMES):
                checkbox = tk.Radiobutton(stationframe, text = status, variable = v, value = status, font = self._small_font, anchor = 'w')
                checkbox.pack(side = tk.TOP, fill = tk.X, padx = 50)
            self._stations_checkboxes[station] = v

    def _createStatusResponse(self):
        response = PlcMasterManager.CMD_CODE_GET_STATUS
        for station in PlcMasterManager.STATIONS_NAMES:
            val = 0
            setting = self._stations_checkboxes[station].get()
            if setting == "Empty":   val |= (1 << 0)
            if setting == "Ongoing": val |= (1 << 1)
            if setting == "Error":   val |= (1 << 2)
            response += val.to_bytes(1, byteorder='big')
        return response

    def _parseInput(self, data):
        response = b''
        if data[0] == PlcMasterManager.CMD_CODE_GET_STATUS[0]:
            return self._createStatusResponse()

    def _inputReaderLoop(self):
        while self._running.is_set():
            data = self._sockmngr.recv()
            if data:
                response = self._parseInput(data)
                if response:
                    self._sockmngr.send(response)
            time.sleep(0.05)

    def start(self):
        self._sockmngr.start()
        self._running.set()
        self._input_thread = threading.Thread(target=self._inputReaderLoop)
        self._input_thread.start()
        self._root.mainloop()

    def stop(self):
        self._running.clear()
        if self._input_thread is not None and self._input_thread.isAlive():
            self._input_thread.join()
        self._sockmngr.stop()
        self._root.destroy()


if __name__ == "__main__":
    server = "localhost"
    port = 4000

    dummyplc = DummyMasterPlc(server, port)
    dummyplc.start()
