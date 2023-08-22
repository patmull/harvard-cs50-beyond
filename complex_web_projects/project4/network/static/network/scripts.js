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



    // Fetch
    fetch('/new-post', {
        method: 'POST',
        body: new_post_data
    })
        .then(response => response.json())
        .then(result => {
            console.log("result");
            console.log(result);

            // if result ok, load all posts again
            if(result.status === 201)
            {
                load_posts();
            }
        })
}

function load_posts() {

}
