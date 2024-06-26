import json
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from django.shortcuts import render
from .methods.agregator import *

EQUATION_SOLVERS = {
    'matrix-form-linear-eq': matrix_form_linear_eq
}

@ensure_csrf_cookie
def index(request):
    if request.method == 'GET':
        if not request.COOKIES.get('matrix_calc_790_newuser'):
            response = render(request, 'linear_eq_solver/index.html', {'show_info': True})
            response.set_cookie('matrix_calc_790_newuser', 'no', 24*60*60)
        else:
            response = render(request, 'linear_eq_solver/index.html', {'show_info': False})
        return response
    try:
        _data = json.loads(request.body)
        eqtype = _data.get('type')
        info   = _data.get('info')
        method = _data.get('method')

        if eqtype not in EQUATION_SOLVERS:
            return JsonResponse({'error': 'Unknown type of equation'})

        result = EQUATION_SOLVERS[eqtype](info, method)
        return JsonResponse({
            'result': 'answer',
            'answer': result
        })
    except ValueError as ve:
        return JsonResponse({ 'result': 'excuse',
                                'answer' : str(ve)})
    except Exception:
        return JsonResponse({'result': 'excuse', 'answer': 'Простите, мы не можем решить данную задачу. Проверьте корректность ввода и попробуйте снова!'})