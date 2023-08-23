document.addEventListener('DOMContentLoaded', function () {

    const new_post_form = document.querySelector('#new-post-form');

    if(new_post_form !== null)
    {
        new_post_form.addEventListener('submit', (event) => new_post(event));
    }

    document.querySelector('#posts').display = 'block';
    load_posts();

});

function new_post(event) {
    event.preventDefault();

    const post_text = event.target.post_text.value;
    const post_multimedia_link = event.target.post_multimedia_link.value;

    const new_post_data =  JSON.stringify({
        'post_text': post_text,
        'post_multimedia_link': post_multimedia_link
    });

    console.log("new_post_data:");
    console.log(new_post_data);

    // Fetch
    fetch('/new-post', {
        method: 'POST',
        body: new_post_data
    })
        .then(response => {
            if(response.status === 201) {
                response.json()
                    .then(result => {
                        console.log("result");
                        console.log(result);

                        console.log("Loading posts...");
                        load_posts();

                    });
            } else {
                console.error("Failed to get successful status from the API request");
            }
        })

}

function load_posts() {

    const loaded_posts_promise = fetch_posts_api();
    const posts_section_selector = document.querySelector('#posts');

    loaded_posts_promise.then(loaded_posts => {
        function append_post(loaded_post) {
            console.log("loaded_post");
            console.log(loaded_post);

            const post_div = document.createElement('div');
            post_div.className = 'post-detail';
            post_div.className += " " + "container";

            document.querySelector('#posts').style.display = 'block';

            const user_name_element = document.createElement('h4');
            user_name_element.innerText = loaded_post.user_name;
            post_div.appendChild(user_name_element);

            const new_text = document.createElement('p');
            new_text.innerText = loaded_post.text;
            const new_date = document.createElement('p');
            new_date.className = 'post-date';
            new_date.innerText = loaded_post.created_at;

            post_div.appendChild(new_text);
            post_div.appendChild(new_date);

            const posts_list = document.querySelector('#posts-list');
            posts_list.appendChild(post_div);

            posts_section_selector.appendChild(posts_list);
        }

        console.log("Loaded posts:");
        console.log(loaded_posts);
        if(loaded_posts.length > 0)
        {
            const posts_section_headline = document.createElement('h3');
            posts_section_headline.innerText = "What's new...";
            const posts_section_headline_div = document.createElement('div');
            posts_section_headline_div.className = 'container';

            posts_section_headline_div.appendChild(posts_section_headline);
            posts_section_selector.appendChild(posts_section_headline_div);

            const posts_section_list = document.createElement('div');
            posts_section_list.id = 'posts-list';
            posts_section_list.className = 'row';

            posts_section_selector.appendChild(posts_section_list);

            console.log("Loaded e-mails found");
            loaded_posts.forEach(append_post);
        } else {
            console.error("No e-mails loaded from API.");
        }
    }).catch(error => {
        console.error("An error occurred: ", error);
    });


}

function fetch_posts_api()
{
    return fetch('/all-posts', {method: 'GET'})
        .then(response => response.json())
        .then(posts => {
            return posts;
        })
}
