import random

from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

import encyclopedia
from . import util
from .util import create_entry_dict


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })


def title(request, title):
    entry_text = encyclopedia.util.get_entry(title)
    entry_detail = create_entry_dict(title, entry_text)
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
        entry_detail = create_entry_dict(searched_text, entry_text)
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


def new_page(request):
    if request.method == "POST":
        error_messages = []

        title = request.POST['title']
        markdown = request.POST['markdown']
        all_titles = util.list_entries()

        print("all_titles")
        print(all_titles)

        print("title")
        print(title)

        if title in all_titles:
            error_message = "Article with the same title already exists."
            error_messages.append(error_message)
            # title already presented in articles
            return render(request, "encyclopedia/new-or-edit-page.html",
                          {
                              'error_messages': error_messages
                          })
        else:
            util.save_entry(title, markdown)
            return HttpResponseRedirect(reverse('title', args=(title,)))

    if request.method == "GET":
        return render(request, "encyclopedia/new-or-edit-page.html")


def edit_article(request, title):
    if request.method == "GET":
        found_entry_markdown = util.get_entry(title)

        entry_detail = create_entry_dict(title, found_entry_markdown)

        if found_entry_markdown is not None:
            return render(request, "encyclopedia/new-or-edit-page.html",
                          {
                              'article': entry_detail
                          })
        else:
            raise ValueError('Found entry is unexpectedly None.')

    if request.method == "POST":
        markdown = request.POST['markdown']
        util.save_entry(title, markdown)

        entry_detail = create_entry_dict(title, markdown)
        return render(request, "encyclopedia/entry-detail.html",
                      {
                          'entry_detail': entry_detail
                      })


def random_page(request):
    if request.method == "GET":
        all_entries = util.list_entries()

        random_entry_title = all_entries[random.randint(0, len(all_entries)-1)]

        print("random_entry")
        print(random_entry_title)

        random_entry_markdown = util.get_entry(random_entry_title)
        random_entry = create_entry_dict(random_entry_title, random_entry_markdown)

        return render(request, "encyclopedia/entry-detail.html",
                      {
                          'entry_detail': random_entry
                      })
