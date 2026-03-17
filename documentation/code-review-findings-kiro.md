# Code Review: Excessive Safeguards & Simplification Opportunities

---

## 1. Duplicate password validation logic (client vs server)

**Files:** `client/src/util/AuthValidation.js` · `server/src/util/validatePassword.js`

Both files define an identical `passwordRules` object, but apply different rules:

- The server requires **all 5 rules** to pass (`validatePassword.js`).
- The client only requires **length ≥ 8 + any 2 rules** (`AuthValidation.js`).

This means a password can pass client-side validation but fail on the server, giving the user a confusing experience. The rules should be unified and ideally shared from `shared/` (which already exists for `normalizeText`).

---

## 2. `validateAllowedFields` returns `""` on success instead of `null`/`undefined`

**File:** `server/src/util/validateAllowedFields.js`

The function returns an empty string `""` on success. The caller in `validateUserRegistration.js` then does:

```js
if (disallowed) errors.push(disallowed);
```

An empty string is falsy, so this works — but it's a fragile contract. Returning `null` on success would be more explicit and consistent with every other validator in the codebase.

---

## 3. Redundant `if/else` wrapping the entire `searchJobs` controller

**File:** `server/src/controllers/jobData.js`

The entire success path is wrapped in an `else` block after an early-return error check:

```js
if (connectionError) {
  ...
  return next(createHttpError(503, ...));
} else {
  // entire function body
}
```

Since the `if` branch always returns, the `else` is unnecessary and adds an extra level of indentation for the whole function body. Remove the `else` and dedent.

---

## 4. Redundant empty-array check before `forEach` in `jobData.js`

**File:** `server/src/controllers/jobData.js`

```js
if (cachedJobsPerSearchString.length > 0) {
  cachedJobsPerSearchString.forEach((job) => { ... });
}
```

`forEach` on an empty array is a no-op. The guard is unnecessary.

Same pattern appears a few lines later:

```js
if (cachedResult.cachedJobsPerSearchString.length > 0) {
  fetchedJobs = [...cachedResult.cachedJobsPerSearchString];
}
```

This can just be `fetchedJobs = cachedResult.cachedJobsPerSearchString;` (or spread without the guard).

---

## 5. Manual SQL parameter indexing in `profile.js`

**File:** `server/src/controllers/profile.js`

The controller manually tracks a counter `i` to build parameterized query strings:

```js
let i = 1;
setParts.push(`${key} = ${i}`); // should be $1, $2, etc.
values.push(value);
i++;
```

Note the placeholder is missing the `$` — it should be `$${i}`. Beyond the bug risk, this pattern is fragile. Using `map` with index would be cleaner and less error-prone:

```js
const setParts = providedProfileKeys.map((key, idx) => `${key} = $${idx + 1}`);
const values = providedProfileKeys.map((key) => profileFields[key]);
```

---

## 6. `profile.js` re-fetches the full user after update unnecessarily

**File:** `server/src/controllers/profile.js`

After updating the user, the controller runs a large `LEFT JOIN` query to reconstruct the full user object including favorites. This is the same query used at login. For a profile update (name, address, password), re-fetching all favorites via a join is overkill. The updated fields could be returned directly from the update or fetched with a simpler query.

---

## 7. Excessive `?.` optional chaining on guaranteed refs in `Profile.jsx`

**File:** `client/src/pages/Profile/Profile.jsx`

Refs are initialized with `useRef("")` and the inputs are always rendered, so `.current` is always set. Yet the code uses optional chaining everywhere:

```js
const first_name = cleanUpText(first_nameInputRef?.current.value);
const currentPassword = currentPasswordInputRef?.current?.value;
```

The `?.` on the ref itself is unnecessary noise. Either use plain `.current.value` or, better, switch to controlled inputs with `useState` to eliminate refs entirely.

---

## 8. `useEffect` populating refs is redundant

**File:** `client/src/pages/Profile/Profile.jsx`

```js
useEffect(() => {
  if (first_nameInputRef.current)
    first_nameInputRef.current.value = user.first_name ?? "";
  ...
}, [user]);
```

The inputs already set `defaultValue={user?.first_name || ""}`. Imperatively syncing refs via `useEffect` duplicates that initialization. Using controlled inputs (`useState`) would remove both the refs and this effect.

---

## 9. AI skill add via DOM manipulation in `SkillsSettings.jsx`

**File:** `client/src/components/SkillsSettings/SkillsSettings.jsx`

Adding an AI-suggested skill works by writing to the input ref and calling `handleInputSkill()`:

```js
onClick={() => {
  skillInputRef.current && (skillInputRef.current.value = s);
  handleInputSkill();
}}
```

This is a roundabout way to reuse `addSkill`. It should just call `addSkill(s)` directly, which is already defined and handles all the logic.

---

## 10. `handleSkillsResultsRef` pattern is over-engineered

