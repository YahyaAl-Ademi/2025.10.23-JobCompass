# Job Fetch Flow

This document illustrates the flow of data when a user searches for jobs, from the initial button click to the display of results.

## Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as SearchInput (Frontend)
    participant Context as JobsContext (Frontend)
    participant Router as Express Router (Backend)
    participant Controller as JobController (Backend)
    participant Service as JobSearch Service (Backend)
    participant Processor as ProcessJobPost Util (Backend)
    participant ResultsPage as OpenPositions Page (Frontend)

    Note over User, UI: User is on the Search Page or Home Page

    User->>UI: Enters keywords and clicks "Search"
    UI->>Context: Call fetchJobWordsBySearchWords(searchWords)

    Note over Context: Prepares POST request
    Context->>Router: POST /api/jobs/search body: { search_terms }

    Router->>Controller: Routes to searchJobs(req, res)

    activate Controller
    Controller->>Controller: Splits search_terms into individual words

    loop For each word in search terms
        alt isSearchReal maps to true
            Controller->>Service: Call realJobSearch(word)
        else isSearchReal is false
            Controller->>Service: Call fakeJobSearch(word)
        end
        Service-->>Controller: Returns list of raw job objects
    end

    Controller->>Controller: Aggregates results from all words

    loop For each unique job
        Controller->>Processor: processJobPost(rawJob)
        Note right of Processor: Normalizes structure (seniority, location, etc.)
        Processor-->>Controller: Returns processed job object
    end

    Controller-->>Router: Returns JSON { success: true, result: aggregatedJobs }
    deactivate Controller

    Router-->>Context: Receives API response

    activate Context
    Context->>Context: setAllJobs(result)
    Context->>Context: fetchBatchTravelDetails(result)
    Note right of Context: Triggers separate async flow for travel times
    deactivate Context

    UI->>ResultsPage: Navigate to /jobs

    activate ResultsPage
    ResultsPage->>Context: Reads allJobs from context
    ResultsPage->>User: Renders JobCards with job details
    deactivate ResultsPage
```

## Detailed Explanation

1.  **User Interaction**: The user enters search terms in the `SearchInput` component and clicks the "Search" button.
2.  **State Initiation**: The `handleSearch` function in `SearchInput` cleans the input and calls `fetchJobWordsBySearchWords` from the `JobsContext`.
3.  **API Request**: `JobsContext` sends a `POST` request to the backend endpoint `/api/jobs/search` with the search terms.
4.  **Backend Routing**: The Express app receives the request and routes it via `server/src/routes/job.js` to the `searchJobs` controller in `server/src/controllers/jobData.js`.
5.  **Data Retrieval**:
    - The controller splits the search query into words.
    - It fetches job data for each word using either `realJobSearch` (scraping/API) or `fakeJobSearch` (local JSON dataset), depending on the `isSearchReal` flag.
6.  **Data Processing**: Raw job data is passed through `processJobPost`, which normalizes fields like seniority, employment type, and location to ensure consistency.
7.  **Response**: The processed list of jobs is sent back to the client as a JSON response.
8.  **State Update**: `JobsContext` receives the response, updates the `allJobs` state, and initiates a secondary fetch for travel details (`fetchBatchTravelDetails`).
9.  **Display**: The user is navigated to the `/jobs` route, where the `OpenPositions` component renders the job list using data from the `JobsContext`.
