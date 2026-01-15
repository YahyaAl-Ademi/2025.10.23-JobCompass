```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor':'#1a1a1a', 'primaryBorderColor':'#4a9eff', 'lineColor':'#4a9eff', 'tertiaryColor':'#2a2a2a', 'tertiaryBorderColor':'#4a9eff', 'tertiaryTextColor':'#ffffff'}, 'sequence': {'actorMargin': 50}}}%%
sequenceDiagram
    autonumber
    participant JobsContext as JobsContext Provider<br/>`JobsContext.jsx`
    participant useFetch_1 as useFetch Hook<br/>(jobs search)<br/>`useFetch.js`
    participant FrontendNetwork as HTTP Network Layer
    participant ExpressApp as Express Server<br/>`app.js`
    participant JobRouter as Job Routes<br/>`job.js`
    participant JobController as Job Search Controller<br/>`jobData.js`<br/>`searchJobs()`
    participant FakeJobSearch as Fake Job Search Provider<br/>`fakeJobSearch.js`
    participant ProcessJobPost as Job Normalizer<br/>`processJobPost.js`

    rect rgb(60, 120, 130)
    Note over JobsContext,ProcessJobPost: Phase 4: Job Search Fetch
    JobsContext->>JobsContext: `fetchJobWordsBySearchWords()` executes<br/>inside JobsProvider
    JobsContext->>useFetch_1: Call `performFetch()` with<br/>method: POST<br/>body: { search_terms: "<user input>" }

    useFetch_1->>useFetch_1: Set `isLoading = true`<br/>(stored in JobsContext as `isJobsLoading`)
    useFetch_1->>useFetch_1: Set `error = null`
    useFetch_1->>FrontendNetwork: POST /api/jobs/search

    FrontendNetwork->>ExpressApp: HTTP POST request arrives
    ExpressApp->>JobRouter: Route `/jobs/search`

    JobRouter->>JobController: Invoke `searchJobs(req, res)`

    JobController->>JobController: Validate `search_terms` exists<br/>& is non-empty string
    
    alt Invalid search_terms
        JobController->>ExpressApp: Return 400 error<br/>{ success: false,<br/>  msg: "You need to provide 'search_terms'..." }
        ExpressApp->>FrontendNetwork: HTTP 400 response
        FrontendNetwork->>useFetch_1: Receive error response
        useFetch_1->>useFetch_1: Set `error = msg`<br/>Set `isLoading = false`
        useFetch_1->>JobsContext: Store error in `jobFetchError`
        Note over JobsContext: Error will be displayed<br/>in OpenPositions (Phase 6)
    else Valid search_terms
        JobController->>JobController: Split search terms into words:<br/>`searchWords = search_terms.split(/[\\s\\-.'/]+/)`

        JobController->>FakeJobSearch: For each search word,<br/>call `fakeJobSearch(jobWord)`<br/>(or `realJobSearch` if enabled)

        FakeJobSearch->>FakeJobSearch: Load `JobsDataset.json`
        FakeJobSearch->>FakeJobSearch: Filter jobs where<br/>`job.title.toLowerCase()`<br/>includes `jobWord.toLowerCase()`
        FakeJobSearch-->>JobController: Return filtered job array

        JobController->>JobController: Aggregate results from all words<br/>Remove duplicates using Set of job IDs<br/>Maintain insertion order

        JobController->>ProcessJobPost: For each aggregated job,<br/>call `processJobPost(job)`

        ProcessJobPost->>ProcessJobPost: Normalize job fields:<br/>- Parse & clean description<br/>- Extract & format location<br/>- Standardize salary info<br/>- Format dates & URLs<br/>- Add computed fields
        ProcessJobPost-->>JobController: Return normalized job object

        JobController->>ExpressApp: Return response with<br/>aggregated, normalized jobs

        ExpressApp->>FrontendNetwork: HTTP 200<br/>{ success: true,<br/>  result: [job1, job2, ...] }

        FrontendNetwork->>useFetch_1: Response received
        useFetch_1->>useFetch_1: Parse JSON response
        useFetch_1->>useFetch_1: Set `isLoading = false`
        useFetch_1->>JobsContext: Call `handleJobFetchResults(data)`<br/>(callback function)
    end

    alt Server/Network error occurs
        FrontendNetwork-->>useFetch_1: Network error or 500 response
        useFetch_1->>useFetch_1: Set `error = error.message`<br/>Set `isLoading = false`
        useFetch_1->>JobsContext: Store error in `jobFetchError`
        Note over JobsContext: Error will be displayed<br/>in OpenPositions (Phase 6)
    end

    end
```
