import unicodedata

def is_letter(char):
    return unicodedata.category(char).startswith('L')

def check_letters_in_2d_array(arr):
    for row in arr:
        for item in row:
            if isinstance(item, str):
                if any(is_letter(char) for char in item) and item.lower() != 'abs':
                    return True
    return False

def check_for_null(matrix, elem):
    """
    Checks if elem-row is null and removes it if true.
    Works only with Decimal objects.

        Args:
        2D array, that represents matrix and row to check
                   [a a a | b]
        matrix = [ [a a a | b] ]
                   [a a a | b]

    Returns:
        -
    """
    for column in elem:
        if (not column.is_zero()):
            return
    matrix.remove(elem)