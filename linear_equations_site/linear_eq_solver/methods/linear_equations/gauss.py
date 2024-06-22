from decimal import getcontext, ROUND_FLOOR
from ..tools.checkers import check_for_null
from ..tools.converters import convert_array_to_decimal

getcontext().prec = 31
getcontext().rounding = ROUND_FLOOR
print(getcontext())

def Gauss(matrix, find_rank=False):
    """
    Solves systems of linear equations.

    Args:
        2D array, that represents matrix
                   [a a a | b]
        matrix = [ [a a a | b] ]
                   [a a a | b]
    Returns:
        -
    """
    new_matrix = convert_array_to_decimal(matrix)
    colums = len(new_matrix[0])
    # Lead values should be maximum numbers in a column
    # For more accurate computing
    # Forward elimination
    for lead_row in range(min(len(new_matrix), colums) - 1):
        # Devide each element of lead_row on lead value to set it to 1
        max_val = 0
        at      = 0
        for row in range(lead_row, len(new_matrix)):
            if (abs(new_matrix[row][lead_row]) > max_val):
                max_val = new_matrix[row][lead_row]
                at = row
        if (at > lead_row):
            key = new_matrix[lead_row]
            new_matrix[lead_row] = new_matrix[at]
            new_matrix[at] = key
        for cell in reversed(range(lead_row, colums)):
            new_matrix[lead_row][cell] = round(new_matrix[lead_row][cell] / new_matrix[lead_row][lead_row], 9)
        for row_after in range(lead_row+1, len(new_matrix)):
            coef = new_matrix[row_after][lead_row]
            if coef == 0:
                continue
            for celli in range(colums):
                new_matrix[row_after][celli] -= round(new_matrix[lead_row][celli] * coef, 9)
            check_for_null(new_matrix, new_matrix[row_after])
    if (find_rank):
      return len(new_matrix) 
    # Backward elimination
    for lead_row in reversed(range(1, min(len(new_matrix), colums))):
        # Devide each elemet of lead_row on lead value to set it to 1
        for cell in reversed(range(colums)):
            new_matrix[lead_row][cell] = round(new_matrix[lead_row][cell] / new_matrix[lead_row][lead_row], 9)
        for row_after in reversed(range(lead_row)):
            coef = new_matrix[row_after][lead_row]
            if coef == 0:
                continue
            for celli in range(colums):
                new_matrix[row_after][celli] -= round(new_matrix[lead_row][celli] * coef, 9)

    return new_matrix
