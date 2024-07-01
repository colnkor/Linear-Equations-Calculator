import unicodedata

def is_letter(char):
    return unicodedata.category(char).startswith('L')

def check_letters_in_2d_array(arr):
    for row in arr:
        for item in row:
            key = item.replace('abs', '')
            if isinstance(key, str):
                if any(is_letter(char) for char in key):
                    return True
    return False

def check_for_nulls(matrix):
    """
    Checks if elem-row is null and removes it if true.
    Works only with Decimal objects.

        Args:
        2D array, that represents matrix and row to check
                   [a a a | b]
        matrix = [ [a a a | b] ]
                   [a a a | b]

    Returns:
        New matrix without nulls
    """
    new_matrix = []
    for row in matrix:
        for column in row:
            if column != 0:
                break
        if column != 0:
            new_matrix.append(row)
    return new_matrix


def check_systems_compatibility(matrix):
    from ..linear_equations.matrix_rank import matrix_rank

    rank_of_augmented = matrix_rank(matrix)
    rank_of_main      = matrix_rank([row[:-1] for row in matrix])

    return ((rank_of_augmented[0] == rank_of_main[0] and rank_of_main[0] != 0), rank_of_augmented)
