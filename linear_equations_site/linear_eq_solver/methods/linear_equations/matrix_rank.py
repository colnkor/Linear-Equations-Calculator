from .gauss import Gauss

def matrix_rank(matrix):
    new_matrix = [row[:] for row in matrix]
    return Gauss(new_matrix, True)