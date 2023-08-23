
document.addEventListener('DOMContentLoaded', function () {

    const csrf_token = CSRF_TOKEN;

    console.log("CSRF_TOKEN");
    console.log(csrf_token);

    const new_post_form = document.querySelector('#new-post-form');

    if(new_post_form !== null)
    {
        new_post_form.addEventListener('submit', (event) => new_post(event));
    }

    document.addEventListener('submit', (event) => {
        console.log("event target");
        console.log(event.target.className);

        if(event.target.className === "new-follower-form")
        {
            event.preventDefault();
            console.log('New follower form found!');
            add_new_follower(event, csrf_token);
        } else {
            console.log("Follower form not found. Just loading posts");
        }
    });

    document.querySelector('#posts').display = 'block';
    load_posts();
});

function new_post(event, csrf_token) {
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

function add_new_follower(event, csrf_token) {
    event.preventDefault();

    const user_id = event.target.user_id.value;

    console.log("user id:");
    console.log(user_id);

    const new_follower_data = JSON.stringify({
        'user_id': user_id
    });

    console.log("new_follower_data:");
    console.log(new_follower_data);

    // Fetch
    fetch('/follow', {
        method: 'POST',
        body: new_follower_data,
        headers: {'X-CSRFToken': csrf_token},
        mode: 'same-origin' // Do not send CSRF token to another domain.
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

function isEmpty(str) {
    return (!str || str.length === 0 );
}

function load_posts() {

    const loaded_posts_promise = fetch_posts_api();
    const posts_section_selector = document.querySelector('#posts');

    loaded_posts_promise.then(loaded_posts => {
        function append_post(loaded_post) {
            // const logged_user_id = parseInt({{ request.user.id }})

            console.log("loaded_post");
            console.log(loaded_post);

            const post_div = document.createElement('div');
            post_div.className = 'post-detail';
            post_div.className += " " + "container";

            document.querySelector('#posts').style.display = 'block';

            const user_name_element = document.createElement('h4');
            user_name_element.innerText = loaded_post.user_name;
            post_div.appendChild(user_name_element);

            const user_name = document.getElementById('user_name');

            let include_follow_form = false;

            if(user_name !== null)
            {
                // TODO: check whether the user already follows the given person

                if(isEmpty(user_name))
                {
                    include_follow_form = false;
                } else {

                    const loaded_followers_promise = fetch_followers();
                    let followers;
                    loaded_followers_promise.then(
                        loaded_followers => {
                          followers = loaded_followers.followers;
                        }
                    )

                    console.log(followers);
                    console.log("followers:");

                    const logged_in_user_name = JSON.parse(user_name.textContent);

                    console.log("User names:");
                    console.log(loaded_post.user_name);
                    console.log(logged_in_user_name);

                    if(loaded_post.user_name !== logged_in_user_name)
                    {
                        console.log("User names are not equal.");
                        include_follow_form = true;
                    } else {
                        console.log("User names are equal.");
                        include_follow_form = false;
                        console.log("No user logged in.");
                    }


                }
            } else {
                include_follow_form = false;
                console.error("Was unable to get id of an logged in user.");
            }

            let follow_form;

            if(include_follow_form === true)
            {
                follow_form = document.createElement('form');
                follow_form.className = 'new-follower-form';
                follow_form.method = 'POST';
            }

            const user_id_hidden = document.createElement('input');
            user_id_hidden.type = 'hidden';
            user_id_hidden.name = 'user_id';
            user_id_hidden.value = loaded_post.user_id;

            const user_form_submit = document.createElement('input');
            user_form_submit.type = 'submit';
            user_form_submit.value = "Follow";

            const new_text = document.createElement('p');
            new_text.innerText = loaded_post.text;
            const new_date = document.createElement('p');
            new_date.className = 'post-date';
            new_date.innerText = loaded_post.created_at;

            if(include_follow_form === true)
            {
                follow_form.append(user_id_hidden, user_form_submit);
                post_div.appendChild(follow_form);
            }
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

function fetch_followers()
{
    return fetch('/followers', {method: 'GET'})
        .then(response => response.json())
        .then(followers => {
            return followers;
        })
}
