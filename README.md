# Google Books Search App

This is a simple web application that allows users to search for books using the Google Books API. The application displays the search results with pagination and provides additional information such as the total number of results, the most common author, the earliest publication date, the latest publication date, and the server response time.

*We'll use the app and some of its features to explore the value of the **LaunchDarkly** platform.*

## I. Features

- Search for books using the Google Books API
- Display search results with pagination
- Show additional information about the search results
- Responsive and accessible design

## II. Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Python 3.x](https://www.python.org/downloads/)
- [pip (Python package installer)](https://pip.pypa.io/en/stable/installation/)

## III. Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Step 1: Clone the Repository

```bash
git clone git@github.com:nicolemichelle88/googlebooks_featureflags.git
cd googlebooks_featureflags
```

### Step 2: Set Up the Backend

1. **Create a Virtual Environment** (optional but recommended):

    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

2. **Install the Required Packages**:

    ```bash
    pip3 install -r requirements.txt
    ```

3. **Configure LaunchDarkly Keys in Your Code**:

    Replace placeholders in your `app.py` and `scripts.js` with your actual keys:
    - In `scripts.js`, replace with your LaunchDarkly client-side ID on `line 16`:
      ```javascript
      const clientSideId = '<your-client-side-ID>';  // Replace with your actual client-side ID
      ```
    - **CLIENT_SIDE_ID**: Found in your [LaunchDarkly Client-side SDK Keys](https://docs.launchdarkly.com/sdk/client-side/javascript#configuring-your-project-and-environment)

4. **Set Environment Variables**:

    ```bash
    export LD_SDK_KEY=your_sdk_key
    export LD_API_KEY=your_ld_api_key
    export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/slack/webhook
    ```

    **Note:** You can find your LaunchDarkly keys as follows:
    - **LD_SDK_KEY**: Found in your [LaunchDarkly Project Settings](https://docs.launchdarkly.com/sdk/server-side/node-js#configuring-your-project-and-environment)
    - **LD_API_KEY**: Found in your [LaunchDarkly API Access Tokens](https://docs.launchdarkly.com/home/account-security/api-access-tokens)
    - **SLACK_WEBHOOK_URL**: See **Copy the Webhook URL** in the below section on [**Setting Up Slack**] (https://github.com/nicolemichelle88/googlebooks_featureflags/tree/main?tab=readme-ov-file#v-setting-up-slack) 

5. **Run the Flask App**:

    ```bash
    python3 app.py
    ```

    The backend server will start on `http://127.0.0.1:5000`.

### Step 3: Set Up the Frontend

1. **Serve the `index.html` via a Simple HTTP Server**:

    ```bash
    python3 -m http.server
    ```

    Then, navigate to `http://localhost:8000` in your web browser.

### Step 4: Search for Books

1. **Enter a Search Query**:

    In the search input, type the name of a book, author, or any keyword you want to search for.

2. **Click Search**:

    Click the "Search" button or press Enter to start the search. The search results will be displayed with pagination controls.

3. **Navigate Through Pages**:

    Use the "Previous" and "Next" buttons to navigate through the pages of search results. Click on the page numbers to jump to a specific page.

## IV. Setting Up LaunchDarkly

### 1. Flags

**Create a Feature Flag**:

- Go to your LaunchDarkly dashboard.
- Create a two new feature flags with a `boolean` flag type: `first-button` and `last-button`.
- Name the variations `True` and `False`.
- The end result should look like this:
    
![LD_flags](https://github.com/nicolemichelle88/googlebooks_featureflags/assets/19213563/f2e8be41-c2d9-4a18-ad32-ffcd341289c4)

### 2. Segments

 **Create a Segment**:

- Go to your LaunchDarkly dashboard.
- Create a new user segment and add the users who should be included. In this case, target anyone whose username ends in `3`.
- The end result should look like this:

![LD_segments](https://github.com/nicolemichelle88/googlebooks_featureflags/assets/19213563/abca31a0-917c-4c89-a321-668f5409a177)

### 3. Rules
**Create Rules for Individual Targeting**
- Navigate inside the Dashboard for the `last-button` Flag
- Click `Add Rule` and select `Target Individuals`
- Set the rule to serve `true` to `user1` and `false` to `user2`
![individualtargeting](https://github.com/nicolemichelle88/googlebooks_featureflags/assets/19213563/f40a806a-413d-4141-809a-f025bedaf362)

**Create Rules for Rule-Based Targeting**
-In the same Dashboard for the `last-button` Flag, click `Add Rule` again, but this time choose `Target Segments`
- Set the rule "If not in `beta` group, flag=`false`" by choosing the `is not in` operator and the `beta` segment you previously created. Serve rollout as `false`.
- The end results should look like this:
![notinbetafalse](https://github.com/nicolemichelle88/googlebooks_featureflags/assets/19213563/942e0091-6c9e-4112-8ea5-d3f8cf23a53c)

![rulebasedtargeting](https://github.com/nicolemichelle88/googlebooks_featureflags/assets/19213563/be3739e8-a897-44fa-86a2-38f7805d8b79)

### 4. Metrics

**Set Up Metrics**:

- Go to your LaunchDarkly dashboard.
- Create a new metric to track the desired events. In this example, we're seeting up the metric `fetch-page-error` as in the screenshot below. Ensure you've got `fetch-page-error` as the `Event Key` and `Lower than Baseline` as the `Success Criteria`.
- The end result should look like this before you click `Create Metric`:
    
![fetchpageerror](https://github.com/nicolemichelle88/googlebooks_featureflags/assets/19213563/cc6e465e-a2c4-42dc-bbc8-017c708a881b)

## V. Setting Up Slack

### Step 1: Create a Slack App

#### Go to the Slack API

Navigate to the Slack API page at [https://api.slack.com/](https://api.slack.com/).

#### Create a new Slack App

1. Click on "Create New App."
2. Select "From scratch."
3. Provide a name for your app and choose the Slack workspace where you want to install the app.
4. Click "Create App."

### Step 2: Add Incoming Webhooks

#### Navigate to the Features section

In the sidebar, under "Features," click on "Incoming Webhooks."

#### Activate Incoming Webhooks

Toggle the switch to "Activate Incoming Webhooks."

#### Create a new webhook

1. Click on "Add New Webhook to Workspace."
2. Select a channel where the webhook will post messages and click "Allow."

#### Copy the Webhook URL

1. After allowing, you will be redirected back to the app settings page.
2. You will see your new webhook URL under "Webhook URLs for Your Workspace."
3. Copy this URL. It will be used in your Flask application to send messages to Slack.

## VI. Additional Notes

- Ensure that you are using Python 3 by using `python3` and `pip3` commands to avoid any confusion with Python 2.x.
- Make sure you install the required Python packages using the `requirements.txt` file to avoid missing dependencies.

```bash
pip3 install -r requirements.txt
```

By following these steps, you should be able to set up and run the Google Books Search App with feature flags using LaunchDarkly. If you encounter any issues or have any questions, feel free to reach out to me for support!
