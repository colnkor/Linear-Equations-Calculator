def Gauss(matrix, find_rank=False):
    from ..tools.checkers import check_for_nulls
    """
    Solves systems of linear equations.
    Has option find_rank that stops algorithm after 
    Forward elimination and returns rank of a matrix.

    Args:
        2D array, that represents matrix
                   [a a a | b]
        matrix = [ [a a a | b] ]
                   [a a a | b]
    Returns:
        New matrix with Decimal objects in it
    """
    new_matrix = new_matrix = [row[:] for row in matrix]
    columns = len(new_matrix[0])
    new_matrix = check_for_nulls(new_matrix)
    # Lead values should be maximum numbers in a column
    # For more accurate computing
    for lead_row in range(len(new_matrix)):
        if lead_row >= len(new_matrix):
            break
        for lead_column in range(lead_row, columns):
            max_val = abs(new_matrix[lead_row][lead_column]) 
            at = 0
            # Find maxim value in a  lead_column
            for row in range(lead_row + 1, len(new_matrix)):
                if (max_val < abs(new_matrix[row][lead_column])):
                    max_val = abs(new_matrix[row][lead_column])
                    at = row
            # If biggest found
            if (at != 0):
                key = new_matrix[at]
                new_matrix[at] = new_matrix[lead_row]
                new_matrix[lead_row] = key
            
            # If pivot value is zero
            if (new_matrix[lead_row][lead_column] == 0):
                continue
            
            # Devide lead_row for pivot vlaue add check for 1
            for column in reversed(range(lead_column, columns)):
                new_matrix[lead_row][column] = new_matrix[lead_row][column] / new_matrix[lead_row][lead_column]
            for elim_row in range(len(new_matrix)):
                coef = new_matrix[elim_row][lead_column]
                if (elim_row == lead_row or coef == 0):
                    continue
                for elim_col in range(lead_column, columns):
                    new_matrix[elim_row][elim_col] -= new_matrix[lead_row][elim_col] * coef
            new_matrix = check_for_nulls(new_matrix)
            break
    if (find_rank):
        return (len(new_matrix), new_matrix)
    return new_matrix

            



