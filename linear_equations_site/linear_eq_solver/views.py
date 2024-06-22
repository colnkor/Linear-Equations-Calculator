import json
from django.http import JsonResponse
from django.shortcuts import render
from .methods.agregator import *

EQUATION_SOLVERS = {
    'matrix-form-linear-eq': matrix_form_linear_eq
}

def index(request):
    if (request.method == 'POST'):
        try:
            _data = json.loads(request.body)
            eqtype = _data.get('type')
            info   = _data.get('info')
            method = _data.get('method')

            if eqtype not in EQUATION_SOLVERS:
                return JsonResponse({'error': 'Unknown type of equation'}, status=400)

            result = EQUATION_SOLVERS[eqtype](info, method)
            return JsonResponse({
                'answer': result
            })
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Incorrect JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        
    else:
        return render(request, 'linear_eq_solver/index.html')