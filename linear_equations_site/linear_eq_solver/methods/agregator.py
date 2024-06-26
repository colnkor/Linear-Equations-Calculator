from .tools.checkers import check_letters_in_2d_array, check_systems_compatibility
from .tools.converters import stringify_matrix
from .linear_equations.gauss import Gauss
from sympy import nsimplify

LINEAR_EQ_SOLVERS = {
    'Gauss': Gauss,
}

def matrix_form_linear_eq(matrix, method):
    if (check_letters_in_2d_array(matrix)):
        raise Exception('Augmented matrix contains letters! May be illegal call!')
    if (not method in LINEAR_EQ_SOLVERS):
        raise Exception('Method is not in LINEAR_EQ_SOLVERS! May be illegal call!')
    try:
        for r in range(len(matrix)):
            for c in range(len(matrix[r])):
                matrix[r][c] = nsimplify(matrix[r][c])
    except Exception as e:
        raise Exception(e)
    
    result = check_systems_compatibility(matrix)
    
    if (not result[0]):
        raise ValueError('Система линейных уравнений несовместна 😔')



    return stringify_matrix(result[1])