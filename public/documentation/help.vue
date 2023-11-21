<script setup></script>

<template>
  <article id="a1" class="page sans">
    <header>
      <h1 class="page-title">Lob Utility Kit</h1>
    </header>
    <div id="d0" class="page-body">
      <p id="d0p0">
        A quick how-to guide for the Lob Utility Kit desktop application.
      </p>
      <details open="">
        <summary>What it can do:</summary>
        <div id="d0d0" class="indented">
          <ul class="bulleted-list">
            <li>
              Assist with <a href="#bulk-cancel">bulk cancellation</a> of mailpieces, either with a
              premade list or by querying in-app
            </li>
            <li>
              Assist with <a href="#bulk-send">bulk sending</a> of mailpieces, either with HTML
              templates or local file uploads, with a user-provided audience
              file
            </li>
            <li>
              <a href="#export-data">Export data</a> on a set of mailpieces which meet certain criteria
              (e.g. made before 10/1/23)
            </li>
          </ul>
        </div>
      </details>
      <h2 id="bulk-cancel">Bulk Cancel Mailpieces</h2>
      <p>
        Bulk cancellation can be performed via API call, provided that a
        pre-existing script has been written. Here is that script, no coding
        necessary!
      </p>
      <h3>1. Select your active Environment</h3>
      <p>
        Where can we find the mailpieces that need to be cancelled? If only 1
        API key exists <a href="#settings">within the application</a>, this environment will be used
        by default.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled.png" />
      </figure>
      <h3>2. Select your input method</h3>
      <p>
        There are three ways that we can gather IDs for cancellation:
        searching, uploading a list, and pasting (or typing) a list. CSV
        uploads and pasted IDs <strong>do not</strong> need to be unique
        mailpiece types (i.e. these lists can contain a mixture of checks,
        postcards, and letters). However, searching can only be done on one
        mailpiece type at a time.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%201.png" />
      </figure>
      <h4>Search for IDs:</h4>
      <p>
        Follow the prompts to select the mailpiece type that needs to be
        cancelled. Metadata filtration can help to isolate a specific batch,
        customer, etc., but is not required. For example, if you select
        letters and do not have metadata to filter, this path will prompt you
        to cancel all letters that are still within your account's
        cancellation window.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%202.png" />
      </figure>
      <h4>Upload CSV:</h4>
      <p>
        This option will most likely be helpful if you already have a CSV
        export handy. If you don't, but don't want to use the search option
        here, take a quick stop over to “Export Data” to obtain the necessary
        export.
      </p>
      <p>
        A CSV upload will have either one column of only IDs (with or without
        a header row) or multiple columns of information, one of which is the
        ID column, with a header required. If a header is being used, please
        select the “Check if using headers” box!
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%203.png" />
      </figure>
      <h4>Paste IDs:</h4>
      <p>
        If you only need to cancel a few IDs, this will likely be the easiest
        path! Input the IDs with commas and/or spaces between each ID, then
        click “Submit.”
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%204.png" />
      </figure>
      <h3>3. Confirm ID list and request cancellation</h3>
      <p>
        After searching, uploading, or pasting your list, the application will
        attempt to parse the results into individual mailpiece IDs. Once you
        confirm that these are the IDs you would like to cancel, click “cancel
        all” to proceed.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%205.png" />
      </figure>
      <h3>4. Wait until done</h3>
      <p>
        Cancellation attempts will run on every ID in the list. If the attempt
        ultimately fails, you will see an aggregate of error codes (e.g. 422
        errors as the mailpiece is outside the cancellation window) and will
        have the option to export failures. The failure export will contain a
        list of all non-cancelled IDs.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%206.png" />
      </figure>
      <h2 id="bulk-send">Bulk Send Mailpieces</h2>
      <h4>1. Select your active Environment</h4>
      <p>
        Would you like to make these pieces in the Live environment or the
        Test environment? If only a Test API key <a href="#settings">exists within the
          application</a>, the Test environment will be used by default. If the only
        existing key is a Live API key, you will get an error message, as the
        Test environment is required for use with bulk sends.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled.png" />
      </figure>
      <h3>2. Select the type of mail you would like to send</h3>
      <p>
        You can bulk send one mailpiece type at a time. If you would like to
        bulk send multiple types of mail (e.g. letters and postcards), you
        will need to make multiple distinct bulk send batches.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%207.png" />
      </figure>
      <h3>3. Input your return address (if needed)</h3>
      <p>
        Most mailpieces require a return address, with the exception of
        domestic (in-US) postcards and self-mailers. If a return address is
        being used, it can be imported from a pre-existing address by pasting
        in the address ID (adr_abcdef1234567890). Otherwise, click “use new
        address” to create your return address, or uncheck “use return
        address” and click continue to bypass this step.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%208.png" />
      </figure>
      <p>
        Fill in the required information, then click “Save Address” to
        continue. Either a Name or Company parameter is required in this step,
        and it is not necessary to use a ZIP+4.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%209.png" />
      </figure>
      <h3>4. Select mailpiece-specific settings</h3>
      <p>
        This will differ depending on which mailpiece type is being used. The
        only required piece of information will be the use type, either
        marketing or operational. This is required regardless of whether there
        is an account-wide use type; all other settings will match their API
        requirements and will use the default values unless indicated
        otherwise.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%2010.png" />
      </figure>
      <h3>5. Upload creative files</h3>
      <p>
        Your creative can be a PDF file, an HTML template, inline HTML, or a
        URL to a publicly-accessible remote resource. If you are not uploading
        a file, use the checkbox to reveal the input box where you can place
        your template ID, inline HTML, or URL.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%2011.png" />
      </figure>
      <h3>6. Upload and map your audience file</h3>
      <p>
        The application will attempt to automatically map as many columns as
        possible, which it does by locating exact matches.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%2012.png" />
      </figure>
      <p>
        If you would like to customize idempotency, you can select a unique
        identifier to ensure that you are generating one mailpiece per
        intended recipient by mapping the relevant identifier to the “unique
        identifier (for idempotency)” optional field in this step. If you
        would like to learn more about idempotency, visit our Help Center
        <a
          href="https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings#idempotent-requests-12">here</a>.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%2013.png" />
      </figure>
      <p>
        You can additionally utilize user-specific metadata and merge
        variables via nested JSON objects. If you are utilizing an HTML
        template, you will also be able to map each merge variable to a column
        in this step (and the tool will attempt to find direct matches for
        you).
      </p>
      <h3>7. Apply batch-wide metadata values</h3>
      <p>
        Each bulk send will have a non-removable metadata pair called
        “bulk_batch_id” where the value is the Unix timestamp at which the
        bulk send process begins. This will help to quickly identify batches
        for data exports, attribution, and cancellation (if required). If
        other batch-wide metadata tags are desired, add them here. Click
        “Save” after filling in the key and value pair to add it to the
        metadata list, or click “Clear” to remove all optional tags. Once
        done, click “Continue.”
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%2014.png" />
      </figure>
      <h3>8. Test a mailpiece</h3>
      <p>
        Click “test” to obtain a PDF proof of what an example mailpiece looks
        like. This will utilize the first row of the audience file to generate
        a test piece (which we can recognize by the return address for “TEST
        PIECE”). Review this piece to ensure that it is produced exactly as
        desired, then click “send all” to move forward with the bulk send.
      </p>
      <h3>9. Confirm, send, done!</h3>
      <p>
        The next screen will show how many recipients are in the audience list
        by way of a confirmation button: Attempt # sends. Click this button to
        begin attempting to send each piece in the campaign.
      </p>
      <p>
        Once the batch is done, you will see how many pieces you successfully
        sent as well as how many pieces failed to send. You can also export
        relevant data on both successes and failures by clicking the relevant
        “export” buttons.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%2015.png" />
      </figure>
      <figure class="block-color-gray_background callout">
        <div><span class="icon">⚠️</span></div>
        <div>
          It is highly recommended to export created pieces in the event that
          the batch needs to be cancelled.
        </div>
      </figure>
      <h2 id="export-data">Export Mailpiece Data</h2>
      <h4>1. Select your active Environment</h4>
      <p>
        Where can we find the mailpieces? If only 1 API key <a href="#settings">exists within the
          application</a>, this environment will be used by default.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled.png" />
      </figure>
      <h3>2. Select the type of mail you would like data on</h3>
      <p>
        You can export data one mailpiece type at a time. If you would like to
        export data for multiple types of mail (e.g. letters and postcards),
        you will need to make multiple distinct exports.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%207.png" />
      </figure>
      <h3>3. Filter by send date</h3>
      <p>
        The send date is when the cancellation window will expire on a
        mailpiece, rather than when it was sent via API. If you would like to
        find a letter sent at 1pm on 10/1, but your account has a 24 hour
        cancellation window, your send_date would be 1pm on 10/2. You can use
        a begin date, end date, both, or neither.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%2016.png" />
      </figure>
      <h3>4. Filter by metadata</h3>
      <p>
        It is always recommended to use metadata in your sends so that you can
        find the most accurate data possible. If you have metadata you're
        targetting, input each key-value pair here. If you do not, or have
        finished adding your metadata, press “continue.”
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%2017.png" />
      </figure>
      <h3>5. Search and wait</h3>
      <p>
        Depending on how many mailpieces match the requested search, this step
        can take quite some time. Once the search has completed, it will
        automatically prompt a download (the default file name is
        <code>data_export.csv</code>) of the requested information. From here,
        the export is complete, and you can click “Start Over” in the lower
        right corner to request another export.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%2018.png" />
      </figure>
      <h2 id="settings">Settings</h2>
      <figure class="block-color-gray_background callout">
        <div><span class="icon">💡</span></div>
        <div>
          In order to utilize the Lob Utility Kit, either a Test API key or a
          Live API key is required. Due to the need for generating a test
          mailpiece, a Test API key is <strong>always</strong> required to
          send bulk mail with the Lob Utility Kit application.
        </div>
      </figure>
      <p>
        You can find your API keys in your account settings under the API Keys
        tab (<a href="https://dashboard.lob.com/settings/api-keys" target="_blank">here</a>).
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%2019.png" />
      </figure>
      <p>
        Input the API key in each relevant box, then click “save” to store the
        keys within the application. If you have keys stored within the
        application already, they will partially appear below the input boxes
        to allow you to confirm that the correct key is being used in each
        field.
      </p>
      <figure class="image">
        <img src="docs_images/Untitled%2020.png" />
      </figure>
      <p>
        If you do not have API keys saved, other pages will not function
        appropriately. If an inactive API key is used (e.g. the Live API key
        is deactivated due to missing payment information or account
        suspension), the application will act as though the API key is
        missing.
      </p>
    </div>
  </article>
