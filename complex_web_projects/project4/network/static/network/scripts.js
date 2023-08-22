document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#new-post-form')
        .addEventListener('submit', (event) => new_post(event));
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

    loaded_posts_promise.then(loaded_emails => {
        function append_post(loaded_post) {
            const posts_section_selector = document.querySelector('#posts');
            document.querySelector('#posts').style.display = 'block';

            const h3_element = document.createElement('h3');
            h3_element.innerText = loaded_post.user.name;

            console.log("h3_element:");
            console.log(h3_element);

            posts_section_selector.appendChild(h3_element);
        }

        if(loaded_emails.length > 0)
        {
            console.log("Loaded e-mails found");
            loaded_emails.forEach(append_post);
        } else {
            console.error("No e-mails loaded from API.");
        }
    }).catch(error => {
        console.error(error.toString());
    });


}

function fetch_posts_api()
{
    return fetch('/all-posts')
        .then(response => response.json())
        .then(posts => {
            return posts;
        })
}
