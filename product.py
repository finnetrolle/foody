from cpfc import CPFC

class Product:
    def __init__(self, name: str, cpfc: CPFC) -> None:
        self.name = name
        self.cpfc = cpfc
        