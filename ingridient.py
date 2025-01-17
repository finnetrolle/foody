from product import Product

class Ingridient:
    def __init__(self, product: Product, weight: int):
        self.product = product
        self.weight = weight
        self.cfpc = product.cpfc.get_for_weight(weight)