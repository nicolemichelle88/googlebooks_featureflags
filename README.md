# Google Books Search App

This is a simple web application that allows users to search for books using the Google Books API. The application displays the search results with pagination and provides additional information such as the total number of results, the most common author, the earliest publication date, the latest publication date, and the server response time.

## Features

- Search for books using the Google Books API
- Display search results with pagination
- Show additional information about the search results
- Responsive and accessible design

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Python 3.x
- pip (Python package installer)

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
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

2. **Install Flask and Requests**:

    ```bash
    pip install Flask requests flask-cors
    ```

3. **Run the Flask App**:

    ```bash
    python app.py
    ```

    The backend server will start on `http://127.0.0.1:5000`.

### Set Up the Frontend

1. **Open `index.html`**:

    Open the `index.html` file in your preferred web browser. You can also use a simple HTTP server to serve the file:

    ```bash
    python -m http.server
    ```

    Then, navigate to `http://localhost:8000` in your web browser.

### Search for Books

1. **Enter a Search Query**:

    In the search input, type the name of a book, author, or any keyword you want to search for.

2. **Click Search**:

    Click the "Search" button or press Enter to start the search. The search results will be displayed with pagination controls.

3. **Navigate Through Pages**:

    Use the "Previous" and "Next" buttons to navigate through the pages of search results. Click on the page numbers to jump to a specific page.
<br>
<br>
<br>
<br>
<br>
### Additional Information
<br>
<br>
1. Set up flags as following:
<img width="1162" alt="LD_flags" src="https://github.com/nicolemichelle88/googlebooks_featureflags/assets/19213563/f2e8be41-c2d9-4a18-ad32-ffcd341289c4">
<br>
<br>
<br>
<br>
<br>

2. Set up segments as following:
<img width="1166" alt="LD_segments" src="https://github.com/nicolemichelle88/googlebooks_featureflags/assets/19213563/abca31a0-917c-4c89-a321-668f5409a177">
<br>
<br>
<br>
<br>
<br>

3. Set up metrics:
<img width="1477" alt="LD_metrics" src="https://github.com/nicolemichelle88/googlebooks_featureflags/assets/19213563/fe9e7b19-85ed-482e-b876-f2e53da1c0ca">





