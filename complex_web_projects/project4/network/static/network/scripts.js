
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

        if(event.target.className === "new-follower-form")
        {
            event.preventDefault();
            follow_unfollow(event, csrf_token, true);
        } else if(event.target.className === "unfollow-form") {
            event.preventDefault();
            follow_unfollow(event, csrf_token, false);
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

    // Fetch
    fetch('/new-post', {
        method: 'POST',
        body: new_post_data
    })
        .then(response => {
            if(response.status === 201) {
                response.json()
                    .then(result => {

                        console.log("Loading posts...");
                        load_posts();

                    });
            } else {
                console.error("Failed to get successful status from the API request");
            }
        })

}

function follow_unfollow(event, csrf_token, follow) {
    event.preventDefault();

    const user_id = event.target.user_id.value;

    const user_data = JSON.stringify({
        'user_id': user_id
    });

    let api_link;
    if(follow === true)
    {
        api_link = '/follow';
    } else {
        api_link = '/unfollow';
    }

    // Fetch
    fetch(api_link, {
        method: 'POST',
        body: user_data,
        headers: {'X-CSRFToken': csrf_token},
        mode: 'same-origin' // Do not send CSRF token to another domain.
    })
        .then(response => {
            if(response.status === 201) {
                response.json()
                    .then(result => {

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

    // Clearing the previous content to fully load posts again.
    posts_section_selector.innerText = '';

    let following;

    // Getting from Django
    const user_name = document.getElementById('user_name');
    const logged_in_user_name = JSON.parse(user_name.textContent);

    if(logged_in_user_name !== null)
    {
        if(!isEmpty(logged_in_user_name))
        {
            // User is logged in
            const loaded_following_promise = fetch_following();

            loaded_following_promise.then(
                loaded_followers => {
                  following = loaded_followers.following;
                  console.log("Following:");
                  console.log(following);
                }
            )
        }
    }

    loaded_posts_promise.then(loaded_posts => {
        function append_post(loaded_post) {
            // const logged_user_id = parseInt({{ request.user.id }})

            const post_div = document.createElement('div');
            post_div.className = 'post-detail';
            post_div.className += " " + "container";

            document.querySelector('#posts').style.display = 'block';

            const user_name_element = document.createElement('h4');
            user_name_element.innerText = loaded_post.user_name;
            post_div.appendChild(user_name_element);

            let include_follow_unfollow_form = false;

            let already_following = false;

            if(logged_in_user_name !== null)
            {
                if(isEmpty(logged_in_user_name))
                {
                    include_follow_unfollow_form = false;
                } else {
                    console.log("User names:");
                    console.log(loaded_post.user_name);
                    console.log(logged_in_user_name);

                    if(loaded_post.user_name === logged_in_user_name)
                    {
                        console.log("User names are equal.");
                        include_follow_unfollow_form = false;
                        console.log("No user logged in.");

                    } else {
                        console.log("User names are not equal.");
                        include_follow_unfollow_form = true;
                    }
                }
            } else {
                include_follow_unfollow_form = false;
                console.error("Was unable to get id of an logged in user.");
            }

            if(following === null || following === undefined)
            {
                console.error("Followers variable is undefined, please contact admin of the app to solve this issue.");
            } else
            {
                if(following.includes(loaded_post.user_name))
                {
                    console.log("User already followed.");
                    console.log("Post user:");
                    console.log(loaded_post.user_name);
                    console.log("Logged user is following:");
                    console.log(following);
                    already_following = true;
                    include_follow_unfollow_form = true;
                }
                console.log("Followers:");
                console.log(following);
            }

            const new_text = document.createElement('p');
            new_text.innerText = loaded_post.text;
            const new_date = document.createElement('p');
            new_date.className = 'post-date';
            new_date.innerText = loaded_post.created_at;

            let follow_form;
            if(include_follow_unfollow_form === true)
            {
                if(already_following === true)
                {
                    follow_form = create_follow_unfollow_form("Unfollow", loaded_post.user_id);
                    post_div.appendChild(follow_form);
                } else {
                    follow_form = create_follow_unfollow_form("Follow", loaded_post.user_id);
                    post_div.appendChild(follow_form);
                }
            }

            post_div.appendChild(new_text);
            post_div.appendChild(new_date);

            const posts_list = document.querySelector('#posts-list');
            posts_list.appendChild(post_div);

            posts_section_selector.appendChild(posts_list);
        }

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

function fetch_following()
{
    return fetch('/following', {method: 'GET'})
        .then(response => response.json())
        .then(following => {
            return following;
        })
}


function create_follow_unfollow_form(submit_text, user_id)
{
    const follow_form = document.createElement('form');

    if(submit_text === "Follow")
        follow_form.className = 'new-follower-form';
    else if(submit_text === "Unfollow")
        follow_form.className = 'unfollow-form';
    else
        console.error("Unexpected stat eof the submit_text variable.");

    follow_form.method = 'POST';

    const user_id_hidden = document.createElement('input');
    user_id_hidden.type = 'hidden';
    user_id_hidden.name = 'user_id';
    user_id_hidden.value =  user_id;

    const follow_user_form_submit = document.createElement('input');
    follow_user_form_submit.type = 'submit';
    follow_user_form_submit.value = submit_text;
    follow_form.append(user_id_hidden, follow_user_form_submit);

    return follow_form;
}
