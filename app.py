# Import necessary modules and classes from Flask, Flask-CORS, requests, collections, time, LaunchDarkly client, and os
from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
import requests
from collections import Counter
import time
import ldclient
from ldclient.config import Config
import os

# Initialize the Flask application with static file settings
app = Flask(__name__, static_url_path='', static_folder='static')
CORS(app)  # Enable Cross-Origin Resource Sharing (CORS) for the Flask app

# Set up LaunchDarkly client configuration using environment variable for SDK key
ldclient.set_config(Config(os.getenv('LD_SDK_KEY')))
ld_client = ldclient.get()  # Get the LaunchDarkly client instance

# Define constants for external API URLs
GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes"
SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')

# Function to format a list of authors into a comma-separated string
def format_authors(authors):
    return ', '.join(authors) if authors else 'Unknown Author'

# Function to process book data received from Google Books API
def process_books_data(items):
    books = []  # List to store processed book data
    all_authors = []  # List to collect all authors
    pub_dates = []  # List to collect all publication dates
    for item in items:
        volume_info = item.get('volumeInfo', {})  # Get the volume information for the book
        authors = volume_info.get('authors', [])  # Get the authors of the book
        title = volume_info.get('title', 'No Title')  # Get the title of the book
        description = volume_info.get('description', 'No description available.')  # Get the description of the book
        published_date = volume_info.get('publishedDate', 'Unknown Date')  # Get the publication date of the book

        all_authors.extend(authors)  # Add authors to the list of all authors
        if published_date != 'Unknown Date':
            pub_dates.append(published_date)  # Add the publication date to the list if it's not 'Unknown Date'

        books.append({
            'authors': format_authors(authors),  # Format authors into a comma-separated string
            'title': title,  # Add the title of the book
            'description': description,  # Add the description of the book
            'publishedDate': published_date  # Add the publication date of the book
        })

    # Find the most common author using the Counter class
    most_common_author = Counter(all_authors).most_common(1)
    most_common_author = most_common_author[0][0] if most_common_author else 'No Author'

    # Determine the earliest and latest publication dates
    earliest_pub_date = min(pub_dates, default='N/A')
    latest_pub_date = max(pub_dates, default='N/A')

    return books, most_common_author, earliest_pub_date, latest_pub_date

# Route to serve the main HTML file
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

# Route to serve the favicon
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'books.png')

# Route to handle search requests
@app.route('/search')
def search_books():
    query = request.args.get('q', '')  # Get the search query from request parameters

    if not query:
        return jsonify({'error': 'Query parameter is required'}), 400  # Return an error if no query is provided

    try:
        start_time = time.time()  # Record the start time for performance measurement
        response = requests.get(GOOGLE_BOOKS_API_URL, params={'q': query, 'startIndex': 0, 'maxResults': 10})  # Make a request to the Google Books API
        if response.status_code != 200:
            print(f"Failed to fetch data from Google Books API: {response.status_code}")
            return jsonify({'error': 'Failed to fetch data from Google Books API'}), 500  # Return an error if the API request fails

        data = response.json()  # Parse the response as JSON
        items = data.get('items', [])  # Get the list of items (books) from the response
        total_items = data.get('totalItems', 0)  # Get the total number of items from the response

        response_time = time.time() - start_time  # Calculate the response time
        books, most_common_author, earliest_pub_date, latest_pub_date = process_books_data(items)  # Process the book data

        return jsonify({
            'totalItems': total_items,  # Return the total number of items
            'books': books,  # Return the list of books
            'mostCommonAuthor': most_common_author,  # Return the most common author
            'earliestPubDate': earliest_pub_date,  # Return the earliest publication date
            'latestPubDate': latest_pub_date,  # Return the latest publication date
            'responseTime': response_time  # Return the response time
        })

    except requests.RequestException as re:
        print(f"Request error: {re}")
        return jsonify({'error': f'Failed to fetch data from Google Books API: {str(re)}'}), 500  # Return an error if there is a request exception
    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({'error': f'An error occurred while processing the request: {str(e)}'}), 500  # Return an error if there is a general exception

