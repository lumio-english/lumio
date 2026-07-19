/**
 * Lumio English -- standalone AI writing feedback backend
 *
 * A separate, minimal Apps Script project used ONLY for the
 * professional dashboard's "Get Feedback" button. Kept isolated from
 * the main Lumio backend (roster/schedule/leads/progress sync) on
 * purpose -- that project got stuck in a broken authorization state
 * for external web requests specifically (UrlFetchApp), and rather
 * than risk disrupting everything that already works fine there, this
 * is a clean project with nothing else attached to it.
 *
 * SETUP:
 *   1. script.google.com -> New project. Paste this whole file in.
 *   2. Gear icon (Project Settings) -> Script Properties -> Add
 *      script property: name GROQ_API_KEY, value = your key from
 *      console.groq.com.
 *   3. Function dropdown -> testGroqAuth -> Run. Click through the
 *      permission popup (Allow). This grants the one-time
 *      authorization this project needs.
 *   4. Deploy -> New deployment -> Web app. Execute as: Me. Who has
 *      access: Anyone. Deploy. Copy the URL it gives you.
 *   5. In lumio-pro-dashboard.html, find AI_FEEDBACK_URL near the top
 *      of the script and paste this new URL in as its value.
 */

function testGroqAuth() {
  var result = writingFeedback_({ prompt: "test", answer: "This is a test answer to trigger the authorization prompt.", minWords: 5 });
  Logger.log(result);
}

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) body = JSON.parse(e.postData.contents);
    var action = (e && e.parameter) ? e.parameter.action : null;
    if (action === "writingFeedback") return jsonResponse_(writingFeedback_(body));
    return jsonResponse_({ ok: false, error: "Unknown action: " + action });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  return jsonResponse_({ ok: true, message: "Lumio AI feedback backend is running. POST ?action=writingFeedback." });
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function writingFeedback_(body) {
  var apiKey = PropertiesService.getScriptProperties().getProperty("GROQ_API_KEY");
  if (!apiKey) {
    return { ok: false, error: "No Groq API key set up yet. In the Apps Script editor: Project Settings -> Script Properties -> add GROQ_API_KEY with your key from console.groq.com." };
  }
  var prompt = String(body.prompt || "").slice(0, 500);
  var answer = String(body.answer || "").slice(0, 1000);
  var minWords = Number(body.minWords) || 0;
  if (!answer.trim()) {
    return { ok: false, error: "No answer to review yet." };
  }

  var systemPrompt = "You are an English teacher giving feedback on a young English-language " +
    "learner's short writing answer. The student is a child learning English as a second " +
    "language. Your feedback MUST directly reference their actual writing, not generic advice. " +
    "Structure your reply as exactly this: " +
    "(1) One short genuinely positive sentence about their effort or something they got right. " +
    "(2) Point out 1-3 SPECIFIC errors by quoting the exact word or phrase they wrote and giving " +
    "the correct version, in the form: you wrote \"X\", try \"Y\" instead. Cover grammar, spelling, " +
    "or word choice, only for mistakes actually present in their answer. " +
    "(3) One short encouraging closing sentence. " +
    "If their answer has no real, readable English words or sentences at all (for example random " +
    "keyboard mashing), skip step 2 and instead gently tell them to write real English words and " +
    "sentences about the topic, with one simple example sentence they could use to start. " +
    "Keep language simple enough for a child, warm, never harsh. Do not use markdown formatting.";
  var userPrompt = "Writing prompt: " + prompt + "\n" +
    (minWords ? "Expected length: at least " + minWords + " words.\n" : "") +
    "Student's actual answer (quote from this directly): " + answer;

  var payload = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.5,
    max_tokens: 260
  };

  try {
    var res = UrlFetchApp.fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "post",
      contentType: "application/json",
      headers: { "Authorization": "Bearer " + apiKey },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    var code = res.getResponseCode();
    var data = JSON.parse(res.getContentText());
    if (code !== 200) {
      var msg = (data.error && data.error.message) ? data.error.message : ("Groq API returned status " + code);
      return { ok: false, error: msg };
    }
    var feedback = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!feedback) return { ok: false, error: "Empty response from Groq." };
    return { ok: true, feedback: feedback.trim() };
  } catch (err) {
    return { ok: false, error: "Request to Groq failed: " + String(err) };
  }
}

