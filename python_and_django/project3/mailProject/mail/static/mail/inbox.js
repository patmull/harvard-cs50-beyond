
const SMALL_BUTTON = "btn btn-sm btn-outline-primary";

document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));

  document.querySelector('#compose').addEventListener('click', compose_email);

  // Later created elements: This cannot contain class name, because it does not exist the page (DOM) load!
  document.getElementById('emails-view')
      .addEventListener('click', (event) => click_handler(event));

  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector('#compose-form').addEventListener('submit',
      (event) => send_email(event));
});

function click_handler(event)
{
  if(event.target.className.includes('archive-button'))
  {
    // archive_email
    console.log("Archiving e-mail...");
    archive_email(event);
  } else if(event.target.className.includes('make-non-archived-button')) {
    // make e-mail not archived
    console.log("Archiving e-mail...");
    archive_email(event, true);
  } else {
    // load_email_detail
    console.log("Loading e-mail detail...");
    load_email_detail(event);
  }
}

function send_email(event) {
  event.preventDefault();

  const recipients_value = document.querySelector('#compose-recipients').value;
  const subject_value = document.querySelector('#compose-subject').value;
  const body_value = document.querySelector('#compose-body').value;

  console.log("Send data by e-mail:");
  console.log(recipients_value);
  console.log(body_value);

  const new_email_request_data = JSON.stringify({
    'recipients': recipients_value,
    'subject': subject_value,
    'body': body_value
  });

  console.log("new_email_request_data:");
  console.log(new_email_request_data);

  fetch('/emails', {
    method: 'POST',
    body: new_email_request_data
  })
      .then(response => response.json())
      .then(result => {
        console.log("E-mail send result:");
        console.log(result);

        if (result.message === "Email sent successfully.")
        {
          console.log("Email sent successfully!");
          load_mailbox('sent',"Message sent successfully!");
        }
      });
}

function archive_email(event, unarchive=false)
{
  event.preventDefault();
  console.log("event.target.form.archived_email_id:");
  console.log(event.target.form.archived_email_id);
  const email_id = event.target.form.archived_email_id.value;
  console.log("Email id for archive:");
  console.log(email_id);

  if(unarchive === true)
  {
    put_email_action(email_id, 'unarchive');
    load_mailbox('inbox',"E-mail successfully removed from archived!");
  } else {
    put_email_action(email_id, 'archive');
    load_mailbox('inbox',"E-mail successfully archived!");
  }
}

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

function create_mailbox_items(new_div, email, archive_section=false)
{
  const archive_button_form = document.createElement('form');
  archive_button_form.method = 'PUT';
  archive_button_form.className = 'archive-mail-form';
  archive_button_form.className += " " + 'inline';
  const archive_input_button = document.createElement('input');
  archive_input_button.type = 'submit';

  if(!archive_section)
  {
    archive_input_button.value = "Archive";
    archive_input_button.className = 'archive-button';
  } else
  {
    archive_input_button.value = "Unarchive";
    archive_input_button.className = 'make-non-archived-button';
  }

  archive_input_button.className += " " + SMALL_BUTTON;
  archive_input_button.className += " " + "ml-2 float-right";

  const archive_input_id = document.createElement('input');
  archive_input_id.type = 'hidden';
  archive_input_id.className = 'current-email-id';
  archive_input_id.name = 'archived_email_id';
  archive_input_id.value = email.id;
  archive_button_form.appendChild(archive_input_button);
  archive_button_form.appendChild(archive_input_id);
  new_div.appendChild(archive_button_form);
}

