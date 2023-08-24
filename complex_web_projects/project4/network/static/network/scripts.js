
document.addEventListener('DOMContentLoaded', function () {

    const csrf_token = CSRF_TOKEN;

    console.log("CSRF_TOKEN");
    console.log(csrf_token);

    const new_post_form = document.querySelector('#new-post-form');

    document.querySelector('#following-nav-link')
        .addEventListener('click', (event) => load_followings());

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

    document.querySelector('#posts')
        .addEventListener('click', (event) => new_comment(event));

    document.querySelector('#posts').style.display = 'block';
    load_posts();
});

function new_comment(event) {
    event.preventDefault();

    if(event.target.className === 'new-comment-button')
    {
        console.log("Comment button clicked!");
        console.log("clicked target:");
        console.log(event.target.nextSibling);

        event.target.nextSibling.style.display = 'block';
    }
}

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
            following = get_following_users();
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
            let user_logged = false;

            let already_following = false;

            if(logged_in_user_name !== null)
            {
                if(isEmpty(logged_in_user_name))
                {
                    include_follow_unfollow_form = false;
                    user_logged = false;
                } else {
                    console.log("User names:");
                    console.log(loaded_post.user_name);
                    console.log(logged_in_user_name);

                    if(loaded_post.user_name === logged_in_user_name)
                    {
                        console.log("User names are equal.");
                        include_follow_unfollow_form = false;
                        console.log("No user logged in.");
                        user_logged = true;

                    } else {
                        console.log("User names are not equal.");
                        include_follow_unfollow_form = true;
                        user_logged = true;
                    }
                }
            } else {
                include_follow_unfollow_form = false;
                console.error("Was unable to get id of an logged in user.");
                user_logged = false;
            }

            if(following === null || following === undefined)
            {
                console.log("No followers found.");
            } else
            {
                following
                    .then(following => {
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
                        console.log("Following:");
                        console.log(following);

                        const new_text = document.createElement('p');
                        new_text.innerText = loaded_post.text;
                        const new_date = document.createElement('p');
                        new_date.className = 'post-date';
                        new_date.innerText = loaded_post.created_at;

                        let follow_form;
                        if(include_follow_unfollow_form === true)
                        {
                            console.log(`include_follow_unfollow_form: ${include_follow_unfollow_form}`);
                            if(already_following === true)
                            {
                                follow_form = create_follow_unfollow_form("Unfollow", loaded_post.user_id);
                                post_div.appendChild(follow_form);
                            } else {
                                follow_form = create_follow_unfollow_form("Follow", loaded_post.user_id);
                                post_div.appendChild(follow_form);
                            }
                        }

                        const new_comment_button = document.createElement('button');
                        new_comment_button.className = 'new-comment-button';
                        new_comment_button.innerText = 'Comment';

                        const comment_form = create_comment_form(loaded_post);

                        post_div.appendChild(new_text);
                        post_div.appendChild(new_date);
                        post_div.appendChild(new_comment_button);
                        post_div.appendChild(comment_form);

                        const posts_list = document.querySelector('#posts-list');
                        posts_list.appendChild(post_div);

                        posts_section_selector.appendChild(posts_list);
                    })
            }
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


function get_following_users()
{
    // User is logged in
    const loaded_following_promise = fetch_following();

    return loaded_following_promise.then(
        loaded_followers => {
          return loaded_followers.following;
        }
    )
}

function load_followings() {

    const posts_section = document.getElementById('posts');

    function append_following_user(user_name)
    {
        console.log("user_name (following):");
        console.log(user_name);

        const following_user_div = document.createElement('div');
        following_user_div.className = 'container';
        following_user_div.innerText = user_name;

        posts_section.append(following_user_div);
    }

    document.getElementById('page-title').innerText = "Following";

    posts_section.innerText = '';

    const followings_promise = get_following_users();

    followings_promise.then(following => {
        console.log("following:");
        console.log(following);

        following.forEach(append_following_user);
    })

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
        .then(data => {
            return data;
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

function create_comment_form(loaded_post)
{
    // Not be visible by default

    const new_comment_form = document.createElement('form');
    new_comment_form.method = 'PUT';
    new_comment_form.className = 'new-comment-form';

    const comment_text = document.createElement('textarea');
    comment_text.className = 'form-control';
    comment_text.rows = 3;
    comment_text.name = 'new_comment_text';

    const new_comment_form_input = document.createElement('input');
    new_comment_form_input.type = 'hidden';
    new_comment_form_input.value = loaded_post.id;

    const submit_comment_button = document.createElement('input');
    submit_comment_button.type = 'submit';
    submit_comment_button.value = 'Send';

    new_comment_form.append(comment_text, new_comment_form_input, submit_comment_button);

    new_comment_form.style.display = "none";

    return new_comment_form;
}
