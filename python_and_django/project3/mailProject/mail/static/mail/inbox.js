
document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));

  document.querySelector('#compose').addEventListener('click', compose_email);

  // Later created elements: This cannot contain class name, because it does not exist the page (DOM) load!
  document.getElementById('emails-view')
      .addEventListener('click', (event) => load_email_detail(event));

  // By default, load the inbox
  load_mailbox('inbox');
});

function array_to_string(array_to_convert)
{
  return array_to_convert.toString();
}

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

function load_email_detail(event)
{
  event.preventDefault();

  const target_link = event.target.closest('.email-link');
  console.log("target_link:");
  console.log(target_link);
  const email_id = target_link.href.split('/emails/')[1];
  console.log('email_id:');
  console.log(email_id);
  const email_detail = fetch_email_detail(email_id);

  const emails_view = document.querySelector('#emails-view');

  email_detail.then(loaded_email => {
    // Access the resolved value (array of emails)

    // Access individual email objects
    //
    if (!(Object.keys(loaded_email).length === 0)) {
      // loaded_email.forEach(loaded_email);
      console.log("E-mail loaded succesfully.");
      console.log(loaded_email);

      create_email_detail(loaded_email);
    }
  }).catch(error => {
    // NOTICE: We can send also a console.error to the console
    console.error("An error occurred:", error);
  });

}

function removeChildElements(element)
{
  console.log("Removed element:");
  console.log(element);
  element.remove();
}

function create_email_detail(email)
{
  function create_email_header_info_item(info_type, info_text)
  {
    const email_header_info = document.createElement('div');
    const email_header_info_type = document.createElement('span');

    email_header_info.innerText = `${info_text}`;
    email_header_info_type.innerText = `${info_type}: `;
    email_header_info_type.className = 'email-info-label';

    email_header_info.appendChild(email_header_info_type);

    return email_header_info;
  }

  const from_email_header_info = create_email_header_info_item('From', email.sender);
  const recipient_string = array_to_string(email.recipients);
  const to_email_header_info = create_email_header_info_item('To', recipient_string);
  const subject_email_header_info = create_email_header_info_item('Subject', email.subject);
  const timestamp_email_header_info = create_email_header_info_item('Timestamp', email.timestamp);

  const reply_button = document.createElement('button');
  reply_button.innerText = 'Reply';

  const email_view = document.querySelector('#emails-view');

  // clearing the email_view
  email_view.replaceChildren();

  const email_text_element = document.createElement('div');
  email_text_element.innerText = email.body;

  const separating_line = document.createElement('hr');

  email_view.appendChild(from_email_header_info);
  email_view.appendChild(to_email_header_info);
  email_view.appendChild(subject_email_header_info);
  email_view.appendChild(timestamp_email_header_info);
  email_view.appendChild(separating_line);
  email_view.appendChild(email_text_element);

}

function fetch_email_detail(email_id)
{
  return fetch(`emails/${email_id}`)
      .then(response => response.json())
      .then(email => {
        console.log(email);
        return email;
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

function display_email_detail(email_from)
{
  document.querySelector('h3').innerText = `E-mail from: ${email_from}`;

}