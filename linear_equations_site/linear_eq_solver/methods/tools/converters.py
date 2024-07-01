def stringify_matrix(matrix):
    def stringify_many(matrix):
        result = {}
        search_from = 0
        for row in matrix:
            pivot_index = ''
            for pivot in range(search_from, len(row)):
                # Нахождение первого значения != 0 в строке
                if (row[pivot] != 0):
                    pivot_index = 'x_'+str(pivot+1)
                    # Вставить значение свободного члена
                    result[pivot_index] = str(row[-1]) if row[-1] != 0 else ''
                    break
            for unkwn in range(pivot+1, len(row) - 1):
                # Нахождение остальных свободных неизвестных
                if (row[unkwn] != 0):
                    result[pivot_index] += f'{'+' if row[unkwn] < 0 else ''}{str(-row[unkwn])}'+'x_'+str(unkwn+1)
            if result[pivot_index] == '':
                result[pivot_index] = '0'
        return result

    return stringify_many(matrix[1])
    

    