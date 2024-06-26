from .gauss import Gauss

def matrix_rank(matrix):
    return Gauss(matrix, True)