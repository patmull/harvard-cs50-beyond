
document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));

  document.querySelector('#compose').addEventListener('click', compose_email);

  // Later created elements: This cannot contain class name, because it does not exist the page (DOM) load!
  document.addEventListener('click', (event) => fetch_email_detail(event));

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  function append_email(email) {
    const new_email_link = document.createElement('a');
    const new_div = document.createElement('div');
    const date_span = document.createElement('span');

    new_email_link.href = `/emails/${email.id}`;
    new_email_link.className = 'email-link';

    new_div.innerText = `${email.sender}: ${email.subject}`;
    new_div.className = 'mail-list-item';

    date_span.innerText = `${email.timestamp}`;
    date_span.className = 'right-align';

    new_div.appendChild(date_span);

    new_email_link.appendChild(new_div);

    document.querySelector('#emails-view')
      .appendChild(new_email_link);
  }

  let loaded_emails_promise = fetch_email_api(mailbox);

  loaded_emails_promise.then(loaded_emails => {
    // Access the resolved value (array of emails)
    console.log("Loaded e-mails:");
    console.log(loaded_emails);

    // Access individual email objects
    if (loaded_emails.length > 0) {
      loaded_emails.forEach(append_email);
    }
  }).catch(error => {
    console.error("An error occurred:", error);
  });
}


function fetch_email_detail(event)
{
  event.preventDefault();
  const target_link = event.target.closest('.email-link');
  console.log("target_link:");
  console.log(target_link);
  const email_id = target_link.href.split('/emails/')[1];
  console.log('email_id:');
  console.log(email_id);
  fetch(`emails/${email_id}`)
      .then(response => response.json())
      .then(email => {
        console.log(email);
        // return email;
      })
      .catch(error => {
        console.log(`An error had occurred: ${error}`);
      })
}

function fetch_email_api(mailbox)
{
  console.log("Fetching e-mail...");
  return fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {
      // Print emails
    console.log("emails:");
    console.log(emails);
      // ... do something else with emails ...
    return emails;
  });

}