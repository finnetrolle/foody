

class CPFC:
    def __init__(self, protein: float, fat: float, carbs: float) -> None:
        self.protein: float = protein
        self.fat: float = fat
        self.carbs: float = carbs
        self.calories = protein * 4.0 + fat * 9.0 + carbs * 4.0
        
    def __add__(self, other: 'CPFC') -> 'CPFC':
        return CPFC(self.protein + other.protein, self.fat + other.fat, self.carbs + other.carbs)
    
    def get_for_weight(self, weight: int) -> 'CPFC':
        coeff = weight / 100
        return CPFC(self.protein * coeff, self.fat * coeff, self.carbs * coeff)

    def __str__(self) -> str:
        return f'p {self.protein:.0f}, f {self.fat:.0f}, c {self.carbs:.0f}, kcal {self.calories:.0f}'
    