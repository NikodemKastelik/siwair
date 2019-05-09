from collections import OrderedDict
import copy

class Product:
    def __init__(self, encoded_product):
        self._encoded_product = encoded_product

    def addCount(self, count):
        curr_count = self.getCount()
        self._encoded_product['quantity'] = str(curr_count + count)

    def removeCount(self, count):
        curr_count = self.getCount()
        assert(curr_count >= count)
        self._encoded_product['quantity'] = str(curr_count - count)

    def getCount(self):
        return int(self._encoded_product['quantity'])

    def getRecipe(self):
        return self._encoded_product['recipe']

    def getEncodedProduct(self):
        return self._encoded_product

    def splitByCount(self, count):
        curr_count  = self.getCount()
        assert(curr_count > count)

        product1 = self._encoded_product
        product1['quantity'] = str(count)

        product2 = copy.copy(self._encoded_product)
        product2['quantity'] = str(curr_count - count)

        return Product(product1), Product(product2)

class Order:
    MAX_PRODUCTS_PER_ORDER = 6

    def __init__(self, products):
        assert(self.calcProductAmount(products) <= self.MAX_PRODUCTS_PER_ORDER)
        self._products = products

    @staticmethod
    def calcProductAmount(products):
        accumulator = 0
        for product in products:
            accumulator += product.getCount()
        return accumulator

    def getProductCount(self):
        return self.calcProductAmount(self._products)

    def addProducts(self, new_products):
        assert(self.getProductCount() + self.calcProductAmount(new_products) <= self.MAX_PRODUCTS_PER_ORDER)

        for old_product in self._products:
            for new_product in new_products:
                if old_product.getRecipe() == new_product.getRecipe():
                    count = new_product.getCount()
                    old_product.addCount(count)
                    new_product.removeCount(count)

        for product in new_products:
            if product.getCount():
                self._products.append(product)

    def getProducts(self):
        return self._products

    def getEncodedProducts(self):
        encoded = []
        for product in self._products:
            encoded.append(product.getEncodedProduct())
        return encoded

class OrderList:
    def __init__(self):
        self._queue = OrderedDict()
        self._id = 0

    def _getNextId(self):
        self._id += 1
        return self._id

    def _divideProducts(self, products):
        leftover = None
        chunk = []
        chunks = []
        idx = 0
        while idx < len(products):
            product = products[idx]
            diff = Order.MAX_PRODUCTS_PER_ORDER - Order.calcProductAmount(chunk)
            if product.getCount() > diff:
                product, leftover  = product.splitByCount(diff)
                products[idx] = leftover
            else:
                idx += 1

            chunk.append(product)

            if Order.calcProductAmount(chunk) == Order.MAX_PRODUCTS_PER_ORDER:
                chunks.append(chunk)
                chunk = []
        if chunk:
            chunks.append(chunk)
        return chunks

    def _buildEncodedOrder(self, id, order):
        encoded = {'id': str(id)}
        encoded['contents'] = order.getEncodedProducts()
        return encoded

    def append(self, encoded_products):
        products = []
        for prod in encoded_products:
            products.append(Product(prod))

        #check if can append some products to last order in queue
        if not self.isEmpty():
            last_order = self._queue[str(self._id)]
            diff = Order.MAX_PRODUCTS_PER_ORDER - last_order.getProductCount()
            idx = 0
            while diff and idx < len(products):
                product = products[idx]
                if product.getCount() > diff:
                    product, leftover  = product.splitByCount(diff)
                    products[idx] = leftover
                else:
                    idx += 1
                last_order.addProducts([product])
                diff = Order.MAX_PRODUCTS_PER_ORDER - last_order.getProductCount()
            products = products[idx:]

        chunks = self._divideProducts(products)
        for products_chunk in chunks:
            self._queue[str(self._getNextId())] = Order(products_chunk)

    def isEmpty(self):
        return not len(self._queue)

    def getById(self, id):
       return self._buildEncodedOrder(id, self._queue[str(id)])

    def removeById(self, id):
        del self._queue[str(id)]

    def print(self):
        for id in self._queue:
            print("Order id: ", id)
            for product in self._queue[id].getProducts():
                print("Amount {}: {}".format(product.getCount(), product.getRecipe()))

    def pop(self):
        id, order = self._queue.popitem(last=False)
        return self._buildEncodedOrder(id, order)

    def get(self):
        return [self.getById(id) for id in self._queue]
