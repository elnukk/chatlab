import Link from 'next/link';
import FeedbackFormClient from '@/components/FeedbackFormClient';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="font-semibold text-gray-900">ChatLab</span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-6 py-20 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 leading-tight">
          Embed AI chatbots in Qualtrics surveys
        </h1>
        <p className="text-lg text-gray-600 mt-4 max-w-2xl">
          A platform for researchers who need to run chatbot
          experiments. Create a system prompt, embed an iframe in Qualtrics, and
          collect conversation data. Any URL parameter becomes a template
          variable in your prompt.
        </p>
        <div className="mt-8">
          <Link
            href="/login"
            className="inline-block bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            Create an experiment
          </Link>
        </div>
      </header>

      {/* How it works */}
      <section className="px-6 py-16 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">
            How it works
          </h2>

          <div className="space-y-12">
            {/* Step 1 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-medium">
                  1
                </span>
                <h3 className="text-lg font-semibold text-gray-900">
                  Write a system prompt with template variables
                </h3>
              </div>
              <p className="text-gray-600 ml-10 mb-4">
                Use <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">{'{{variable_name}}'}</code> anywhere
                in your system prompt. These variables get replaced with values
                from URL parameters at runtime — including data piped directly from Qualtrics.
              </p>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 ml-10 text-sm font-mono text-gray-700 overflow-x-auto">
{`You are a chatbot assistant. The participant's name is {{name}}
and they work as a {{occupation}}.

{{#if persona}}Behave as a {{persona}} advisor.{{/if}}

Ask them about their experience in their field.`}
              </pre>
            </div>

            {/* Step 2 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-medium">
                  2
                </span>
                <h3 className="text-lg font-semibold text-gray-900">
                  Embed in Qualtrics with URL parameters
                </h3>
              </div>
              <p className="text-gray-600 ml-10 mb-4">
                In Qualtrics, add a question and paste this JavaScript in the
                question&apos;s JavaScript editor. It creates an iframe and passes
                participant data as URL parameters. Every parameter
                (except <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">experiment_id</code> and{' '}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">participant_id</code>) becomes
                a template variable in your system prompt.
              </p>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 ml-10 text-sm font-mono text-gray-700 overflow-x-auto">
{`Qualtrics.SurveyEngine.addOnload(function () {
  var participantId = "\${e://Field/ResponseID}";
  var name = "\${e://Field/name}";
  var occupation = "\${e://Field/occupation}";

  var iframeUrl =
    "https://chat2survey.com/chat" +
    "?experiment_id=YOUR_EXPERIMENT_ID" +
    "&participant_id=" + encodeURIComponent(participantId) +
    "&name=" + encodeURIComponent(name) +
    "&occupation=" + encodeURIComponent(occupation) +
    "&persona=friendly";

  var iframe = document.createElement("iframe");
  iframe.src = iframeUrl;
  iframe.style.width = "100%";
  iframe.style.height = "600px";
  iframe.style.border = "none";

  this.getQuestionContainer().appendChild(iframe);
});`}
              </pre>
              <p className="text-gray-500 text-sm ml-10 mt-3">
                Qualtrics replaces <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">{'${e://Field/name}'}</code> and{' '}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">{'${e://Field/occupation}'}</code> with
                the participant&apos;s actual responses or embedded data. Those values then fill in{' '}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">{'{{name}}'}</code> and{' '}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">{'{{occupation}}'}</code> in
                your system prompt. You can pass as many parameters as you need.
              </p>
            </div>

            {/* Step 3 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-medium">
                  3
                </span>
                <h3 className="text-lg font-semibold text-gray-900">
                  Collect and export conversation data
                </h3>
              </div>
              <p className="text-gray-600 ml-10">
                View conversations in the admin dashboard. Export all data as
                CSV, JSON, or JSONL. Each row includes the participant ID,
                message role, content, and timestamp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key details */}
      <section className="px-6 py-16 border-t border-gray-200 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Details</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <dt className="font-medium text-gray-900">LLM providers</dt>
              <dd className="text-sm text-gray-600 mt-1">
                OpenAI (GPT-4, GPT-4o, etc.) and Anthropic (Claude). Bring your
                own API key per experiment.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Template variables</dt>
              <dd className="text-sm text-gray-600 mt-1">
                Any URL parameter passed to the chat page is available as{' '}
                <code className="bg-white px-1 py-0.5 rounded text-xs font-mono border border-gray-200">
                  {'{{param_name}}'}
                </code>{' '}
                in your system prompt. Supports conditional blocks with{' '}
                <code className="bg-white px-1 py-0.5 rounded text-xs font-mono border border-gray-200">
                  {'{{#if var}}...{{/if}}'}
                </code>.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Message limits</dt>
              <dd className="text-sm text-gray-600 mt-1">
                Set a max number of messages per conversation. When the limit is
                reached, the chat shows a configurable completion message.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Seed messages</dt>
              <dd className="text-sm text-gray-600 mt-1">
                Configure a first message that appears before the participant
                types anything. Useful for setting context or giving
                instructions.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">CORS / allowed origins</dt>
              <dd className="text-sm text-gray-600 mt-1">
                Restrict which domains can embed your chat. Typically your
                Qualtrics domain (e.g.{' '}
                <code className="bg-white px-1 py-0.5 rounded text-xs font-mono border border-gray-200">
                  stanforduniversity.qualtrics.com
                </code>
                ).
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Data export</dt>
              <dd className="text-sm text-gray-600 mt-1">
                Export all conversations as CSV (one row per message), JSON
                (grouped by participant), or JSONL.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Feedback */}
      <section className="px-6 py-16 border-t border-gray-200" id="feedback">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Feedback</h2>
          <p className="text-gray-600 mb-6">
            This is an early-stage project. If you have questions, feature
            requests, or run into issues, let us know.
          </p>
          <FeedbackForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-400">
          Chatbot experiment platform
        </div>
      </footer>
    </div>
  );
}

function FeedbackForm() {
  return <FeedbackFormClient />;
}
