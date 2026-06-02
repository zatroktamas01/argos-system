import { useState } from "react";
import api from "../api/api";

type BackendTestResult = {
  name: string;
  passed: boolean;
  details: string;
  duration: number;
};

type TestResponse = {
  success: boolean;

  summary: {
    total: number;
    passed: number;
    failed: number;
  };

  results: BackendTestResult[];

  testedAt: string;
};

function TestCenterPage() {
  const [loading, setLoading] =
    useState(false);

  const [data, setData] =
    useState<TestResponse | null>(
      null
    );

  const [error, setError] =
    useState("");

  const runTests = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.post(
          "/api/tests/run"
        );

      setData(response.data);
    } catch (error) {
      console.error(error);

      setError(
        "Failed to run integration tests."
      );
    } finally {
      setLoading(false);
    }
  };

  const statusClass = (
    passed: boolean
  ) => {
    return passed
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
      : "bg-red-500/20 text-red-400 border-red-500/20";
  };

  return (
    <div>

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Test Center
        </h1>

        <p className="mt-2 text-slate-400">
          Enterprise integration testing dashboard
        </p>

      </div>

      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>

            <h2 className="text-xl font-semibold">
              Automated System Tests
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Validate backend, AI, MongoDB and auth workflows
            </p>

          </div>

          <button
            onClick={runTests}
            disabled={loading}
            className="rounded-lg bg-violet-600 px-6 py-3 font-medium transition hover:bg-violet-500 disabled:opacity-50"
          >
            {loading
              ? "Running Tests..."
              : "Run Integration Tests"}
          </button>

        </div>

      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {data && (

        <>

          <div className="mb-6 grid gap-6 md:grid-cols-4">

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Total Tests
              </p>

              <h3 className="mt-2 text-3xl font-bold">
                {data.summary.total}
              </h3>

            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6">

              <p className="text-sm text-emerald-400">
                Passed
              </p>

              <h3 className="mt-2 text-3xl font-bold text-emerald-400">
                {data.summary.passed}
              </h3>

            </div>

            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">

              <p className="text-sm text-red-400">
                Failed
              </p>

              <h3 className="mt-2 text-3xl font-bold text-red-400">
                {data.summary.failed}
              </h3>

            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Status
              </p>

              <h3
                className={`mt-2 text-xl font-bold ${
                  data.success
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {data.success
                  ? "SYSTEM HEALTHY"
                  : "ISSUES DETECTED"}
              </h3>

            </div>

          </div>

          <div className="space-y-4">

            {data.results.map(
              (result) => (

                <div
                  key={result.name}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-6"
                >

                  <div className="flex flex-wrap items-center justify-between gap-4">

                    <div>

                      <h3 className="text-lg font-semibold">
                        {result.name}
                      </h3>

                      <p className="mt-2 text-sm text-slate-400">
                        {result.details}
                      </p>

                    </div>

                    <div className="flex items-center gap-3">

                      <div className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300">
                        {result.duration} ms
                      </div>

                      <div
                        className={`rounded-lg border px-4 py-2 text-sm font-medium ${statusClass(
                          result.passed
                        )}`}
                      >
                        {result.passed
                          ? "PASS"
                          : "FAIL"}
                      </div>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

          <div className="mt-6 text-sm text-slate-500">
            Last test run:
            {" "}
            {new Date(
              data.testedAt
            ).toLocaleString()}
          </div>

        </>

      )}

    </div>
  );
}

export default TestCenterPage;