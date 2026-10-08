import collections
import datetime
import json
import statistics
import subprocess

REPO = "remoteoss/remote-flows"
WORKFLOW = "e2e-setup-timing.yml"
STEP_BY_APPROACH = {
    "apt": "Install Playwright system dependencies",
    "container": "Initialize containers",
}


def gh(path):
    out = subprocess.run(["gh", "api", path], check=True, capture_output=True, text=True)
    return json.loads(out.stdout)


def parse(ts):
    return datetime.datetime.fromisoformat(ts.replace("Z", "+00:00"))


def window(hour):
    if 6 <= hour < 12:
        return "06-12 UTC (EU morning)"
    if 12 <= hour < 18:
        return "12-18 UTC (EU afternoon / US morning)"
    if 18 <= hour < 24:
        return "18-24 UTC (US afternoon)"
    return "00-06 UTC (night)"


samples = collections.defaultdict(list)
runs = gh(f"repos/{REPO}/actions/workflows/{WORKFLOW}/runs?per_page=100")["workflow_runs"]
for run in runs:
    for job in gh(f"repos/{REPO}/actions/runs/{run['id']}/jobs?per_page=100")["jobs"]:
        approach = job["name"].split()[0]
        step_name = STEP_BY_APPROACH.get(approach)
        for step in job["steps"]:
            if step["name"] == step_name and step["completed_at"]:
                started = parse(step["started_at"])
                seconds = (parse(step["completed_at"]) - started).total_seconds()
                samples[(window(started.hour), approach)].append(seconds)

print(f"{len(runs)} runs\n")
print(f"{'window':40} {'approach':10} {'n':>4} {'median':>7} {'p90':>6} {'max':>6} {'>60s':>5}")
for (win, approach), values in sorted(samples.items()):
    values.sort()
    p90 = values[min(len(values) - 1, int(len(values) * 0.9))]
    slow = sum(v > 60 for v in values)
    print(
        f"{win:40} {approach:10} {len(values):4} {statistics.median(values):6.0f}s "
        f"{p90:5.0f}s {max(values):5.0f}s {slow:5}"
    )