**File:** `client/src/components/SkillsSettings/SkillsSettings.jsx`

A ref is used to store a callback so the `useFetch` `onReceived` handler can vary per operation:

```js
const handleSkillsResultsRef = useRef(() => {});
// ...
useFetch("/users/change-skills", (result) =>
  handleSkillsResultsRef.current(result),
);
```

This is a workaround for the fact that `useFetch` captures `onReceived` at hook-call time. A simpler approach: use a single `useState` for a pending success message, and handle the dispatch in the `onReceived` callback directly using the latest state via a functional update.

---

## 11. `useFetch` creates a new `AbortController` on every render

**File:** `client/src/hooks/useFetch.js`

```js
const controller = new AbortController();
const signal = controller.signal;
```

This runs on every render, creating a new controller each time. Only the controller from the last render is used by `cancelFetch`, but `cancelFetch` itself closes over the one from its render cycle. The controller should be in a `useRef` so it persists across renders and `cancelFetch` reliably cancels the active request.

---

## 12. `useFetch` `api/` guard throws at render time

**File:** `client/src/hooks/useFetch.js`

```js
if (route.includes("api/")) {
  throw Error("when using the useFetch hook...");
}
```

Throwing during render is an unhandled error that will crash the component tree. This should either be a `console.warn` or validated once in `performFetch` where it can be handled gracefully.

---

## 13. `validateJob` uses `Object.entries` filter + `some` where a targeted check is clearer

**File:** `server/src/util/validateJob.js`

```js
const hasNullValues = Object.entries(job)
  .filter(
    ([key]) =>
      key !== "travel_time" && key !== "least_transfers" && key !== "work_mode",
  )
  .some(([, value]) => value === null || value === undefined);
```

This iterates all keys to exclude a known set. It's clearer and more maintainable to define the required fields explicitly and check only those:

```js
const REQUIRED_FIELDS = ["id", "url", "title", "date_posted", ...];
const hasNullValues = REQUIRED_FIELDS.some(key => job[key] == null);
```

---

## 14. `cleanupInProgress` comment is stale/misleading

**File:** `server/src/util/cleanupInProgress.js`

The inline comment says "entries older than 3 minutes" but the expiration time is passed as a parameter — it's 20 minutes for the scraper and 3 minutes for RapidAPI. The hardcoded comment is wrong for half its callers and should be removed.

---

## 15. `findFilterOptions` in `filterJobs.js` uses five separate `Set`s with five separate loops merged into one

**File:** `client/src/util/filterJobs.js`

The code is fine functionally, but `hasApproximateLocation` is defined as a standalone function and then duplicated inline in `filterJobs`:

```js
function hasApproximateLocation(job) {
  return job.travel_time === null || job.travel_time === undefined;
}
// later...
(locationPrecision.has("approximate") && hasApproximateLocation(job)) ||
  (locationPrecision.has("precise") && !hasApproximateLocation(job));
```

The double-call to `hasApproximateLocation(job)` per filtered job can be replaced with a single `const isApprox = hasApproximateLocation(job)` before the filter conditions.

---

## 16. `addressTextsValidation.js` validates empty street silently

**File:** `client/src/util/addressTextsValidation.js`

An empty city triggers an error, but an empty street passes validation silently (falls through to the numbers-only check, which also passes for `""`). If street is required, it should have an explicit empty check. If it's optional, the numbers-only and invalid-chars checks should be skipped when the value is empty.

---

## Summary Table

| #   | File                                    | Issue Type                                    |
| --- | --------------------------------------- | --------------------------------------------- |
| 1   | AuthValidation.js / validatePassword.js | Duplicate + inconsistent logic                |
| 2   | validateAllowedFields.js                | Inconsistent return value                     |
| 3   | jobData.js                              | Unnecessary `else` after early return         |
| 4   | jobData.js                              | Redundant length guard before `forEach`       |
| 5   | profile.js                              | Manual SQL index tracking (bug-prone)         |
| 6   | profile.js                              | Over-fetching after update                    |
| 7   | Profile.jsx                             | Unnecessary optional chaining on refs         |
| 8   | Profile.jsx                             | `useEffect` duplicates `defaultValue`         |
| 9   | SkillsSettings.jsx                      | DOM manipulation instead of direct call       |
| 10  | SkillsSettings.jsx                      | Over-engineered ref-based callback pattern    |
| 11  | useFetch.js                             | `AbortController` recreated every render      |
| 12  | useFetch.js                             | Throwing during render                        |
| 13  | validateJob.js                          | Exclusion-based null check vs inclusion-based |
| 14  | cleanupInProgress.js                    | Stale hardcoded comment                       |
| 15  | filterJobs.js                           | Double call to `hasApproximateLocation`       |
| 16  | addressTextsValidation.js               | Silent pass on empty street                   |