# Route to fetch paginated results
@app.route('/fetch_page')
def fetch_page():
    query = request.args.get('q', '')  # Get the search query from request parameters
    start_index = int(request.args.get('startIndex', 0))  # Get the start index from request parameters

    if not query:
        return jsonify({'error': 'Query parameter is required'}), 400  # Return an error if no query is provided

    try:
        print(f"Fetching page with startIndex={start_index}")
        response = requests.get(GOOGLE_BOOKS_API_URL, params={'q': query, 'startIndex': start_index, 'maxResults': 10})  # Make a request to the Google Books API
        if response.status_code != 200:
            print(f"Failed to fetch data from Google Books API: {response.status_code}")
            return jsonify({'error': 'Failed to fetch data from Google Books API'}), 500  # Return an error if the API request fails

        data = response.json()  # Parse the response as JSON
        items = data.get('items', [])  # Get the list of items (books) from the response
        books, _, _, _ = process_books_data(items)  # Process the book data

        return jsonify({
            'books': books  # Return the list of books
        })

    except requests.RequestException as re:
        print(f"Request error: {re}")
        return jsonify({'error': f'Failed to fetch data from Google Books API: {str(re)}'}), 500  # Return an error if there is a request exception
    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({'error': f'An error occurred while processing the request: {str(e)}'}), 500  # Return an error if there is a general exception

# Route to send a message to Slack
@app.route('/send_slack_message', methods=['POST'])
def send_slack_message():
    data = request.json  # Get the JSON data from the request
    message = data.get('text', 'No message provided')  # Get the message text from the JSON data

    try:
        response = requests.post(SLACK_WEBHOOK_URL, json={'text': message})  # Send a POST request to the Slack webhook URL
        if response.status_code != 200:
            return jsonify({'error': 'Failed to send Slack message'}), 500  # Return an error if the request fails
        return jsonify({'status': 'Message sent successfully'}), 200  # Return a success message if the request is successful
    except requests.RequestException as re:
        print(f"Request error: {re}")
        return jsonify({'error': f'Failed to send Slack message: {str(re)}'}), 500  # Return an error if there is a request exception
    except Exception as e:
        print(f"Error sending Slack message: {e}")
        return jsonify({'error': f'An error occurred while sending the Slack message: {str(e)}'}), 500  # Return an error if there is a general exception

# Route to toggle a feature flag in LaunchDarkly
@app.route('/toggle_last_button_flag', methods=['POST'])
def toggle_last_button_flag():
    try:
        data = request.json  # Get the JSON data from the request
        flag_value = data.get('value', False)  # Get the flag value from the JSON data

        # Assuming you have the LaunchDarkly API client set up
        url = f"https://app.launchdarkly.com/api/v2/flags/default/last-button"  # Define the URL for the LaunchDarkly API
        headers = {
            "Authorization": "api-d761bb3a-4bbf-437e-9cc8-a90609366e3b",  # Set the authorization header with the API key
            "Content-Type": "application/json"  # Set the content type to JSON
        }
        payload = {
            "patch": [
                {
                    "op": "replace",
                    "path": "/environments/test/on",
                    "value": flag_value  # Set the flag value in the payload
                }
            ]
        }

        response = requests.patch(url, headers=headers, json=payload)  # Send a PATCH request to the LaunchDarkly API
        if response.status_code != 200:
            return jsonify({'error': 'Failed to toggle feature flag'}), 500  # Return an error if the request fails

        return jsonify({'status': 'Feature flag toggled successfully'}), 200  # Return a success message if the request is successful
    except Exception as e:
        print(f"Error toggling feature flag: {e}")
        return jsonify({'error': f'An error occurred while toggling the feature flag: {str(e)}')}), 500  # Return an error if there is a general exception

# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True)  # Run the Flask application with debug mode enabled
