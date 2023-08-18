document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

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

function append_email(email) {
  const new_div = document.createElement('div');
  new_div.innerText = `${email.sender} ${email.subject} ${email.timestamp}`;
  console.log("new_div:");
  console.log(new_div);
  document.querySelector('#emails-view')
      .appendChild(new_div);
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  console.log("fetch_email_api(mailbox)");
  console.log(fetch_email_api(mailbox));
  let loaded_emails_promise = fetch_email_api(mailbox);

  loaded_emails_promise.then(loaded_emails => {
    // Access the resolved value (array of emails)
    console.log(loaded_emails);

    // Access individual email objects
    if (loaded_emails.length > 0) {
      console.log("First email:");
      console.log(loaded_emails[0]);
      loaded_emails.forEach(append_email);
    }
  }).catch(error => {
    console.error("An error occurred:", error);
  });
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