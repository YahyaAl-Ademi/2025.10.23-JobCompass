```mermaid
flowchart TD
    A[User Input] --> B["<a href='#phase-1'>1.Initial Setup & Input Validation</a>"]
    B -->|Valid| C["<a href='#phase-2'>2.Context State Updates</a>"]
    B -->|Invalid| Z[Display Error]
    C --> D["<a href='#phase-3'>3.Navigation</a>"]
    D --> E["<a href='#phase-4'>4.Job Search Fetch</a>"]
    E --> F{Search Success?}
    F -->|Yes| G["<a href='#phase-5'>5.Travel Details Fetch</a>"]
    F -->|No| H[Display Search Error]
    G --> I{Travel Success?}
    I -->|Yes| J["<a href='#phase-6'>6.Display Results</a>"]
    I -->|No| K[Display Travel Error]
    J --> L[User Interaction]
    H --> L
    K --> L
    Z --> L

    style A fill:#4a9eff,stroke:#fff,color:#fff
    style B fill:#3c6496,stroke:#4a9eff,color:#fff
    style C fill:#647850,stroke:#4a9eff,color:#fff
    style D fill:#96783c,stroke:#4a9eff,color:#fff
    style E fill:#3c7882,stroke:#4a9eff,color:#fff
    style F fill:#ff6b6b,stroke:#4a9eff,color:#fff
    style G fill:#825082,stroke:#4a9eff,color:#fff
    style I fill:#ff6b6b,stroke:#4a9eff,color:#fff
    style J fill:#787846,stroke:#4a9eff,color:#fff
    style L fill:#4a9eff,stroke:#fff,color:#fff
```

## Phase Documentation
- <a id="phase-1"></a>[1.Initial Setup & Input Validation.md](./1.Initial%20Setup%20&%20Input%20Validation.md)
- <a id="phase-2"></a>[2.Context State Updates.md](./2.Context%20State%20Updates.md)
- <a id="phase-3"></a>[3.Navigation.md](./3.Navigation.md)
- <a id="phase-4"></a>[4.Job Search Fetch.md](./4.Job%20Search%20Fetch.md)
- <a id="phase-5"></a>[5.Travel Details Fetch.md](./5.Travel%20Details%20Fetch.md)
- <a id="phase-6"></a>[6.Display Results.md](./6.Display%20Results.md)