</template>

<style scoped>
* {
  box-sizing: border-box;
  -webkit-print-color-adjust: exct;
}

html,
body {
  margin: 15px;
  padding: 0 25px;
}

@media only screen {
  body {
    margin: 2em auto;
    max-width: 900px;
    color: rgb(55, 53, 47);
  }
}

body {
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji",
    "Segoe UI Symbol";
  line-height: 1.5;
}

a,
a.visited {
  color: inherit;
  text-decoration: underline;
}

h1,
h2,
h3 {
  letter-spacing: -0.01em;
  line-height: 1.2em;
  font-weight: 600;
  margin-bottom: 0;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 0.75em;
}

h1 {
  font-size: 1.875rem;
  margin-top: 1.875rem;
}

h2 {
  font-size: 1.5rem;
  margin-top: 1.5rem;
}

h3 {
  font-size: 1.25rem;
  margin-top: 1.25rem;
}

.callout {
  background: rgba(241, 241, 239, 1);
  border-radius: 3px;
  display: flex;
  font-size: 1.15rem;
  padding: 1rem;
  width: 575px;
}

figure {
  margin: 1.25em auto;
  page-break-inside: avoid;
}

.image {
  border: none;
  border-radius: 5px;
  margin: 1.5em 0;
  padding: 0;
  text-align: center;
}

.indented {
  padding-left: 1.5em;
}

img {
  width: 575px;
}

summary {
  font-size: 1.875em;
  font-weight: 600;
  line-height: 1.3;
  margin: 0;
}

ul {
  margin: 0;
  margin-block-start: 0.6em;
  margin-block-end: 0.6em;
  padding-inline-start: 1.7em;
}

li {
  list-style-type: disc;
  padding-left: 0.1em;
}
</style>
