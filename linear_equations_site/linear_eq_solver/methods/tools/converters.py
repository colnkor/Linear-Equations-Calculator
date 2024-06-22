from decimal import Decimal

def decimal_array_to_float(decimal_array):
    """
    Converts a 2D array of Decimal objects to integers.

    Args:
      decimal_array: A 2D array containing Decimal objects.

    Returns:
      A 2D array with the same dimensions as the input, containing integers.
    """

  # Create a new array to store the integer values
    float_array = [[0 for _ in range(len(decimal_array[0]))] for _ in range(len(decimal_array))]

  # Iterate through the rows and columns of the array
    for i in range(len(decimal_array)):
        for j in range(len(decimal_array[0])):
          # Convert each Decimal object to an integer and store it in the new array
            float_array[i][j] = float(decimal_array[i][j])

    return float_array

def convert_array_to_decimal(array):
    """
  Converts all elements in a 2D array to Decimal type.

  Args:
    array: A 2D array of numbers.

  Returns:
    A new 2D array with all elements converted to Decimal.
  """

    # Create a new array with the same dimensions as the input array
    decimal_array = [[None for _ in range(len(array[0]))] for _ in range(len(array))]

    # Iterate through the rows and columns of the array
    for i in range(len(array)):
        for j in range(len(array[0])):
            # Convert each element to Decimal and store it in the new array
            decimal_array[i][j] = Decimal(array[i][j])

    return decimal_array