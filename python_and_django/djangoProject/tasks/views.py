from django import forms
from django.shortcuts import render

# If lists is defined as a "global" variable, values stays there until server restart
LIST_OF_TASKS = ['nákup', 'vysávání', 'zřídit účet']


class NewItemForm(forms.Form):
    new_list_item = forms.CharField(label="Item:", required=True)


class NewFormWithQuantity(NewItemForm, forms.Form):
    new_list_item_quantity = forms.IntegerField(label="Quantity:", required=True, min_value=1, step_size=1, initial=1)


# create your views here.
def index(request):
    list_of_tasks = LIST_OF_TASKS

    # If lists are defined as a function variables, values are lost after page refresh
    # list_of_tasks = ['nákup', 'vysávání', 'zřídit účet']
    if request.method == "POST":
        new_task_name = request.POST.get('new_list_item')
        list_of_tasks.append(new_task_name)

    return render(request, 'tasks.html', {
        'tasks': list_of_tasks,
        "new_item_form": NewItemForm
    })


def shopping_lists(request):
    # Before first use of a session, we need to run: python manage.py migrate
    # It is important to use the if condition here, otherwise it will create a new list each time
    if 'list_of_shopping_items' not in request.session:
        request.session['list_of_shopping_items'] = []

    # If lists are defined as a function variables, values are lost after page refresh
    # list_of_tasks = ['nákup', 'vysávání', 'zřídit účet']
    if request.method == "POST":
        new_shopping_item_name = request.POST.get('new_list_item')
        new_shopping_item_quantity = request.POST.get('new_list_item_quantity')
        new_item_quantity_pair = {'list_item_name': new_shopping_item_name, 'quantity': new_shopping_item_quantity}
        # This does not work well
        # request.session['list_of_shopping_items'].append(new_item_quantity_pair)
        # This how it supposed to work:
        request.session['list_of_shopping_items'] += [new_item_quantity_pair]

    return render(request, 'shopping-lists.html', {
        'shopping_items': request.session['list_of_shopping_items'],
        'new_item_form': NewFormWithQuantity
    })
