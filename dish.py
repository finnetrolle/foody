from ingridient import Ingridient
from cpfc import CPFC

class Dish:
    def __init__(self, name: str, ingridients: list[Ingridient]) -> None:
        self.name = name
        self.ingridients = ingridients
        self.total_weight = sum([i.weight for i in ingridients])
        self.cpfc = CPFC(0,0,0)
        for i in ingridients:
            self.cpfc += i.cfpc
            
    def __str__(self):
        return f'Dish: {self.name} ({self.total_weight} g) [{self.cpfc}] q: {self.cpfc.calories * 100 / self.total_weight:.2f}'
        
        
        