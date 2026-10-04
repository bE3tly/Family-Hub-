# Friction Log — Family Hub

## 1. Groq Model Deprecation
**Task attempted:** Integrating the Groq API using a model referenced in common documentation/examples.

**Steps taken:** Called the chat completions endpoint with model `llama-3.3-70b-versatile`, as initially documented in several existing examples.

**Expected vs. actual:** Expected a normal response; instead received a failed request with no clear error message indicating the model had been deprecated.

**Severity:** Medium — caused real debugging time before the root cause was identified.

**Workaround:** Searched Groq's official deprecation page directly, found the recommended replacement (`openai/gpt-oss-120b`), and switched to it.

**Suggestion:** Surface deprecation notices directly in the API's error response body when a deprecated model ID is called, rather than only in separate documentation.

---

## 2. Microphone Access Inside AI Studio's Embedded Preview
**Task attempted:** Testing microphone-based voice input inside Google AI Studio's embedded preview pane.

**Steps taken:** Implemented `SpeechRecognition` and tested the mic button directly in the AI Studio preview iframe.

**Expected vs. actual:** Expected a browser permission prompt; instead got silent failure with no prompt and no error shown.

**Severity:** Low–Medium — initially looked like a code bug before being identified as a preview sandbox limitation.

**Workaround:** Tested in a full separate browser tab instead of the embedded preview, where microphone permissions worked correctly.

**Suggestion:** Document that microphone/camera-dependent features may not work inside the embedded preview iframe due to Permissions-Policy restrictions.
