from django.urls import path, include

urlpatterns = [
    path('', include('linear_eq_solver.urls')),
]
