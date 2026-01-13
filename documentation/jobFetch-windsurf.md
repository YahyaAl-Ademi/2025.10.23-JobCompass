# Job Fetch Flow Diagram

This document illustrates the complete flow from when a user presses the "Search" button until results are displayed on the "Open Positions" page.

## Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant SearchInput as SearchInput Component
    participant JobsContext as JobsContext (React Context)
    participant useFetch as useFetch Hook
    participant API as API Layer (/api)
    participant JobRouter as Job Router (/jobs)
    participant JobController as Job Controller (jobData.js)
    participant JobSearch as Job Search Service
    participant TravelRouter as Travel Router (/travel)
    participant TravelController as Travel Controller
    participant GoogleMaps as Google Maps API
    participant OpenPositions as OpenPositions Component

    User->>SearchInput: Enters job title and clicks "Search"
    SearchInput->>SearchInput: validateJobInput()
    SearchInput->>JobsContext: setAllJobs([]) - Clear previous results
    SearchInput->>JobsContext: setSearchTerm(inputValue)
    SearchInput->>JobsContext: fetchJobWordsBySearchWords(searchTerm)
    SearchInput->>User: Navigate to /jobs page

    JobsContext->>useFetch: performJobFetch() with POST /jobs/search
    useFetch->>API: POST /api/jobs/search
    API->>JobRouter: Route to /jobs/search
    JobRouter->>JobController: searchJobs(req, res)

    JobController->>JobController: Parse search_terms from request body
    JobController->>JobController: Split search_terms into searchWords array
    JobController->>JobSearch: Concurrent fetch for each searchWord

    alt Real Search Mode (isSearchReal = true)
        JobSearch->>JobSearch: realJobSearch() for each word
        JobSearch->>JobSearch: LinkedIn API calls (with rate limiting)
    else Fake Search Mode (isSearchReal = false)
        JobSearch->>JobSearch: fakeJobSearch() from JobsDataset.json
    end

    JobSearch-->>JobController: Return job arrays for each search word
    JobController->>JobController: Aggregate and deduplicate jobs by ID
    JobController->>JobController: processJobPost() for each job
    JobController-->>JobRouter: { success: true, result: aggregatedJobs }
    JobRouter-->>API: 200 OK with job results
    API-->>useFetch: JSON response with jobs
    useFetch-->>JobsContext: handleJobFetchResults(data)

    JobsContext->>JobsContext: setAllJobs(data.result)
    JobsContext->>JobsContext: fetchBatchTravelDetails(jobsArray)

    JobsContext->>useFetch: performTravelFetch() with POST /travel/batch
    useFetch->>API: POST /api/travel/batch
    API->>TravelRouter: Route to /travel/batch
    TravelRouter->>TravelController: calculateBatchTravelTime(req, res)

    TravelController->>TravelController: Extract homeAddress and workCities
    TravelController->>TravelController: Filter same-city jobs (travel_time = 0)

    par Parallel Google Maps API Calls
        TravelController->>GoogleMaps: getTransitRouteSummary() for each city
        GoogleMaps-->>TravelController: travel_time and least_transfers
    end

    TravelController->>TravelController: Aggregate travel results
    TravelController-->>TravelRouter: { success: true, result: { travelDetails } }
    TravelRouter-->>API: 200 OK with travel data
    API-->>useFetch: JSON response with travel details
    useFetch-->>JobsContext: handleTravelFetchResults(data)

    JobsContext->>JobsContext: setTravelDetails(detailsMap)
    JobsContext->>JobsContext: getJobsWithTravel() - Merge jobs with travel data
    JobsContext-->>OpenPositions: Updated allJobs with travel info

    OpenPositions->>OpenPositions: Display loading state (isJobsLoading)
    OpenPositions->>OpenPositions: Filter and sort jobs
    OpenPositions->>OpenPositions: Paginate results
    OpenPositions->>User: Display job cards with travel times
```

## Component Details

### Frontend Components

1. **SearchInput Component** (`client/src/components/SearchInput/SearchInput.jsx`)

   - Handles user input validation
   - Triggers the search process
   - Navigates to results page

2. **JobsContext** (`client/src/context/JobsContext.jsx`)

   - Manages global job state
   - Coordinates job and travel data fetching
   - Provides data to consuming components

3. **useFetch Hook** (`client/src/hooks/useFetch.js`)

   - Generic HTTP client for API communication
   - Handles loading states and error management
   - Supports request cancellation

4. **OpenPositions Component** (`client/src/pages/openPositions/openPositions.jsx`)
   - Displays job search results
   - Handles filtering, sorting, and pagination
   - Shows loading and error states

### Backend Components

1. **Job Router** (`server/src/routes/job.js`)

   - Express router for job-related endpoints
   - Routes `/jobs/search` to job controller

2. **Job Controller** (`server/src/controllers/jobData.js`)

   - Main business logic for job search
   - Coordinates between real and fake search services
   - Aggregates and deduplicates results

3. **Job Search Services**

   - **realJobSearch.js**: LinkedIn API integration with rate limiting
   - **fakeJobSearch.js**: Local dataset search for development

4. **Travel Router** (`server/src/routes/travel.js`)

   - Express router for travel-related endpoints
   - Routes `/travel/batch` to travel controller

5. **Travel Controller** (`server/src/controllers/travelController.js`)

   - Calculates travel times for multiple job locations
   - Optimizes same-city vs. external city calculations
   - Manages concurrent Google Maps API calls

6. **Google Maps Service** (`server/src/services/googleMapsApi.js`)
   - External API integration for transit directions
   - Calculates travel time and transfer counts
   - Handles API key management

## Data Flow

1. **Search Request**: User input → validation → API call
2. **Job Fetch**: API → job controller → search service → job aggregation
3. **Travel Calculation**: Job locations → travel controller → Google Maps API → travel details
4. **Result Display**: Merged job+travel data → UI rendering with filtering/sorting

## Key Features

- **Concurrent Processing**: Multiple search words and travel calculations run in parallel
- **Rate Limiting**: LinkedIn API calls are staggered to avoid rate limits
- **Smart Travel**: Same-city jobs get zero travel time without API calls
- **Error Handling**: Comprehensive error handling at each layer
- **Loading States**: UI shows appropriate loading indicators during fetch operations
- **Data Deduplication**: Jobs are deduplicated by ID across multiple search terms

## Environment Variables

- `X_RAPIDAPI_KEY`: LinkedIn API key for real job search
- `GOOGLE_MAPS_API_KEY`: Google Maps API key for travel calculations
- `isSearchReal`: Flag to switch between real and fake job search modes
