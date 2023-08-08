from django.shortcuts import render

import encyclopedia
from . import util


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })


def title(request, title):
    entry_text = encyclopedia.util.get_entry(title)
    entry_detail = {'title': title, 'text': entry_text}
    if entry_text is None:
        return render(request, "encyclopedia/index.html", {
            'error_message': "Error had occurred!"
        })
    else:
        return render(request, "encyclopedia/entry-detail.html",
                      {
                          'entry_detail': entry_detail
                      })
