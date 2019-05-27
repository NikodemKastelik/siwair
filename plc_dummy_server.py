import socket
import time
import tkinter as tk
import threading
from tkinter import font
from plc_master_manager import PlcMasterManager
from order_list import Order
from socket_server_manager import SocketServerManager

LAST_STATION_NUM = 60
STATION_INTERVAL = 10
STATION_COUNT = int(LAST_STATION_NUM / STATION_INTERVAL)

class DummyMasterPlc:
    def __init__(self, server_ip, port_send, port_recv):
        self._sockmngr_tx = SocketServerManager(server_ip, port_send, name = "SocketTX")
        self._sockmngr_rx = SocketServerManager(server_ip, port_recv, recv_per_access = PlcMasterManager.CMD_RX_FRAME_LEN, name = "SocketRX")
        self._input_thread = None
        self._running = threading.Event()

        self._root = tk.Tk()
        self._root.title("DummyMasterPLC")
        self._root.protocol("WM_DELETE_WINDOW", self.stop)
        self._root.geometry("600x600")

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

        row_count = 2
        self.products_states = []
        self.sleevebuttons_states = []
        self.screwboxes = []
        self.stationboxes = []
        for idx in range(0, Order.MAX_PRODUCTS_PER_ORDER):
            productframe = tk.Frame(contentframe, borderwidth = 3, relief = 'ridge')
            productlabel = tk.Label(productframe, text = "Produkt {}".format(idx + 1), font = self._title_font)
            activelabel  = tk.Label(productframe, text = "Aktywny:", font = self._small_font)
            sleevelabel  = tk.Label(productframe, text = "Tulejka:", font = self._small_font)
            screwlabel   = tk.Label(productframe, text = "Śruby:", font = self._small_font)
            stationlabel = tk.Label(productframe, text = "Stacja:", font = self._small_font)

            product_state = tk.BooleanVar(value = False)
            productbutton = tk.Checkbutton(productframe, state = "disabled", variable = product_state)
            self.products_states.append(product_state)

            sleevebutton_state = tk.BooleanVar(value = False)
            sleevebutton = tk.Checkbutton(productframe, state = "disabled", variable = sleevebutton_state)
            self.sleevebuttons_states.append(sleevebutton_state)

            screwbox_text = tk.StringVar(value = "0")
            screwbox = tk.Entry(productframe, state = "disabled", width = 2, font = self._small_font, textvariable = screwbox_text)
            self.screwboxes.append(screwbox_text)

            stationbox_text = tk.StringVar(value = "0")
            stationbox = tk.Entry(productframe, state = "disabled", width = 2, font = self._small_font, textvariable = stationbox_text)
            self.stationboxes.append(stationbox_text)

            productframe.grid(row = idx % row_count, column = int(idx / row_count), padx = 10, pady = 10, sticky = 'nsew')
            contentframe.rowconfigure(index = idx % row_count, weight = 1)
            contentframe.columnconfigure(index = int(idx / row_count), weight = 1)

            productlabel.grid(row = 0, column = 0, columnspan = 2, pady = 10, sticky = 'nsew')
            activelabel.grid(row = 1, column = 0, pady = 5, sticky = 'nsew')
            sleevelabel.grid(row = 2, column = 0, pady = 5, sticky = 'nsew')
            screwlabel.grid(row = 3, column = 0, pady = 5, sticky = 'nsew')
            stationlabel.grid(row = 4, column = 0, pady = 5, sticky = 'nsew')
            productbutton.grid(row = 1, column = 1, pady = 5, sticky = 'w')
            sleevebutton.grid(row = 2, column = 1, pady = 5, sticky = 'w')
            screwbox.grid(row = 3, column = 1, pady = 5, sticky = 'w')
            stationbox.grid(row = 4, column = 1, pady = 5, sticky = 'w')
            productframe.columnconfigure(index = 0, weight = 1)
            productframe.columnconfigure(index = 1, weight = 1)

        statusframe = tk.Frame(contentframe, borderwidth = 3, relief = 'ridge')
        statusframe.grid(row = row_count + 1, column = 0, columnspan = 99, padx = 10, pady = 10, sticky = 'nsew')

        self.progressbox_text = tk.StringVar(value = "0 %")
        stepnextbutton = tk.Button(statusframe, text = "Krok produkcji", font = self._small_font, command = self._nextProductionStep)
        forcefinishbutton = tk.Button(statusframe, text = "Koniec zamówienia", font = self._small_font, command = self._forceOrderFinish)
        progresslabel = tk.Label(statusframe, text = "Postęp:", font = self._small_font)
        progressbox = tk.Entry(statusframe, state = "disabled", width = 5, font = self._small_font, textvariable = self.progressbox_text)

        stepnextbutton.grid(row = 0, column = 1, padx = 5, pady = 5)
        forcefinishbutton.grid(row = 0, column = 2, padx = 5, pady = 5)
        progresslabel.grid(row = 0, column = 3, padx = 5, pady = 5)
        progressbox.grid(row = 0, column = 4, padx = 5, pady = 5)

    def _updateProgress(self):
        maximum_steps = 0
        current_steps = 0
        for idx, isActiveVar in enumerate(self.products_states):
            if isActiveVar.get():
                maximum_steps += LAST_STATION_NUM
                current_steps += int(self.stationboxes[idx].get())
        if maximum_steps:
            progress = int(current_steps / maximum_steps * 100)
        else:
            progress = 0
        self.progressbox_text.set("{} %".format(progress))

    def _getProgressPercent(self):
        progress_string = self.progressbox_text.get()
        return int(progress_string.split(" ")[0])

    def _forceOrderFinish(self):
        for idx, isActiveVar in enumerate(self.products_states):
            if isActiveVar.get():
                self.stationboxes[idx].set(LAST_STATION_NUM)
        self.progressbox_text.set("100 %")

    def _nextProductionStep(self):
        # check each product position
        stations_statuses = [-1] * (STATION_COUNT)
        product_count = 0
        ongoing_count = 0
        for product_idx, isActiveVar in enumerate(self.products_states):
            if isActiveVar.get():
                product_count += 1
                station_num = int(self.stationboxes[product_idx].get())
                station_idx = int(station_num / 10) - 1
                if STATION_COUNT > station_idx >= 0:
                    ongoing_count += 1
                    stations_statuses[station_idx] = product_idx

        # move each product one position right
        for idx in range(STATION_COUNT - 1, 0, -1):
            stations_statuses[idx] = stations_statuses[idx-1]

        # start new product from queue
        if product_count != ongoing_count:
            stations_statuses[0] = ongoing_count

        # update station for each product
        for station_idx, product_idx in enumerate(stations_statuses):
            if product_idx >= 0:
                station_num = (station_idx + 1) * 10
                self.stationboxes[product_idx].set(station_num)

        self._updateProgress()

    def _initializeOrder(self, bytez):
        product_count = bytez[1]
        for idx, (sleeve, screw) in enumerate(zip(bytez[2::2], bytez[3::2])):
            if idx < product_count:
                state = True
            else:
                state = False
            self.products_states[idx].set(state)
            self.sleevebuttons_states[idx].set(sleeve)
            self.screwboxes[idx].set(screw)
            self.stationboxes[idx].set("0")
        self._updateProgress()

    def _createStatusResponse(self):
        response = b''
        for idx, isActiveVar in enumerate(self.products_states):
            val = 0
            if isActiveVar.get():
                val = int(self.stationboxes[idx].get())
            response += val.to_bytes(1, 'big')
        response += (0).to_bytes(13, 'big')
        response += self._getProgressPercent().to_bytes(1, 'big')
        return response

    def _parseInput(self, data):
        response = b''
        if data[0] == ord(PlcMasterManager.CMD_CODE_GET_STATUS):
            return self._createStatusResponse()
        elif data[0] == ord(PlcMasterManager.CMD_CODE_SET_ORDER):
            self._initializeOrder(data)
            return None
        else:
            print("Could not parse data: {}".format(data))

    def _inputReaderLoop(self):
        while self._running.is_set():
            data = self._sockmngr_rx.recv()
            if data:
                response = self._parseInput(data)
                if response:
                    self._sockmngr_tx.send(response)
            time.sleep(0.05)

    def start(self):
        self._sockmngr_tx.start()
        self._sockmngr_rx.start()
        self._running.set()
        self._input_thread = threading.Thread(target=self._inputReaderLoop)
        self._input_thread.start()
        self._root.mainloop()

    def stop(self):
        self._running.clear()
        if self._input_thread is not None and self._input_thread.isAlive():
            self._input_thread.join()
        self._sockmngr_rx.stop()
        self._sockmngr_tx.stop()
        self._root.destroy()


if __name__ == "__main__":
    port_tx = 2098
    port_rx = 2099
    server  = "localhost"

    dummyplc = DummyMasterPlc(server, port_tx, port_rx)
    dummyplc.start()
