# Google Books Search App

This is a simple web application that allows users to search for books using the Google Books API. The application displays the search results with pagination and provides additional information such as the total number of results, the most common author, the earliest publication date, the latest publication date, and the server response time.

## Features

- Search for books using the Google Books API
- Display search results with pagination
- Show additional information about the search results
- Responsive and accessible design

## Prerequisites

Before you begin, ensure you have the following installed on your machine:


- [Python 3.x](https://www.python.org/downloads/)
- [pip (Python package installer)](https://pip.pypa.io/en/stable/installation/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Clone the Repository

```bash
git clone https://github.com/your-username/google-books-search-app.git
cd google-books-search-app
```

### Set Up the Backend

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
    Replace placeholders in your `app.py` and `scripts.js` with your actual keys:
    - In `scripts.js`, replace with your LaunchDarkly client-side ID on line 16:
       ```
        const clientSideId = '<your-client-side-ID>';  // Replace with your actual client-side ID
        ```


    **Note:** You can find your LaunchDarkly keys as follows:
    - **LD_SDK_KEY**: Found in your [LaunchDarkly Project Settings](https://docs.launchdarkly.com/sdk/server-side/node-js#configuring-your-project-and-environment)
    - **LD_API_KEY**: Found in your [LaunchDarkly API Access Tokens](https://docs.launchdarkly.com/home/account-security/api-access-tokens)
    - **CLIENT_SIDE_ID**: Found in your [LaunchDarkly Client-side SDK Keys](https://docs.launchdarkly.com/sdk/client-side/javascript#configuring-your-project-and-environment)

4. **Set Environment Variables**:

    ```bash
    export LD_SDK_KEY=your_sdk_key
    export LD_API_KEY=your_ld_api_key
    export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/slack/webhook
    ```

5. **Run the Flask App**:

    ```bash
    python3 app.py
    ```

    The backend server will start on `http://127.0.0.1:5000`.

### Set Up the Frontend

1. **Serve the `index.html` via a Simple HTTP Server**:

    ```bash
    python3 -m http.server
    ```

    Then, navigate to `http://localhost:8000` in your web browser.

### Search for Books

1. **Enter a Search Query**:

    In the search input, type the name of a book, author, or any keyword you want to search for.

2. **Click Search**:

    Click the "Search" button or press Enter to start the search. The search results will be displayed with pagination controls.

3. **Navigate Through Pages**:

    Use the "Previous" and "Next" buttons to navigate through the pages of search results. Click on the page numbers to jump to a specific page.

### Setting Up LaunchDarkly

#### Flags

1. **Create a Feature Flag**:

    - Go to your LaunchDarkly dashboard.
    - Create a new feature flag with a boolean flag type.
    - Name the variations `True` and `False`.
    - The end result should look like this:

    ![LD_flags](https://github.com/nicolemichelle88/googlebooks_featureflags/assets/19213563/f2e8be41-c2d9-4a18-ad32-ffcd341289c4)

#### Segments

1. **Create a Segment**:

    - Go to your LaunchDarkly dashboard.
    - Create a new user segment and add the users who should be included. In this case,  I target anyone whose username ends in `3`.
    - The end result should look like this:

    ![LD_segments](https://github.com/nicolemichelle88/googlebooks_featureflags/assets/19213563/abca31a0-917c-4c89-a321-668f5409a177)

#### Metrics

1. **Set Up Metrics**:

    - Go to your LaunchDarkly dashboard.
    - Create a new metric to track the desired events. In this case, I'm tracking 
    - The end result should look like this:

    ![LD_metrics](https://github.com/nicolemichelle88/googlebooks_featureflags/assets/19213563/fe9e7b19-85ed-482e-b876-f2e53da1c0ca)

### Additional Notes

- Ensure that you are using Python 3 by using `python3` and `pip3` commands to avoid any confusion with Python 2.x.
- Make sure you install the required Python packages using the `requirements.txt` file to avoid missing dependencies.

```bash
pip3 install -r requirements.txt
```

By following these steps, you should be able to set up and run the Google Books Search App with feature flags using LaunchDarkly. If you encounter any issues or have any questions, feel free to reach out for support.
