from .tools.checkers import check_letters_in_2d_array
from .linear_equations.gauss import Gauss
from sympy import simplify

LINEAR_EQ_SOLVERS = {
    'Gauss': Gauss,
}

def matrix_form_linear_eq(matrix, method):
    if (check_letters_in_2d_array(matrix)):
        raise Exception('Matrix contains letters! May be illegal call!' + matrix)
    if (not method in LINEAR_EQ_SOLVERS):
        raise Exception('Method is not in LINEAR_EQ_SOLVERS! May be illegal call!' + method)
    try:
        for row in matrix:
            for col in row:
                col = simplify(col).evalf()
    except Exception as e:
        raise e
    
    return LINEAR_EQ_SOLVERS[method](matrix)