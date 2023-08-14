from copy import copy

bradavice = [
    {'name': "Harry Potter", 'dormacy': 'Nebelvír'},
    {'name': "Lenka Láskorádová", 'dormacy': 'Havraspár'},
    {'name': "Draco Malfoy", 'dormacy': 'Zmijozel'}
]


# It's important to use copy, otherwise the variable is connected to the original and they are both changed
bradavice_original = copy(bradavice)


def sort_by_name(person):
    return person['name']


print(bradavice)
bradavice.sort(key=sort_by_name)
print(bradavice)

bradavice = bradavice_original

print(bradavice)
bradavice.sort(key=lambda person: person['name'])
print(bradavice)
