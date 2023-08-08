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


def search_encyclopedia(request):
    searched_text = request.GET['q']
    entry_text = util.get_entry(searched_text)

    if entry_text is not None:
        entry_detail = {'title': searched_text, 'text': entry_text}
        return render(request, "encyclopedia/entry-detail.html",
                      {
                          'entry_detail': entry_detail
                      })
    else:
        entries = util.list_entries()
        print(entries)
        print(searched_text)
        matched_entries = [entry for entry in entries if str.lower(searched_text) in (str.lower(entry))]
        print(matched_entries)
        return render(request, "encyclopedia/search-results.html",
                      {
                          'search_results': matched_entries
                      })
