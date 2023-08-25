
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

    document.querySelector('#posts')
        .addEventListener('click', (event) => click_handler(event, csrf_token));

    document.querySelector('#posts').style.display = 'block';
    load_posts();
});



function click_handler(event, csrf_token) {
    event.preventDefault();

    if(event.target.form !== null)
    {
        if(event.target.form.className === 'new-follower-form')
        {
            follow_unfollow(event, csrf_token, true);
        } else if(event.target.form.className === 'unfollow-form') {
            follow_unfollow(event, csrf_token, false);
        }
    }

    if(event.target.className === 'new-comment-button')
    {
        console.log("Comment button clicked!");
        console.log("clicked target:");
        console.log(event.target.nextSibling);

        event.target.nextSibling.style.display = 'block';
    }

    if(event.target.className === 'send-comment-button')
    {
        // TODO:
        const comment_data = {};
        comment_data['post_id'] = event.target.form.post_id.value;
        comment_data['comment_text'] = event.target.form.new_comment_text.value;
        console.log("comment_data");
        console.log(comment_data);

        fetch('/new-comment', {
            method: 'PUT',
            body: JSON.stringify(comment_data),
        })
            .then(response => response.json())
            .then(result => {
                console.log(result);

                load_posts();

            })
            .catch(
                error => {
                    console.error(error);
                }
            )
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

    const user_id = event.target.form.user_id.value;

    console.log(`Follow: ${follow}, user_id: ${user_id}`);

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

            const post_text = document.createElement('p');
            post_text.innerText = loaded_post.text;
            const post_date = document.createElement('p');
            post_date.className = 'post-date';
            post_date.innerText = loaded_post.created_at;

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
                    })
            }

            post_div.appendChild(post_text);
            post_div.appendChild(post_date);

            if(user_logged === true)
            {
                const comment_form = create_comment_form(loaded_post);
                const new_comment_button = document.createElement('button');
                new_comment_button.className = 'new-comment-button';
                new_comment_button.innerText = 'Comment';

                post_div.appendChild(new_comment_button);
                post_div.appendChild(comment_form);
            }

            const comment_section = document.createElement('div');
            comment_section.className = 'comment-section';
            comment_section.style.display = 'block';

            console.log("Loading comments...");
            const comments_promise = fetch_comments(loaded_post.id);


            comments_promise.then(comments => {

                function append_comments(comment) {
                    const comment_div = document.createElement('div');
                    comment_div.className = 'comment container';

                    const comment_user_name_div = document.createElement('div');
                    comment_user_name_div.className = 'comment-username';
                    comment_user_name_div.innerText = comment.user;

                    const comment_text_div = document.createElement('div');
                    comment_text_div.className = 'comment-text';
                    comment_text_div.innerText = comment.text;

                    comment_div.append(comment_user_name_div, comment_text_div);

                    comment_section.appendChild(comment_div);
                }

                comments.forEach(append_comments);
            })

            post_div.appendChild(comment_section);

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

function load_comments(post_id) {

    const comments_promise = fetch_comments(post_id);

    return comments_promise.then(loaded_comments => {
        return loaded_comments;
    });

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

function get_following_users()
{
    const loaded_following_promise = fetch_following();

    return loaded_following_promise.then(
        loaded_followers => {
          return loaded_followers.following;
        }
    )
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


function fetch_comments(post_id)
{
    console.log("Fetching comment for post:");
    console.log(post_id);
    return fetch(`/comments-for-post/${post_id}`, {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
        console.log("Comment response data:");
        console.log(data);
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
    new_comment_form_input.name = 'post_id';
    new_comment_form_input.value = loaded_post.id;

    const submit_comment_button = document.createElement('input');
    submit_comment_button.type = 'submit';
    submit_comment_button.value = 'Send';
    submit_comment_button.className = 'send-comment-button';

    new_comment_form.append(comment_text, new_comment_form_input, submit_comment_button);

    new_comment_form.style.display = "none";

    return new_comment_form;
}