function load_mailbox(mailbox, message="") {
  console.log(`Loading ${mailbox}...`);
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if(message.length > 0)
  {
    const new_message = document.createElement('div');
    new_message.className = "alert alert-success";
    new_message.innerText = message;
    document.querySelector('#emails-view').appendChild(new_message);
  }
  function append_email(email) {
      const new_email_link = document.createElement('a');
      const new_div = document.createElement('div');
      const div_link = document.createElement('div');
      const date_span = document.createElement('span');

      new_email_link.href = `/emails/${email.id}`;
      new_email_link.className = 'email-link';

      new_div.className = 'mail-list-item';

      if(mailbox === 'inbox')
      {
        if(!email.archived)
        {
          div_link.innerText = `${email.sender}: ${email.subject}`;
          // If e-mail is read
          if (email.read)
          {
            div_link.className += ' ' + 'mail-list-item-read';
            new_div.className += ' ' + 'mail-list-item-read';
          }
        }
        create_mailbox_items(new_div, email);
      } else if (mailbox === 'sent')
      {
        const email_recipients = email.recipients.toString();
        div_link.innerText = `${email_recipients}: ${email.subject}`;
        create_mailbox_items(new_div, email)
      } else if (mailbox === 'archive')
      {
        div_link.innerText = `${email.sender}: ${email.subject}`;
        create_mailbox_items(new_div, email, true);
      }
      else {
        console.error("This option for inbox is not valid.");
      }

      date_span.innerText = `${email.timestamp}`;
      date_span.className = 'right-align';

      div_link.appendChild(date_span);
      new_email_link.appendChild(div_link);

      new_div.appendChild(new_email_link);

      document.querySelector('#emails-view')
        .appendChild(new_div);
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
      console.error(error.toString());
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

  email_detail.then(loaded_email => {
    // Access the resolved value (array of emails)

    // Access individual email objects
    //
    if (!(Object.keys(loaded_email).length === 0)) {
      // loaded_email.forEach(loaded_email);
      console.log("E-mail loaded succesfully.");
      console.log(loaded_email);

      create_email_detail(loaded_email);

      // Send to API that e-mail was read
      put_email_action(email_id, 'read');
    }
  }).catch(error => {
    // NOTICE: We can send also a console.error to the console
    console.error(error.toString());
  });

}

function create_email_detail(email)
{
  const email_view = document.querySelector('#emails-view');
  function create_email_header_info_item(info_type, info_text)
  {
    const email_header_info = document.createElement('div');
    const email_header_info_type = document.createElement('span');

    email_header_info_type.innerText = `${info_type}: `;
    email_header_info_type.className = 'email-info-label';
    // Prepending:
    email_header_info.appendChild(email_header_info_type);
    // NOTICE: For the prepending, this order is crucial!!!
    email_header_info.appendChild(document.createTextNode(info_text))

    return email_header_info;
  }

  const from_email_header_info = create_email_header_info_item('From', email.sender);
  const recipient_string = array_to_string(email.recipients);
  const to_email_header_info = create_email_header_info_item('To', recipient_string);
  const subject_email_header_info = create_email_header_info_item('Subject', email.subject);
  const timestamp_email_header_info = create_email_header_info_item('Timestamp', email.timestamp);

  const reply_button = document.createElement('button');
  reply_button.innerText = 'Reply';
  reply_button.className = SMALL_BUTTON;

  // clearing the email_view
  email_view.replaceChildren();

  const email_text_element = document.createElement('div');
  email_text_element.innerText = email.body;

  const separating_line = document.createElement('hr');

  email_view.appendChild(from_email_header_info);
  email_view.appendChild(to_email_header_info);
  email_view.appendChild(subject_email_header_info);
  email_view.appendChild(timestamp_email_header_info);
  email_view.appendChild(reply_button);
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
  return fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
    console.log("emails:");
    console.log(emails);
      // ... do something else with emails ...
    return emails;
  });

}

function put_email_action(email_id, action)
{
  const request_body = {};
  if (action === 'read' || action === 'archive' || action === 'unarchive')
  {
    if(action === 'archive')
    {
      request_body['archived'] = true;
    } else if (action === 'unarchive') {
      request_body['archived'] = false;
    } else {
      request_body[action] = true;
    }

   fetch(`emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify(request_body)
  })
      .then(response => console.log(`Sent e-mail as ${action}: ${response.json()}`));
  } else {
    console.error("Option needs to be either 'read' or 'archive'");
  }
}
